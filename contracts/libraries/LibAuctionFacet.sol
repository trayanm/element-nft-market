// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableMap.sol';
import '../DataTypes.sol';

library LibAuctionFacet {
    using Counters for Counters.Counter;
    bytes32 constant STORAGE_POSITION = keccak256('elementmarket.storage.auction');

    struct AuctionStorage {
        Counters.Counter _auctionIds;
        // _collectionAddress => (_tokenId => _auctionId)
        mapping(address => mapping(uint256 => uint256)) tokenAuctions;
        // auctionId => AuctionItem
        mapping(uint256 => AuctionItem) auctionStore;
    }

    function auctionStorage() internal pure returns (AuctionStorage storage ds) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}
