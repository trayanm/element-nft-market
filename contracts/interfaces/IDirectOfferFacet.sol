// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '../DataTypes.sol';

interface IDirectOfferFacet {
    function createDirectOffer(
        address _collectionAddress,
        uint256 _tokenId,
        uint256 _offeredPrice
    ) external;

    function getDirectOffersByOwner(address _collectionAddress, uint256 _tokenId) external view returns (DirectOfferItem[] memory);

    function getDirectOfferByBuyer(address _collectionAddress, uint256 _tokenId) external view returns (DirectOfferItem memory);

    function cancelDirectOffer(address _collectionAddress, uint256 _tokenId) external;

    function acceptDirectOffer(
        address _collectionAddress,
        uint256 _tokenId,
        address _buyerAddress
    ) external;

    function fulfillDirectOffer(address _collectionAddress, uint256 _tokenId) external payable;
}
