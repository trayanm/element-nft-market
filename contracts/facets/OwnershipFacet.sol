// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '../libraries/LibDiamondFacet.sol';
import '../interfaces/IERC173.sol';

contract OwnershipFacet is IERC173 {
    function transferOwnership(address _newOwner) external override {
        LibDiamondFacet.enforceIsContractOwner();
        LibDiamondFacet.setContractOwner(_newOwner);
    }

    function owner() external view override returns (address owner_) {
        owner_ = LibDiamondFacet.contractOwner();
    }
}
