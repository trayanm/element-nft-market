// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '../DataTypes.sol';

interface ICollectionFacet {
    event onCollectionCreated(uint256 indexed collectionId, address indexed collectionAddress, address indexed ownerAddress);

    function mint(address _collectionAddress, string memory _tokenURI) external returns (uint256);

    function createCollection(
        string memory _name,
        string memory _symbol,
        string memory _metaURI
    ) external returns (address);

    function getCollection(uint256 _collectionId) external view returns (CollectionItem memory);

    function getCollectionCount() external view returns (uint256);
}
