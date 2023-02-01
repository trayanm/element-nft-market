// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '../interfaces/ICalculatorFacet.sol';
import '../libraries/LibCalculatorFacet.sol';
import '../libraries/LibDiamondFacet.sol';

contract CalculatorFacet is ICalculatorFacet {
    modifier onlyAuthorized() {
        require(msg.sender == LibDiamondFacet.contractOwner(), 'PausableFacet: unauthorized');
        _;
    }

    /// @notice Construct a new FeeCalculator contract
    /// @param _precision The precision for every fee calculator
    function initFeeCalculator(uint256 _feePercentage, uint256 _precision) external override {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        require(!calculatorStorage.initialized, 'FeeCalculatorFacet: already initialized');
        require(_precision >= 10, 'FeeCalculatorFacet: precision must not be single-digit');
        require(_feePercentage > 0, 'FeeCalculatorFacet: feePercentage not greater than zero');

        calculatorStorage.initialized = true;
        calculatorStorage.feePercentage = _feePercentage;
        calculatorStorage.precision = _precision;
    }

    function getPrecision() external view override returns (uint256) {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();
        return calculatorStorage.precision;
    }

    function setPrecision(uint256 _precision) external override onlyAuthorized {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        require(_precision >= 10, 'FeeCalculatorFacet: precision must not be single-digit');

        calculatorStorage.precision = _precision;
    }

    function getFeePercentage() external view override returns (uint256) {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();
        return calculatorStorage.feePercentage;
    }

    function setFeePercentage(uint256 _feePercentage) external override onlyAuthorized {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        require(_feePercentage > 0, 'FeeCalculatorFacet: feePercentage not greater than zero');

        calculatorStorage.feePercentage = _feePercentage;
    }

    function claimFunds() external override {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        require(calculatorStorage.userFunds[msg.sender] > 0, 'No funds to be claimed');

        uint256 fundsToClaim = calculatorStorage.userFunds[msg.sender];
        calculatorStorage.userFunds[msg.sender] = 0;
        payable(msg.sender).transfer(fundsToClaim);

        // emit onFundsClaimed(msg.sender, fundsToClaim);
    }

    function withdrawProfit() external override onlyAuthorized {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        uint256 _profit = calculatorStorage.profit;
        calculatorStorage.profit = 0;

        address payable to = payable(msg.sender);
        to.transfer(_profit);
    }

    function getProfitAmount() external view override onlyAuthorized returns (uint256) {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        return calculatorStorage.profit;
    }

    function getUserFunds(address _userAddress) external override returns (uint256) {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();
        calculatorStorage.userFunds[_userAddress];
    }
}
