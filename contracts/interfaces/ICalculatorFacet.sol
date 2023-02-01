// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '../DataTypes.sol';

interface ICalculatorFacet {
    /// @notice Construct a new FeeCalculator contract
    /// @param _feePercentage Value of fee percentage
    /// @param _precision Value of precision for fee calculation
    function initFeeCalculator(uint256 _feePercentage, uint256 _precision) external;

    function getPrecision() external view returns (uint256);

    function setPrecision(uint256 _precision) external;

    function getFeePercentage() external view returns (uint256);

    function setFeePercentage(uint256 _feePercentage) external;

    function claimFunds() external;

    function withdrawProfit() external;

    function getProfitAmount() external view returns (uint256);

    function getUserFunds(address _userAddress) external returns (uint256);
}
