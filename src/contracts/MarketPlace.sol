// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import '@openzeppelin/contracts/utils/structs/EnumerableMap.sol';
// import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

import './NFTCollection.sol';

contract MarketPlace is Ownable {
    // TODO : Add Access control
    // TODO : Add option enableDirectOffer
    // TODO : Add option enableAucion
    // TODO : Add option enableBuyNow

    using EnumerableMap for EnumerableMap.AddressToUintMap;
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _collectionIds;
    Counters.Counter private _auctionIds;
    Counters.Counter private _directOfferIds;

    bytes32 constant MINTER_ROLE = keccak256('MINTER_ROLE');

    // Fees
    uint256 constant FEE_SELL_PERCENTAGE = 3; // percentage of buy price
    uint256 profit;

    // Enums
    // enum AuctionType {
    //     FixedPrice, // buy it now only
    //     Dutch, // (not used for now)
    //     English // (not used for now)
    // }

    enum DirectOfferStatus {
        Open, // 0: open for acceptance
        Accepted, // 1: accepted by token owner
        Finished, // 2: finished with buyer
        Canceled // 3: canceled by seller
    }

    enum AuctionStatus {
        // Approved, // ready for use
        Running, // 0: in progress
        Closed, // 1: closed with no buyer, need to revert funds
        Finished, // 2: finished with buyer, need to revert funds
        Canceled // 3: canceled by seller, need to revert funds
    }

    // Definitions
    struct AuctionItem {
        address ownerAddress; // TODO : Check if needed
        address collectionAddress;
        address highestBidderAddress;
        uint256 highestBid;
        uint256 auctionId; // auction Id, is generated
        uint256 tokenId; // token Id, is given
        uint256 buyItNowPrice; // buy now buyItNowPrice in case of type FixedPrice. Zero means - no buy now. Mandatory if Fixed price
        // uint256 reservedPrice; // buy out price below which the sell cannot happend (not used for now)
        uint256 initialPrice; // starting auction price (not used for now)
        //uint256 minBidStep; // minimum allowed bid step. Zero means - no min (not used for now)
        //uint256 maxBidStep; // maximum allowed bid step. Zero means - no max (not used for now)
        uint256 endTime; // end time in seconds
        AuctionStatus auctionStatus;
        //AuctionType auctionType;
    }

    struct CollectionItem {
        uint256 collectionId; // TODO : Check if needed
        address collectionAddress; // ERC721 token of the collection
        address ownerAddress; // owner of the token
        string metaURI; // like in ERC721 token URI
    }
    
    // Only 1 valid offer per buyer
    // Buyer can send many offers
    // Seller can accept many offers
    // On buy performed - invalidate all other direct offers
    struct DirectOfferItem {
        address ownerAddress; // owner of the token // TODO : Check if needed
        address collectionAddress; // ERC721 token of the collection
        address buyerAddress; // offer send from address
        uint256 directOfferId; // TODO : Check if needed
        uint256 tokenId;
        uint256 offeredPrice;
        DirectOfferStatus directOfferStatus;
    }
	
	struct DirectOfferGroupItem {
		// _buyerAddress => _directOfferId  
        //uint256 length; //  TODO : Check
		EnumerableMap.AddressToUintMap buyerMap; // offer send from address
	}
	
    // properties
    // msg.sender => generated funds
    mapping(address => uint256) public userFunds; // contains funds per user generated from sales. Bids will stored in other way

    // auctionId => AuctionItem
    mapping(uint256 => AuctionItem) auctionStore;

    // directOfferId => DirectOfferItem
    mapping(uint256 => DirectOfferItem) directOfferStore;

    // collectionId => CollectionItem
    mapping(uint256 => CollectionItem) collectionStore;

    // uint256 public auctionCount = 0;
    // uint256 public collectionCount = 0;

    // ownerAddress => (collectionId => isOwner)
    // mapping(address => mapping(uint256 => bool)) userCollections;

    // collectionAddress => auctionId[]
    mapping(address => uint256[]) collectionToAcutions;

    // _collectionAddress => (_tokenId => _auctionId)
    mapping(address => mapping(uint256 => uint256)) tokenAuctions;

    // _collectionAddress => (_tokenId => DirectOfferGroupItem)
    mapping(address => mapping(uint256 => DirectOfferGroupItem)) tokenDirectOffers;

    // -- Events
    // emitted when an auction is craated
    event onAuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId);

    // emitted when is cancelled by the seller
    event onAuctionCancelled(uint256 indexed auctionId, uint256 indexed tokenId);

    // emitted when the acution is finsied with succesfull purchase
    event onAuctionFinished(uint256 indexed auctionId, uint256 indexed tokenId);

    // emitted when an auction is closed with no buyer
    event onAuctionClosed(uint256 indexed auctionId, uint256 indexed tokenId);

    // enitted when an auction is bidded
    event onAuctionBid(uint256 indexed auctionId, uint256 bid);

    // emitted when an user claims his funds
    // event onFundsClaimed(address indexed user, uint256 amount);

    // emitted when a collection is created
    event onCollectionCreated(uint256 indexed collectionId, address indexed collectionAddress, address indexed ownerAddress);
    // --

    // -- Modifiers
    // --

     constructor() public {
     }

     // -- Mint
     function mint(address _collectionAddress, string memory _tokenURI) external returns(uint256) {
        NFTCollection nftCollection = NFTCollection(_collectionAddress);

        uint256 _tokenId = nftCollection.externalMint(msg.sender, _tokenURI);

        return _tokenId;
     }

    //  function mintMany(address _collectionAddress, string[] memory _tokenURIList) external {
    //     NFTCollection nftCollection = NFTCollection(_collectionAddress);

    //     for (uint256 i = 0; i < _tokenURIList.length; i++) {
    //         nftCollection.externalMint(msg.sender, _tokenURIList[i]);
    //     }
    //  }
     // --

    // -- Collection management
    function createCollection(string memory _name, string memory _symbol, string memory _metaURI) external returns (address) {
        NFTCollection collectionContract = new NFTCollection(_name, _symbol);
        // grant role
        collectionContract.grantRole(MINTER_ROLE, msg.sender);
        // approve creator by default
        collectionContract.setApprovalForAll(msg.sender, true); // not applied for newly created tokens

        address _collectionAddress = address(collectionContract);

        _collectionIds.increment();
        uint256 _collectionId = _collectionIds.current();
        collectionStore[_collectionId] = CollectionItem(_collectionId, _collectionAddress, msg.sender, _metaURI);        

        // userCollections[msg.sender][_collectionId] = true;

        emit onCollectionCreated(_collectionId, _collectionAddress, msg.sender);

        return _collectionAddress;
    }

    function importCollection(address _collectionAddress, string memory _metaURI)external returns (address) {
        _collectionIds.increment();
        uint256 _collectionId = _collectionIds.current();
        collectionStore[_collectionId] = CollectionItem(_collectionId, _collectionAddress, msg.sender, _metaURI);        

        // userCollections[msg.sender][_collectionId] = true;

        emit onCollectionCreated(_collectionId, _collectionAddress, msg.sender);

        return _collectionAddress;
    }

    function getCollection(uint256 _collectionId) external view returns (CollectionItem memory) {
        return collectionStore[_collectionId];
    }

    function getCollectionCount() external view returns(uint256) {
        return _collectionIds.current();
    }
	// --

    // -- Auction Management
    function createAuction(
        address _collectionAddress,
        uint256 _tokenId,
        uint256 _initialPrice,
        uint256 _buyItNowPrice,
        uint256 _durationDays
    ) external {
        // transfer token to the market (this)
        NFTCollection nftCollection = NFTCollection(_collectionAddress);
        // nftCollection.transferFrom(msg.sender, address(this), _tokenId); // TODO : use approve !!!

        // _initialPrice or _buyItNowPrice should be above zero
        //require(_initialPrice + _buyItNowPrice > 0, 'Token price cannot be zero');

        // check token owner
        require(msg.sender == nftCollection.ownerOf(_tokenId), 'Not token owner');

        // check if MarketPlace is approved
        require(address(this) == nftCollection.getApproved(_tokenId), 'MarketPlace is not approved');

        // create auction twice
        require(tokenAuctions[_collectionAddress][_tokenId] == 0, 'Auction for this token exists');

        require(_durationDays > 0, 'Invalid duration');

        // create auction
        _auctionIds.increment();
        uint256 _auctionId = _auctionIds.current();
        auctionStore[_auctionId] = AuctionItem({
            ownerAddress: msg.sender,
            collectionAddress: _collectionAddress,
            highestBidderAddress: address(0),
            highestBid : 0,
            auctionId: _auctionId,
            tokenId: _tokenId,
            buyItNowPrice: _buyItNowPrice,
            //reservedPrice: 0,
            initialPrice: _initialPrice,
            //minBidStep: 0,
            //maxBidStep: 0,
            endTime: block.timestamp + (_durationDays * 1 days),
            auctionStatus: AuctionStatus.Running
            //auctionType: AuctionType.FixedPrice
        });

        collectionToAcutions[_collectionAddress].push(_auctionId);

        tokenAuctions[_collectionAddress][_tokenId] = _auctionId;

        // delete direct offer for specific token
        delete tokenDirectOffers[_collectionAddress][_tokenId];

        emit onAuctionCreated(_auctionId, _tokenId);
    }

    function getAuctionCount() external view returns(uint256) {
        return _auctionIds.current();
    }

    function getCollectionAuctions(address collectionAddress) external view returns (uint256[] memory) {
        return collectionToAcutions[collectionAddress];
    }

    function getAuction(uint256 _auctionId) public view returns (AuctionItem memory) {
        AuctionItem memory _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');        

        return _auction;
    }

    function getAuctionBy(address _collectionAddress, uint256 _tokenId) external view returns (AuctionItem memory) {
        uint256 _auctionId = tokenAuctions[_collectionAddress][_tokenId];

        return getAuction(_auctionId);
    }

    // buy it now - handle user funds?
    function buyNowAuction(uint256 _auctionId) external payable {
        AuctionItem storage _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');
        
        _checkAuction(_auction);
        
        if(_auction.auctionStatus == AuctionStatus.Running) {
            require(_auction.ownerAddress != msg.sender, 'Auction owner cannot buy it');
            // require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');
            require(_auction.buyItNowPrice > 0, 'Buy now is not allowed');

            require(msg.value == _auction.buyItNowPrice, 'Buy now price is greater');

            NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);

            // transfer from MarketPalce as approved
            nftCollection.transferFrom(_auction.ownerAddress, msg.sender, _auction.tokenId);

            // TODO : Approve to market after transfer
            // approve token to market
            // nftCollection.approve(address(this), _auction.tokenId);

            _auction.auctionStatus = AuctionStatus.Finished;

            uint256 fee = msg.value.mul(FEE_SELL_PERCENTAGE).div(100);
            uint256 userFund = msg.value.sub(fee);
            profit = profit.add(fee);
            userFunds[_auction.ownerAddress] = userFunds[_auction.ownerAddress].add(userFund);

            delete tokenAuctions[_auction.collectionAddress][_auction.tokenId]; // reset

            // TODO : Handle bids
            // TODO : Handle direct offers

            emit onAuctionFinished(_auctionId, _auction.tokenId);
        }        
    }

    // cancel auction (auction owner) - handle user funds?
    function cancelAuction(uint256 _auctionId) external {
        AuctionItem storage _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');

        _checkAuction(_auction);

        if(_auction.auctionStatus == AuctionStatus.Running) {
            require(_auction.ownerAddress == msg.sender, 'Only auction owner can cancel');
            // require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');

            //NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);
            //nftCollection.transferFrom(address(this), msg.sender, _auction.tokenId);
            _auction.auctionStatus = AuctionStatus.Canceled;

            delete tokenAuctions[_auction.collectionAddress][_auction.tokenId]; // reset

            // return prev bid
            // send _auction.highestBid to _auction.highestBidderAddress
            if(_auction.highestBid > 0 && _auction.highestBidderAddress != address(0)) {
                userFunds[_auction.highestBidderAddress] = userFunds[_auction.highestBidderAddress].add(_auction.highestBid);
            }

            emit onAuctionCancelled(_auctionId, _auction.tokenId);
        }
    }

    // --

    // -- Auction handling
    function checkAuction(uint256 _auctionId) external {
        AuctionItem storage _auction = auctionStore[_auctionId];

        //require(_auction.auctionId == _auctionId, 'Auction does not exists');

        _checkAuction(_auction);
    }
    // --

    // -- Auction actions
    // bid - handle user funds?
    function bidAuction(uint256 _auctionId) external payable {
        AuctionItem storage _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');

        _checkAuction(_auction);

        if(_auction.auctionStatus == AuctionStatus.Running) {
            require(_auction.ownerAddress != msg.sender, 'Auction owner cannot bid');
            require(_auction.highestBidderAddress != msg.sender, 'Already highest bidder');
            // require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');

            // current bid must be above initial price and above zero

            require(msg.value >= _auction.initialPrice , 'Bid is less than initial');
            require(msg.value > _auction.highestBid , 'Bid is less than highest');

            // return prev bid
            // send _auction.highestBid to _auction.highestBidderAddress
            if(_auction.highestBid > 0 && _auction.highestBidderAddress != address(0)) {
                userFunds[_auction.highestBidderAddress] = userFunds[_auction.highestBidderAddress].add(_auction.highestBid);
            }

            // load new bid
            _auction.highestBid = msg.value;
            _auction.highestBidderAddress = msg.sender;

            emit onAuctionBid(_auctionId, msg.value);
        }
    }

    // TODO : Ask how to execute over time or how to set gas storage to execute internaly
    function _checkAuction(AuctionItem storage _auction) private {
        // check timestamp

        if(_auction.auctionStatus == AuctionStatus.Running) {
            bool ended = _auction.endTime <= block.timestamp;

            if(ended) {
                NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);

                if(_auction.highestBid > _auction.initialPrice) {
                    _auction.auctionStatus = AuctionStatus.Finished;

                    // peform transfer
                    uint256 fee = _auction.highestBid.mul(FEE_SELL_PERCENTAGE).div(100);
                    uint256 userFund = _auction.highestBid.sub(fee);
                    profit = profit.add(fee);
                    userFunds[_auction.ownerAddress] = userFunds[_auction.ownerAddress].add(userFund);

                    // transfer from MarketPalce as approved
                    nftCollection.transferFrom(_auction.ownerAddress, msg.sender, _auction.tokenId);

                    // TODO : Approve to market after transfer

                    emit onAuctionFinished(_auction.auctionId, _auction.tokenId);
                }
                else {
                    _auction.auctionStatus = AuctionStatus.Closed;

                    // return money
                    // if(_auction.highestBid > 0 && _auction.highestBidderAddress != address(0)) {
                    //     userFunds[_auction.highestBidderAddress] = userFunds[_auction.highestBidderAddress].add(_auction.highestBid);
                    // }

                    emit onAuctionClosed(_auction.auctionId, _auction.tokenId);
                }
            }
        }        
    }

    // --

    // -- Direct offers
    function createDirectOffer(address _collectionAddress, uint256 _tokenId, uint256 _offeredPrice) external {
        NFTCollection nftCollection = NFTCollection(_collectionAddress);

        address _ownerAddress = nftCollection.ownerOf(_tokenId);

        // requrie not own token
        require(msg.sender != _ownerAddress, 'Already token owner');

        //require(_ownerAddress != address(0), 'Token without owner');

        // _offeredPrice should be above zero
        require(_offeredPrice > 0, 'Offered price cannot be zero');

        // require no active auction
        require(tokenAuctions[_collectionAddress][_tokenId] == 0, 'Auction for this token exists');

        // create direct offer
        _directOfferIds.increment();
        uint256 _directOfferId = _directOfferIds.current();
        directOfferStore[_directOfferId] = DirectOfferItem({
            ownerAddress : _ownerAddress,
            collectionAddress: _collectionAddress,
            buyerAddress: msg.sender,
            directOfferId: _directOfferId,
            tokenId: _tokenId, 
            offeredPrice: _offeredPrice,
            directOfferStatus: DirectOfferStatus.Open
        });

        tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.set(msg.sender, _directOfferId);
    }

    function getDirectOffersByOwner(address _collectionAddress, uint256 _tokenId) external view returns(DirectOfferItem[] memory) {
        NFTCollection nftCollection = NFTCollection(_collectionAddress);
        require(msg.sender == nftCollection.ownerOf(_tokenId), 'Not token owner');

       uint256 length = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.length();

        DirectOfferItem[] memory result = new DirectOfferItem[](length);

        for (uint256 i = 0; i < length; i++) {
            (, uint256 _directOfferId) = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.at(i);

            // visible only for buyer or seller
            result[i] = directOfferStore[_directOfferId];
        }

       return result;
    }

    function getDirectOfferByBuyer(address _collectionAddress, uint256 _tokenId) external view returns(DirectOfferItem memory){
        // sender is the buyer
        (bool success, uint256 _directOfferId) = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.tryGet(msg.sender);

        if(success)
        {
            //require(success, 'Offer not found');

            DirectOfferItem memory _directOffer = directOfferStore[_directOfferId];

            return _directOffer;
        }
    }

    // function getDirectOfferCount() external view returns(uint256) {
    //     // not used
    //     return _directOfferIds.current();
    // }

	// function getDirectOffer(uint256 _directOfferId) public view returns (DirectOfferItem memory) {
    //     DirectOfferItem memory _directOffer = directOfferStore[_directOfferId];

    //     require(_directOffer.directOfferId == _directOfferId, 'DirectOffer does not exists');

    //     // visible only for buyer or seller
    //     require(_directOffer.ownerAddress == msg.sender || _directOffer.buyerAddress == msg.sender, 'Only seller or buyer');

    //     return _directOffer;
    // }

    //  function getDirectOffers(address _collectionAddress, uint256 _tokenId) external view returns(DirectOfferItem[] memory) {
    //    uint256 length = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.length();

    //     DirectOfferItem[] memory result = new DirectOfferItem[](length);

    //     for (uint256 i = 0; i < length; i++) {
    //         (, uint256 _directOfferId) = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.at(i);

    //         // visible only for buyer or seller
    //         result[i] = getDirectOffer(_directOfferId);
    //     }

    //    return result;
    //  }

    //  function getDirectOfferBy(address _buyerAddress, address _collectionAddress, uint256 _tokenId) external view returns(DirectOfferItem memory) {
    //     uint256 _directOfferId = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.get(_buyerAddress);

    //     // visible only for buyer or seller
    //     return getDirectOffer(_directOfferId);
    //  }

    // function getDirectOffers(address _collectionAddress, uint256 _tokenId) external view returns(DirectOfferItem[] memory) {
    //     // TODO : Ask how to get list of DirectOfferItems
    //     uint256 length = tokenDirectOffers[_collectionAddress][_tokenId].length;

    //     if (length > 0) {
    //         for (uint256 i = 0; i < length; i++) {
                
    //         }            
    //     } 
    // }

    function cancelDirectOffer(address _collectionAddress, uint256 _tokenId) external {
        // sender is the buyer
        (bool success, uint256 _directOfferId) = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.tryGet(msg.sender);

        require(success, 'Offer not found');

        DirectOfferItem storage _directOffer = directOfferStore[_directOfferId];

        // require(_directOffer.directOfferId == _directOfferId, 'Offer not found');
        require(_directOffer.buyerAddress == msg.sender, 'Only offer bayer can cancel');
        require(_directOffer.directOfferStatus == DirectOfferStatus.Open, 'Offer is not open');

        _directOffer.directOfferStatus = DirectOfferStatus.Canceled;

        // remove direct offer by buyer
        tokenDirectOffers[_directOffer.collectionAddress][_directOffer.tokenId].buyerMap.remove(msg.sender);
    }

    function acceptDirectOffer(address _collectionAddress, uint256 _tokenId, address _buyerAddress) external {

        (bool success, uint256 _directOfferId) = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.tryGet(_buyerAddress);

        require(success, 'Offer not found');

        DirectOfferItem storage _directOffer = directOfferStore[_directOfferId];

        // require(_directOffer.directOfferId == _directOfferId, 'Offer not found');
        require(_directOffer.directOfferStatus == DirectOfferStatus.Open, 'Offer is not open');

        NFTCollection nftCollection = NFTCollection(_directOffer.collectionAddress);
        require(msg.sender == nftCollection.ownerOf(_directOffer.tokenId), 'Not token owner');
        
        // check if MarketPlace is approved
        require(address(this) == nftCollection.getApproved(_directOffer.tokenId), 'MarketPlace is not approved');

        _directOffer.directOfferStatus = DirectOfferStatus.Accepted;
    }

    function fulfillDirectOffer(address _collectionAddress, uint256 _tokenId) external payable {
        // sender is the buyer
        (bool success, uint256 _directOfferId) = tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.tryGet(msg.sender);

        require(success, 'Offer not found');

        DirectOfferItem storage _directOffer = directOfferStore[_directOfferId];

        // require(_directOffer.directOfferId == _directOfferId, 'Offer not found');
        require(_directOffer.directOfferStatus == DirectOfferStatus.Accepted, 'Offer is not accepted');
        require(_directOffer.buyerAddress == msg.sender, 'Only offer bayer can fullfill');
        require(msg.value == _directOffer.offeredPrice, 'Offered price is incorrect');

        NFTCollection nftCollection = NFTCollection(_directOffer.collectionAddress);

        // transfer from MarketPalce as buyer
        nftCollection.transferFrom(_directOffer.ownerAddress, _directOffer.buyerAddress, _directOffer.tokenId);

        // TODO : Approve to market after transfer        

        _directOffer.directOfferStatus = DirectOfferStatus.Finished;

        uint256 fee = msg.value.mul(FEE_SELL_PERCENTAGE).div(100);
        uint256 userFund = msg.value.sub(fee);
        userFunds[_directOffer.ownerAddress] = userFunds[_directOffer.ownerAddress].add(userFund);

        // delete direct offer for specific token
        delete tokenDirectOffers[_directOffer.collectionAddress][_directOffer.tokenId];
    }
    // --

    function claimFunds() external {
        require(userFunds[msg.sender] > 0, 'No funds to be claimed');

        uint256 fundsToClaim = userFunds[msg.sender];
        userFunds[msg.sender] = 0;
        payable(msg.sender).transfer(fundsToClaim);

        // emit onFundsClaimed(msg.sender, fundsToClaim);
    }

    function withdrawProfit() public onlyOwner() {
        uint256 _profit = profit;
        profit = 0;

        address payable to = payable(msg.sender);
        to.transfer(_profit);
    }

    function getProfitAmount() public onlyOwner() returns(uint256) {
        return profit;
    }

    // Fallback: reverts if Ether is sent to this smart-contract by mistake
    fallback() external {
        revert();
    }
}
