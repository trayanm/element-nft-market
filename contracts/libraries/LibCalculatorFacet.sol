// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

library LibCalculatorFacet {
    bytes32 constant STORAGE_POSITION = keccak256('elementmarket.storage.calculator');

    struct CalculatorStorage {
        bool initialized;
        uint256 profit;
        uint256 feePercentage;
        uint256 precision;
        // contains funds per user generated from sales. Bids will stored in other way
        // msg.sender => generated funds
        mapping(address => uint256) userFunds;

    }

    function calculatorStorage() internal pure returns (CalculatorStorage storage ds) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}
