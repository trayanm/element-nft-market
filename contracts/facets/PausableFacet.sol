// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '../interfaces/IPausableFacet.sol';
import '../libraries/LibDiamondFacet.sol';
import '../libraries/LibPausableFacet.sol';

contract PausableFacet is IPausableFacet {
    modifier onlyAuthorized() {
        require(msg.sender == LibDiamondFacet.contractOwner(), 'PausableFacet: unauthorized');
        _;
    }

    /// @notice Returns true if the contract is paused, and false otherwise
    function paused() external view override returns (bool) {
        return LibPausableFacet.paused();
    }

    /// @notice Pauses the contract. Reverts if caller is not owner or already paused
    function pause() external override onlyAuthorized {
        LibPausableFacet.pause();
        emit onPaused(msg.sender);
    }

    /// @notice Unpauses the contract. Reverts if the caller is not owner or already not paused
    function unpause() external override onlyAuthorized {
        LibPausableFacet.unpause();
        emit onUnpaused(msg.sender);
    }
}
