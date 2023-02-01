// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Counters.sol';
import '../interfaces/ICollectionFacet.sol';
import '../libraries/LibCollectionFacet.sol';
import '../NftCollection.sol';

contract CollectionFacet is ICollectionFacet {
    using Counters for Counters.Counter;

    function mint(address _collectionAddress, string memory _tokenURI) external override returns (uint256) {
        INftCollection nftCollection = INftCollection(_collectionAddress);

        uint256 _tokenId = nftCollection.diamondMint(msg.sender, _tokenURI);

        return _tokenId;
    }

    function createCollection(
        string memory _name,
        string memory _symbol,
        string memory _metaURI
    ) external override returns (address) {
        LibCollectionFacet.CollectionStorage storage collectionStorage = LibCollectionFacet.collectionStorage();

        NftCollection collectionContract = new NftCollection(msg.sender, _name, _symbol);

        // grant role
        collectionContract.grantRole(LibCollectionFacet.MINTER_ROLE, msg.sender);
        // approve creator by default
        collectionContract.setApprovalForAll(msg.sender, true); // not applied for tokens created from now on

        address _collectionAddress = address(collectionContract);

        collectionStorage._collectionIds.increment();
        uint256 _collectionId = collectionStorage._collectionIds.current();
        collectionStorage.collectionStore[_collectionId] = CollectionItem(_collectionId, _collectionAddress, msg.sender, _metaURI);

        emit onCollectionCreated(_collectionId, _collectionAddress, msg.sender);

        return _collectionAddress;
    }

    function getCollection(uint256 _collectionId) external view override returns (CollectionItem memory) {
        return LibCollectionFacet.collectionStorage().collectionStore[_collectionId];
    }

    function getCollectionCount() external view override returns (uint256) {
        return LibCollectionFacet.getCollectionCount();
    }
}
