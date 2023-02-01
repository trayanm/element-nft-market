// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableMap.sol';
import '../DataTypes.sol';

library LibDirectOfferFacet {
    using Counters for Counters.Counter;
    bytes32 constant STORAGE_POSITION = keccak256('elementmarket.storage.directoffer');

	struct DirectOfferGroupItem {
		// _buyerAddress => _directOfferId  
        //uint256 length; //  TODO : Check
		EnumerableMap.AddressToUintMap buyerMap; // offer send from address
        bool active; // describes if the offers for the current pair collectionAddress => tokenId are active
	}

    struct DirectOfferStorage {
        Counters.Counter _directOfferIds;
        // directOfferId => DirectOfferItem
        mapping(uint256 => DirectOfferItem) directOfferStore;
        // _collectionAddress => (_tokenId => DirectOfferGroupItem)
        mapping(address => mapping(uint256 => DirectOfferGroupItem)) tokenDirectOffers;
    }

    function directOfferStorage() internal pure returns (DirectOfferStorage storage ds) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}
