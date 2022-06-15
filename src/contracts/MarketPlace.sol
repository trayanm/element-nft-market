// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import './NFTCollection.sol';

contract Marketplace {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    using SafeMath for uint256;

    // Ownable: to handle fees and withdraw

    // Actions:
    // Submit offer
    // Cancel offer
    // Bid - use time-machine
    // Finish offer (fee)

    // Fees
    // TODO : ask about fees decimal value
    uint256 public constant FEE_SELL_PERCENTAGE = 3; // percentage of buy price

    // Enums
    enum AuctionType {
        FixedPrice, // buy it now only
        Dutch, // (not used for now)
        English // (not used for now)
    }

    enum AuctionStatus {
        //Approved, // ready for use
        Running, // in progress
        Closed, // closed with no buyer, need to revert funds
        Finished, // finished with buyer, need to revert funds
        Cancelled // canceled by seller, need to revert funds
    }

    // Definitions
    struct AuctionItem {
        address ownerAddress;
        address collectionAddress;
        uint256 auctionId; // auction Id, is generated
        uint256 id; // token Id, is given
        uint256 buyItNowPrice; // buy now buyItNowPrice in case of type FixedPrice. Zero means - no buy now. Mandatory if Fixed price
        uint256 reservedPrice; // buy out price below which the sell cannot happend (not used for now)
        uint256 initialPrice; // starting auction price (not used for now)
        uint256 minBidStep; // minimum allowed bid step. Zero means - no min (not used for now)
        uint256 maxBidStep; // maximum allowed bid step. Zero means - no max (not used for now)
        AuctionStatus auctionStatus;
        AuctionType auctionType;
    }

    struct CollectionItem {
        uint256 collectionId; // TODO : Check if needed
        address collectionAddress; // ERC721 token of the collection
        address ownerAddress;
        bool isUserCollection; // Describes whenever the collection is created by user. // TODO : Check if needed
    }

    // properties
    // msg.sender => generated funds
    mapping(address => uint256) public userFunds; // contains funds per user generated from sales. Bids will stored in other way

    // -- Events
    // emitted when an auction is craated
    event onAuctionCreated(uint256 indexed auctionId, uint256 indexed id);

    // emitted when is cancelled by the seller
    event onAuctionCancelled(uint256 indexed auctionId, uint256 indexed id);

    // emitted when the acution is finsied with succesfull purchase
    event onAuctionFinished(uint256 indexed auctionId, uint256 indexed id);

    // emitted when an auction is closed with no buyer
    event onAuctionClosed(uint256 indexed auctionId, uint256 indexed id);

    // enitted when an auction is bidded
    event onAuctionBid(uint256 indexed auctionId, uint256 bid);

    // emitted when an user claims his funds
    event onFundsClaimed(address indexed user, uint256 amount);

    // emitted when a collection is created
    event onCollectionCreated(uint256 indexed collectionId, address indexed collectionAddress, address indexed ownerAddress);
    // --

    // TODO : Optimize field positions
    // -- Auction fields
    // auctionId => AuctionItem
    mapping(uint256 => AuctionItem) auctionStore;
    uint256 public auctionCount = 0;
    // --

    // -- Collecction Fields
    // ownerAddress => (collectionId => isOwner)
    mapping(address => mapping(uint256 => bool)) usercollections;

    // Array of collection Contracts
    // collectionId => CollectionItem
    mapping(uint256 => CollectionItem) collectionStore;
    uint256 public collectionCount = 0;
    // --

    // collectionAddress => uint256[auctionId]
    mapping(address => uint256[]) collectionToAcutions;

    // -- Modifiers
    modifier requireCollectionOwner(uint256 _collectionId) {
        require(usercollections[msg.sender][_collectionId], 'Not collection owner');
        _;
    }

    // --

    constructor() public {
        // deploy NFT Collection contract
        // add newly deployed contract to collection array
        // _createCollection('TTM Collection', 'TTM', address(this), false);
    }

    // -- Collection management
    function createCollection(string memory _name, string memory _symbol) public returns (address) {
        return _createCollection(_name, _symbol, msg.sender, true);
    }

    function _createCollection(
        string memory _name,
        string memory _symbol,
        address _ownerAddress,
        bool _isUserCollection
    ) internal returns (address) {
        NFTCollection collectionContract = new NFTCollection(_name, _symbol);
        // grant role
        collectionContract.grantRole(MINTER_ROLE, msg.sender);
        // approve the creator by default
        collectionContract.setApprovalForAll(msg.sender, true);

        address _collectionAddress = address(collectionContract);

        uint256 _collectionId = collectionCount;
        collectionStore[_collectionId] = CollectionItem(_collectionId, _collectionAddress, _ownerAddress, _isUserCollection);
        collectionCount = collectionCount.add(1);

        usercollections[_ownerAddress][_collectionId] = true;

        emit onCollectionCreated(_collectionId, _collectionAddress, _ownerAddress);

        return _collectionAddress;
    }

    function getCollection(uint256 _collectionId) public view returns (CollectionItem memory) {
        return collectionStore[_collectionId];
    }

    // get items for collection (filters) TODO: think of EF like logic
    // get top items from collection ???
    // --

    // -- Auction Management
    function createAuction(
        address _collectionAddress,
        uint256 _id,
        uint256 _buyItNowPrice
    ) public {
        // transfer token to the market (this)
        NFTCollection nftCollection = NFTCollection(_collectionAddress);
        // nftCollection.transferFrom(msg.sender, address(this), _id); // TODO : use approve !!!

        // TODO : require token owner to be msg.sender
        require(msg.sender == nftCollection.ownerOf(_id), 'Not token owner');

        // the token owner is checked above

        // create auction
        uint256 _auctionId = auctionCount;
        auctionStore[_auctionId] = AuctionItem({
            ownerAddress: msg.sender,
            collectionAddress: _collectionAddress,
            auctionId: _auctionId,
            id: _id,
            buyItNowPrice: _buyItNowPrice,
            reservedPrice: 0,
            initialPrice: 0,
            minBidStep: 0,
            maxBidStep: 0,
            auctionStatus: AuctionStatus.Running,
            auctionType: AuctionType.FixedPrice
        });

        auctionCount = auctionCount.add(1);

        collectionToAcutions[_collectionAddress].push(_auctionId);

        emit onAuctionCreated(_auctionId, _id);
    }

    function getAuction(uint256 _auctionId) public view returns (AuctionItem memory) {
        return auctionStore[_auctionId];
    }

    // buy it now - handle user funds?
    function buyNowAuction(uint256 _auctionId) public payable {
        AuctionItem storage _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');
        require(_auction.ownerAddress != msg.sender, 'Auction owner cannot buy it');
        require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');
        require(_auction.buyItNowPrice > 0, 'Buy now is not allowed');

        require(msg.value == _auction.buyItNowPrice, 'Insufficient funds');

        uint256 fee = msg.value.mul(FEE_SELL_PERCENTAGE).div(100);

        NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);
        nftCollection.transferFrom(address(this), msg.sender, _auction.id);
        _auction.auctionStatus = AuctionStatus.Finished;
        uint256 userFund = msg.value.sub(fee);
        userFunds[_auction.ownerAddress] = userFunds[_auction.ownerAddress].add(userFund);

        // TODO : Handle bids
        // TODO : Handle buy request

        emit onAuctionFinished(_auctionId, _auction.id);
    }

    // cancel auction (auction owner) - handle user funds?
    function cancelAuction(uint256 _auctionId) public {
        AuctionItem storage _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');
        require(_auction.ownerAddress == msg.sender, 'Auction owner cannot cancel it');
        require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');

        NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);
        nftCollection.transferFrom(address(this), msg.sender, _auction.id);
        _auction.auctionStatus = AuctionStatus.Cancelled;

        // TODO : Handle bids
        // TODO : Handle buy request

        emit onAuctionCancelled(_auctionId, _auction.id);
    }

    // --

    // -- Auction handling
    // elapse ??? possible ReentrancyGuard
    // --

    // -- Auction actions
    // bid - handle user funds?
    function bid() public payable {
        // not supported
        revert();
        // emit onAuctionBid()
    }

    // --

    function claimFunds() public {
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
