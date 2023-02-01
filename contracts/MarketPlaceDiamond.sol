// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import './interfaces/IAuctionFacet.sol';
import './interfaces/IDiamondCutFacet.sol';
import './interfaces/IDiamondLoupeFacet.sol';
import './interfaces/IDirectOfferFacet.sol';
import './interfaces/IERC173.sol';
import './interfaces/IPausableFacet.sol';
import './interfaces/IMarketPlaceDiamond.sol';
import './interfaces/IPausableFacet.sol';
import './interfaces/ICollectionFacet.sol';
import './interfaces/ICalculatorFacet.sol';
import './libraries/LibDiamondFacet.sol';

contract MarketPlaceDiamond {
    struct DiamondArgs {
        address owner;
    }

    constructor(IDiamondCutFacet.FacetCut[] memory _diamondCut, DiamondArgs memory _args) {
        LibDiamondFacet.diamondCut(_diamondCut, address(0), new bytes(0));
        LibDiamondFacet.setContractOwner(_args.owner);

        LibDiamondFacet.DiamondStorage storage ds = LibDiamondFacet.diamondStorage();

        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IAuctionFacet).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCutFacet).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupeFacet).interfaceId] = true;
        ds.supportedInterfaces[type(IDirectOfferFacet).interfaceId] = true;
        ds.supportedInterfaces[type(IERC173).interfaceId] = true;
        ds.supportedInterfaces[type(IPausableFacet).interfaceId] = true;
        ds.supportedInterfaces[type(IMarketPlaceDiamond).interfaceId] = true;
        ds.supportedInterfaces[type(IPausableFacet).interfaceId] = true;
        ds.supportedInterfaces[type(ICollectionFacet).interfaceId] = true;
        ds.supportedInterfaces[type(ICalculatorFacet).interfaceId] = true;
    }

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        LibDiamondFacet.DiamondStorage storage ds = LibDiamondFacet.diamondStorage();
        address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
        require(facet != address(0), 'Diamond: Function does not exist');
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
