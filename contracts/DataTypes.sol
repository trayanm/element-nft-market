// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

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
