// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/introspection/IERC165.sol';

import './IDiamondCutFacet.sol';
import './IDiamondLoupeFacet.sol';
import './IERC173.sol';
import './IPausableFacet.sol';
import './IAuctionFacet.sol';
import './IDirectOfferFacet.sol';
import './ICollectionFacet.sol';
import './ICalculatorFacet.sol';

interface IMarketPlaceDiamond is
    IDiamondCutFacet,
    IDiamondLoupeFacet,
    IERC165,
    IERC173,
    IPausableFacet,
    IAuctionFacet,
    IDirectOfferFacet,
    ICollectionFacet,
    ICalculatorFacet
{}
