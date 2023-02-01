// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

library LibPausableFacet {
    using EnumerableSet for EnumerableSet.AddressSet;
    bytes32 constant STORAGE_POSITION = keccak256('elementmarket.storage.pausable');

    struct PausableStorage {
        // used to restrict certain functionality in case of an emergency stop
        bool paused;
    }

    function pausableStorage() internal pure returns (PausableStorage storage gs) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            gs.slot := position
        }
    }

    /// @return Returns true if the contract is paused, and false otherwise
    function paused() internal view returns (bool) {
        return pausableStorage().paused;
    }

    function enforceNotPaused() internal view {
        require(!pausableStorage().paused, 'LibGovernance: paused');
    }

    function enforcePaused() internal view {
        require(pausableStorage().paused, 'LibGovernance: not paused');
    }

    function pause() internal {
        enforceNotPaused();
        PausableStorage storage ds = pausableStorage();
        ds.paused = true;
    }

    function unpause() internal {
        enforcePaused();
        PausableStorage storage ds = pausableStorage();
        ds.paused = false;
    }
}
