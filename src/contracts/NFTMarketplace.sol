// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./NFTCollection.sol";

contract NFTMarketplace is Ownable {
    using SafeMath for uint256;

    // Ownable: to handle fees and withdraw

    // Actions:
    // Deploy Collection (fee)
    // Submit offer
    // Cancel offer
    // Bid - use time-machine
    // Finish offer (fee)

    // Fees
    // TODO : ask about fees decimal value
    uint256 public constant FEE_COLLECTION_CREATE = 200;
    uint256 public constant FEE_SELL = 100;

    // Enums
    enum AuctionType {
        FixedPrice,
        Dutch,
        English
    }

    enum AuctionStatus {
        Approved, // ready for use
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
        uint256 reservedPrice; // buy out price below which the sell cannot happend
        uint256 initialPrice; // starting auction price
        uint256 minBidStep; // minimum allowed bid step. Zero means - no min
        uint256 maxBidStep; // maximum allowed bid step. Zero means - no max
        AuctionStatus auctionStatus;
        AuctionType auctionType;
    }

    struct CollectionItem {
        uint256 collectionId;
        address tokenAddress; // ERC721 token of the collection
        address ownerAddress;
        bool isUserCollection; // Describes whenever the collection is created by user
    }

    // properties
    mapping(address => uint256) public userFunds; // contains funds per user generated from sales. Bids will stored in other way

    // #region Events
    // emited when an auction is craated
    event onAuctionCreated(uint256 indexed auctionId, uint256 indexed id);

    // emited when is cancelled by the seller
    event onAuctionCancelled(uint256 indexed auctionId, uint256 indexed id);

    // emited when the acution is finsied with succesfull purchase
    event onAuctionFinished(uint256 indexed auctionId, uint256 indexed id);

    // emited when an auction is closed with no buyer
    event onAuctionClosed(uint256 indexed auctionId, uint256 indexed id);

    // emited when an user claims his funds
    event onFundsClaimed(address indexed user, uint256 amount);

    event onCollectionCreated(
        uint256 indexed collectionId,
        address indexed collectionAddress,
        address indexed ownerAddress
    );
    // #endregion

    // #region Collection fields
    // Array of collection Contracts
    CollectionItem[] collectionStore;
    uint256 collectionCount = 0;

    // map mgs.sender => (collectionId => isOwner)
    mapping(address => mapping(uint256 => bool)) usercollections;
    // #endregion

    // #region Auction fields
    AuctionItem[] auctionStore;
    uint256 auctionCount = 0;
    // #endregion

    // #region Modifiers
    modifier requireFee(uint256 fee) {
        require(msg.value >= fee, "Insufficient Funds");
        _;
    }

    modifier requireCollectionOwner(uint256 _collectionId) {
        require(
            usercollections[msg.sender][_collectionId],
            "Not collection owner"
        );
        _;
    }

    // #endregion

    constructor() public {
        // deploy NFT Collection contract
        // add newly deployed contract to collection array
        _createCollection("TTM Collection", "TTM", address(this), false);
    }

    // #region Collection management
    function createCollection(string memory _name, string memory _symbol)
        public
        payable
        requireFee(FEE_COLLECTION_CREATE)
    {
        _createCollection(_name, _symbol, msg.sender, true);
    }

    function _createCollection(
        string memory _name,
        string memory _symbol,
        address _ownerAddress,
        bool _isUserCollection
    ) private {
        NFTCollection collectionContract = new NFTCollection(_name, _symbol);
        address _collectionAddress = address(collectionContract);

        uint256 _collectionId = collectionCount;
        collectionStore.push(
            CollectionItem(
                _collectionId,
                _collectionAddress,
                _ownerAddress,
                _isUserCollection
            )
        );
        collectionCount = collectionCount.add(1);

        usercollections[_ownerAddress][_collectionId] = true;

        emit onCollectionCreated(
            _collectionId,
            _collectionAddress,
            _ownerAddress
        );
    }

    // get all collections
    // get my collections
    // get others collections
    // get top collections ???

    // get items for collection (filters)
    // get top items from collection ???
    // #endregion

    // #reggion Auction Management
    function createAuction(
        address _collectionAddress,
        uint256 _id,
        uint256 _buyItNowPrice
    ) public {
        // transfer token to the market (this)
        NFTCollection nftCollection = NFTCollection(_collectionAddress);
        nftCollection.transferFrom(msg.sender, address(this), _id);

        // the token owner is checked above

        // create auction
        uint256 _auctionId = auctionCount;
        AuctionItem memory auction;
        auction.ownerAddress = msg.sender;
        auction.collectionAddress = _collectionAddress;
        auction.auctionId = _auctionId;
        auction.id = _id;
        auction.buyItNowPrice = _buyItNowPrice;
        auction.auctionStatus = AuctionStatus.Running;
        auction.auctionType = AuctionType.FixedPrice;

        auctionStore.push(auction);

        auctionCount = auctionCount.add(1);

        emit onAuctionCreated(_auctionId, _id);
    }

    // cancel auction (auction owner) - handle user funds?
    function cancelAuction(uint256 _auctionId) public {
        AuctionItem storage _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, "The auction must exist");
        require(
            _auction.ownerAddress == msg.sender,
            "The auction can only be canceled by the owner"
        );
        require(
            _auction.auctionStatus == AuctionStatus.Running,
            "The auction should be running"
        );

        NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);
        nftCollection.transferFrom(address(this), msg.sender, _auction.id);
        _auction.auctionStatus = AuctionStatus.Cancelled;

        // TODO : Handle bids

        emit onAuctionCancelled(_auctionId, _auction.id);
    }

    // #endregion

    // #region Auction handling
    // elapse ??? possible ReentrancyGuard
    // #endregion

    // #region Auction actions
    // bid - handle user funds?
    function bid() public payable {
        // not supported
        revert();
    }

    // buy it now - handle user funds?
    function buyNowAuction(uint256 _auctionId)
        public
        payable
        requireFee(FEE_SELL)
    {
        AuctionItem storage _auction = auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, "The auction must exist");
        require(
            _auction.ownerAddress != msg.sender,
            "The owner of the auction cannot buy it"
        );
        require(
            _auction.auctionStatus == AuctionStatus.Running,
            "The auction should be running"
        );
        require(
            _auction.auctionType == AuctionType.FixedPrice,
            "The auction status should be running"
        );
        require(
            _auction.auctionType == AuctionType.FixedPrice,
            "Only fixed price auctions can be buy it now"
        );
        require(
            msg.value == _auction.buyItNowPrice + FEE_SELL,
            "The ETH amount should match with the NFT Price + fee"
        );

        NFTCollection nftCollection = NFTCollection(_auction.collectionAddress);
        nftCollection.transferFrom(address(this), msg.sender, _auction.id);
        _auction.auctionStatus = AuctionStatus.Finished;
        userFunds[_auction.ownerAddress] += msg.value;

        emit onAuctionFinished(_auctionId, _auction.id);
    }

    // #endregion

    function claimFunds() public {
        require(
            userFunds[msg.sender] > 0,
            "This user has no funds to be claimed"
        );

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
