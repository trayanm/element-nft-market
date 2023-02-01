// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '../DataTypes.sol';

interface IAuctionFacet {
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

    function createAuction(
        address _collectionAddress,
        uint256 _tokenId,
        uint256 _initialPrice,
        uint256 _buyItNowPrice,
        uint256 _durationDays
    ) external;

    function getCollectionAuctions(address collectionAddress) external view returns (uint256[] memory);

    function getAuction(uint256 _auctionId) external view returns (AuctionItem memory);

    function getAuctionBy(address _collectionAddress, uint256 _tokenId) external view returns (AuctionItem memory);

    function buyNowAuction(uint256 _auctionId) external payable;

    function cancelAuction(uint256 _auctionId) external;

    function checkAuction(uint256 _auctionId) external;

    function bidAuction(uint256 _auctionId) external payable;
}
