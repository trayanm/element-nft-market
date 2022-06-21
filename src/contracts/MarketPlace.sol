// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
 import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
//import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

import './NFTCollection.sol';

contract MarketPlace {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _collectionIds;
    Counters.Counter private _auctionIds;

    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    // Fees
    uint256 public constant FEE_SELL_PERCENTAGE = 3; // percentage of buy price

    // Enums
    // enum AuctionType {
    //     FixedPrice, // buy it now only
    //     Dutch, // (not used for now)
    //     English // (not used for now)
    // }

    enum AuctionStatus {
        //Approved, // ready for use
        Running, // 0: in progress
        Closed, // 1: closed with no buyer, need to revert funds
        Finished, // 2: finished with buyer, need to revert funds
        Cancelled // 3: canceled by seller, need to revert funds
    }

    // Definitions
    struct AuctionItem {
        address ownerAddress;
        address collectionAddress;
        uint256 auctionId; // auction Id, is generated
        uint256 tokenId; // token Id, is given
        uint256 buyItNowPrice; // buy now buyItNowPrice in case of type FixedPrice. Zero means - no buy now. Mandatory if Fixed price
        //uint256 reservedPrice; // buy out price below which the sell cannot happend (not used for now)
        uint256 initialPrice; // starting auction price (not used for now)
        //uint256 minBidStep; // minimum allowed bid step. Zero means - no min (not used for now)
        //uint256 maxBidStep; // maximum allowed bid step. Zero means - no max (not used for now)
        AuctionStatus auctionStatus;
        //AuctionType auctionType;
    }

    struct CollectionItem {
        uint256 collectionId; // TODO : Check if needed
        address collectionAddress; // ERC721 token of the collection
        address ownerAddress;
        string metaURI; // like in ERC721 token URI
    }

    struct DirectOffer{
        address from;
        uint256 collectionId;
        uint256 tokenId;
        uint256 offeredPrice;
    }

    // properties
    // msg.sender => generated funds
    mapping(address => uint256) public userFunds; // contains funds per user generated from sales. Bids will stored in other way

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
    event onFundsClaimed(address indexed user, uint256 amount);

    // emitted when a collection is created
    event onCollectionCreated(uint256 indexed collectionId, address indexed collectionAddress, address indexed ownerAddress);
    // --

    // auctionId => AuctionItem
    mapping(uint256 => AuctionItem) auctionStore;

    // auctionId => (collectionId => AuctionItem)
    // mapping(uint256 => mapping(uint256 => AuctionItem)) auctionStoreExt;

    // collectionId => CollectionItem
    mapping(uint256 => CollectionItem) collectionStore;

    // uint256 public auctionCount = 0;
    // uint256 public collectionCount = 0;

    // ownerAddress => (collectionId => isOwner)
    mapping(address => mapping(uint256 => bool)) usercollections;

    // collectionAddress => auctionId[]
    mapping(address => uint256[]) collectionToAcutions;

    // _collectionAddress => _tokenId => _auctionId
    mapping(address=> mapping(uint256 => uint256)) tokenAuctions;
    // 

    // -- Modifiers
    // modifier requireCollectionOwner(uint256 _collectionId) {
    //     require(usercollections[msg.sender][_collectionId], 'Not collection owner');
    //     _;
    // }
    // --

    // constructor() public {
    //     // deploy NFT Collection contract
    //     // add newly deployed contract to collection array
    //     // _createCollection('TTM Collection', 'TTM', address(this), false);
    // }

    // -- Collection management
    // function createCollection(string memory _name, string memory _symbol) public returns (address) {
    //     return _createCollection(_name, _symbol);
    // }

    function createCollection(string memory _name, string memory _symbol, string memory _metaURI) external returns (address) {
        NFTCollection collectionContract = new NFTCollection(_name, _symbol);
        // grant role
        collectionContract.grantRole(MINTER_ROLE, msg.sender);
        // approve creator by default
        // collectionContract.setApprovalForAll(msg.sender, true); // not applied for newly created tokens

        address _collectionAddress = address(collectionContract);

        _collectionIds.increment();
        uint256 _collectionId = _collectionIds.current();
        collectionStore[_collectionId] = CollectionItem(_collectionId, _collectionAddress, msg.sender, _metaURI);        

        usercollections[msg.sender][_collectionId] = true;

        emit onCollectionCreated(_collectionId, _collectionAddress, msg.sender);

        return _collectionAddress;
    }

    function importCollection(address _collectionAddress, string memory _metaURI)external returns (address) {
        // This method is not implemented
        revert();
        _collectionIds.increment();
        uint256 _collectionId = _collectionIds.current();
        collectionStore[_collectionId] = CollectionItem(_collectionId, _collectionAddress, msg.sender, _metaURI);        

        usercollections[msg.sender][_collectionId] = true;

        emit onCollectionCreated(_collectionId, _collectionAddress, msg.sender);

        return _collectionAddress;
    }

    function getCollection(uint256 _collectionId) external view returns (CollectionItem memory) {
        return collectionStore[_collectionId];
    }

    function getCollectionCount() external view returns(uint256){
        return _collectionIds.current();
    }
    function getAuctionCount() external view returns(uint256){
        return _auctionIds.current();
    }

    // --

    // -- Auction Management
    function createAuction(
        address _collectionAddress,
        uint256 _tokenId,
        uint256 _initialPrice,
        uint256 _buyItNowPrice
    ) external {
        // transfer token to the market (this)
        NFTCollection nftCollection = NFTCollection(_collectionAddress);
        // nftCollection.transferFrom(msg.sender, address(this), _tokenId); // TODO : use approve !!!

        // _initialPrice or _buyItNowPrice should be above zero
        require(_initialPrice + _buyItNowPrice > 0, 'Token Price cannot be zero');

        // check token owner
        require(msg.sender == nftCollection.ownerOf(_tokenId), 'Not token owner');

        // check if MarketPlace is approved
        require(address(this) == nftCollection.getApproved(_tokenId), 'MarketPlace is not approved');

        // create auction twice
        require(tokenAuctions[_collectionAddress][_tokenId] == 0, 'Auction for this token exists');

        // create auction
        _auctionIds.increment();
        uint256 _auctionId = _auctionIds.current();
        auctionStore[_auctionId] = AuctionItem({
            ownerAddress: msg.sender,
            collectionAddress: _collectionAddress,
            auctionId: _auctionId,
            tokenId: _tokenId,
            buyItNowPrice: _buyItNowPrice,
            //reservedPrice: 0,
            initialPrice: _initialPrice,
            //minBidStep: 0,
            //maxBidStep: 0,
            auctionStatus: AuctionStatus.Running
            //auctionType: AuctionType.FixedPrice
        });

        collectionToAcutions[_collectionAddress].push(_auctionId);

        tokenAuctions[_collectionAddress][_tokenId] = _auctionId;

        emit onAuctionCreated(_auctionId, _tokenId);
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
        require(_auction.ownerAddress != msg.sender, 'Auction owner cannot buy it');
        require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');
        require(_auction.buyItNowPrice > 0, 'Buy now is not allowed');

        require(msg.value == _auction.buyItNowPrice, 'Buy now price is greater');

        uint256 fee = msg.value.mul(FEE_SELL_PERCENTAGE).div(100);

        NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);

        // transfer from MarketPalce as approved
        nftCollection.transferFrom(_auction.ownerAddress, msg.sender, _auction.tokenId);

        _auction.auctionStatus = AuctionStatus.Finished;
        uint256 userFund = msg.value.sub(fee);
        userFunds[_auction.ownerAddress] = userFunds[_auction.ownerAddress].add(userFund);

        delete tokenAuctions[_auction.collectionAddress][_auction.tokenId]; // reset

        // TODO : Handle bids
        // TODO : Handle buy request

        emit onAuctionFinished(_auctionId, _auction.tokenId);
    }

    // cancel auction (auction owner) - handle user funds?
    function cancelAuction(uint256 _auctionId) external {
        AuctionItem storage _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');
        require(_auction.ownerAddress == msg.sender, 'Only auction owner can cancel');
        require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');

        NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);
        //nftCollection.transferFrom(address(this), msg.sender, _auction.tokenId);
        _auction.auctionStatus = AuctionStatus.Cancelled;

        delete tokenAuctions[_auction.collectionAddress][_auction.tokenId]; // reset

        // TODO : Handle bids
        // TODO : Handle buy request

        emit onAuctionCancelled(_auctionId, _auction.tokenId);
    }

    // --

    // -- Auction handling
    // elapse ??? possible ReentrancyGuard
    // --

    // -- Auction actions
    // bid - handle user funds?
    function bid() external payable {
        // not supported
        revert();
        // emit onAuctionBid()
    }

    // --

    // -- Direct offers
    function createDirectOffer(address _collectionAddress, uint256 _tokenId, uint256 _offeredPrice) external{
        NFTCollection nftCollection = NFTCollection(_collectionAddress);

        // requrie not own token
        require(msg.sender != nftCollection.ownerOf(_tokenId), 'Already token owner');

        // require not active auction


        // check already better direct offer?
    }

    function getDirectOffers(uint256 _collectionId, uint256 _tokenId) external view{

    }

    function cancelDirectOffer(uint256 _directOfferId) external{
        // by DirecOffer.from
    }
    function acceptDirectOffer(uint256 _directOfferId) external{
        // by token owner
    }

    function fulfillDirectOffer(uint256 _directOfferId) external payable{

    }
    // --

    function claimFunds() external {
        require(userFunds[msg.sender] > 0, 'This user has no funds to be claimed');

        uint256 fundsToClaim = userFunds[msg.sender];
        userFunds[msg.sender] = 0;
        payable(msg.sender).transfer(fundsToClaim);

        emit onFundsClaimed(msg.sender, fundsToClaim);
    }

    // Fallback: reverts if Ether is sent to this smart-contract by mistake
    fallback() external {
        revert();
    }
}
