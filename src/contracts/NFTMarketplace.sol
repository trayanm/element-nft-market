// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./NFTCollection.sol";

contract NFTMarketplace is Ownable {
    using SafeMath for uint256;

    // Ownable: to handle fees and withdraw

    // Actions:
    // Deploy Collection (pay)
    // Submit offer (free)
    // Cancel offer (free)
    // Bid (free)
    // Finish offer (pay)

    // Fees
    // TODO : as about fees decimal value
    uint256 public constant FEE_COLLECTION_CREATE = 200;
    uint256 public constant FEE_SELL = 100;

    // Enums
    enum AuctionType {
        FixedFPrice,
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
        uint256 auctionId; // auction Id, is generated
        uint256 id; // token Id, is given
        address user;
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
        address owner;
        bool isUserCollection; // Describes whenever the collection is created by user
    }

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
    uint256 public collectionCount = 0;
    // #endregion

    // #region Modifiers
    modifier requireFee(uint256 fee) {
        require(msg.value >= fee, "Insufficient Funds");
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
        address ownerAddress,
        bool isUserCollection
    ) private {
        NFTCollection collectionContract = new NFTCollection(_name, _symbol);
        address collectionAddress = address(collectionContract);

        uint256 _collectionId = collectionCount;
        collectionStore.push(
            CollectionItem(
                _collectionId,
                collectionAddress,
                ownerAddress,
                isUserCollection
            )
        );
        collectionCount = collectionCount.add(1);

        emit onCollectionCreated(_collectionId, collectionAddress, ownerAddress);
    }
    // #endregion

    // Fallback: reverts if Ether is sent to this smart-contract by mistake
    fallback() external {
        revert();
    }
}
