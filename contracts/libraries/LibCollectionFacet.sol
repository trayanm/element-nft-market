// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableMap.sol';
import '../DataTypes.sol';

library LibCollectionFacet {
    using Counters for Counters.Counter;

    bytes32 constant STORAGE_POSITION = keccak256('elementmarket.storage.collection');
    bytes32 constant MINTER_ROLE = keccak256('MINTER_ROLE');

    struct CollectionStorage {
        Counters.Counter _collectionIds;
        // collectionId => CollectionItem
        mapping(uint256 => CollectionItem) collectionStore;
        // collectionAddress => auctionId[]
        mapping(address => uint256[]) collectionToAcutions;
    }

    function collectionStorage() internal pure returns (CollectionStorage storage ds) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function getCollectionCount() internal view returns (uint256) {
        return collectionStorage()._collectionIds.current();
    }
}
