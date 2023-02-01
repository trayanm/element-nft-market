// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableMap.sol';
import '../interfaces/IDirectOfferFacet.sol';
import '../libraries/LibDirectOfferFacet.sol';
import '../libraries/LibAuctionFacet.sol';
import '../libraries/LibPausableFacet.sol';
import '../libraries/LibCalculatorFacet.sol';
import '../interfaces/INftCollection.sol';

contract DirectOfferFacet is IDirectOfferFacet {
    using Counters for Counters.Counter;
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    function createDirectOffer(
        address _collectionAddress,
        uint256 _tokenId,
        uint256 _offeredPrice
    ) external override {
        LibAuctionFacet.AuctionStorage storage auctionStorage = LibAuctionFacet.auctionStorage();
        LibDirectOfferFacet.DirectOfferStorage storage directOfferStorage = LibDirectOfferFacet.directOfferStorage();

        INftCollection nftCollection = INftCollection(_collectionAddress);

        address _ownerAddress = nftCollection.ownerOf(_tokenId);

        // requrie not own token
        require(msg.sender != _ownerAddress, 'Already token owner');

        //require(_ownerAddress != address(0), 'Token without owner');

        // _offeredPrice should be above zero
        require(_offeredPrice > 0, 'Offered price cannot be zero');

        // require no active auction
        require(auctionStorage.tokenAuctions[_collectionAddress][_tokenId] == 0, 'Auction for this token exists');

        // create direct offer
        directOfferStorage._directOfferIds.increment();
        uint256 _directOfferId = directOfferStorage._directOfferIds.current();
        directOfferStorage.directOfferStore[_directOfferId] = DirectOfferItem({
            ownerAddress: _ownerAddress,
            collectionAddress: _collectionAddress,
            buyerAddress: msg.sender,
            directOfferId: _directOfferId,
            tokenId: _tokenId,
            offeredPrice: _offeredPrice,
            directOfferStatus: DirectOfferStatus.Open
        });

        directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].active = true;
        directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.set(msg.sender, _directOfferId);
    }

    function getDirectOffersByOwner(address _collectionAddress, uint256 _tokenId) external view override returns (DirectOfferItem[] memory) {
        LibDirectOfferFacet.DirectOfferStorage storage directOfferStorage = LibDirectOfferFacet.directOfferStorage();

        INftCollection nftCollection = INftCollection(_collectionAddress);
        require(msg.sender == nftCollection.ownerOf(_tokenId), 'Not token owner');

        require(directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].active == true, 'Offers not found');

        uint256 length = directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.length();

        DirectOfferItem[] memory result = new DirectOfferItem[](length);

        for (uint256 i = 0; i < length; i++) {
            (, uint256 _directOfferId) = directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.at(i);

            // visible only for buyer or seller
            result[i] = directOfferStorage.directOfferStore[_directOfferId];
        }

        return result;
    }

    function getDirectOfferByBuyer(address _collectionAddress, uint256 _tokenId) external view override returns (DirectOfferItem memory) {
        LibDirectOfferFacet.DirectOfferStorage storage directOfferStorage = LibDirectOfferFacet.directOfferStorage();

        // sender is the buyer
        (bool success, uint256 _directOfferId) = directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.tryGet(msg.sender);

        require(success && directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].active == true, 'Offer not found');

        //require(success, 'Offer not found');

        DirectOfferItem memory _directOffer = directOfferStorage.directOfferStore[_directOfferId];

        return _directOffer;
    }

    function cancelDirectOffer(address _collectionAddress, uint256 _tokenId) external override {
        LibDirectOfferFacet.DirectOfferStorage storage directOfferStorage = LibDirectOfferFacet.directOfferStorage();

        // sender is the buyer
        (bool success, uint256 _directOfferId) = directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.tryGet(msg.sender);

        require(success && directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].active == true, 'Offer not found');

        DirectOfferItem storage _directOffer = directOfferStorage.directOfferStore[_directOfferId];

        // require(_directOffer.directOfferId == _directOfferId, 'Offer not found');
        require(_directOffer.buyerAddress == msg.sender, 'Only offer bayer can cancel');
        require(_directOffer.directOfferStatus == DirectOfferStatus.Open || _directOffer.directOfferStatus == DirectOfferStatus.Accepted, 'Offer is not open');

        _directOffer.directOfferStatus = DirectOfferStatus.Canceled;

        // remove direct offer by buyer
        directOfferStorage.tokenDirectOffers[_directOffer.collectionAddress][_directOffer.tokenId].buyerMap.remove(msg.sender);
    }

    function acceptDirectOffer(
        address _collectionAddress,
        uint256 _tokenId,
        address _buyerAddress
    ) external override {
        LibDirectOfferFacet.DirectOfferStorage storage directOfferStorage = LibDirectOfferFacet.directOfferStorage();

        (bool success, uint256 _directOfferId) = directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.tryGet(_buyerAddress);

        require(success && directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].active == true, 'Offer not found');

        DirectOfferItem storage _directOffer = directOfferStorage.directOfferStore[_directOfferId];

        // require(_directOffer.directOfferId == _directOfferId, 'Offer not found');
        require(_directOffer.directOfferStatus == DirectOfferStatus.Open, 'Offer is not open');

        INftCollection nftCollection = INftCollection(_directOffer.collectionAddress);
        require(msg.sender == nftCollection.ownerOf(_directOffer.tokenId), 'Not token owner');

        // check if MarketPlace is approved
        require(address(this) == nftCollection.getApproved(_directOffer.tokenId), 'MarketPlace is not approved');

        _directOffer.directOfferStatus = DirectOfferStatus.Accepted;
    }

    function fulfillDirectOffer(address _collectionAddress, uint256 _tokenId) external payable override {
        LibDirectOfferFacet.DirectOfferStorage storage directOfferStorage = LibDirectOfferFacet.directOfferStorage();
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        // sender is the buyer
        (bool success, uint256 _directOfferId) = directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].buyerMap.tryGet(msg.sender);

        require(success && directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].active == true, 'Offer not found');

        DirectOfferItem storage _directOffer = directOfferStorage.directOfferStore[_directOfferId];

        // require(_directOffer.directOfferId == _directOfferId, 'Offer not found');
        require(_directOffer.directOfferStatus == DirectOfferStatus.Accepted, 'Offer is not accepted');
        require(_directOffer.buyerAddress == msg.sender, 'Only bayer can fullfill');
        require(msg.value == _directOffer.offeredPrice, 'Offered price is incorrect');

        INftCollection nftCollection = INftCollection(_directOffer.collectionAddress);

        // transfer from MarketPalce as buyer
        nftCollection.transferFrom(_directOffer.ownerAddress, _directOffer.buyerAddress, _directOffer.tokenId);

        // TODO : Approve to market after transfer

        _directOffer.directOfferStatus = DirectOfferStatus.Finished;

        uint256 fee = (msg.value * calculatorStorage.feePercentage) / calculatorStorage.precision;
        uint256 userFund = msg.value - fee;
        calculatorStorage.userFunds[_directOffer.ownerAddress] = calculatorStorage.userFunds[_directOffer.ownerAddress] + userFund;

        // delete all direct offers for token
        // delete tokenDirectOffers[_directOffer.collectionAddress][_directOffer.tokenId];
        directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].active = false;
        // delete tokenDirectOffers[_collectionAddress][_tokenId];
    }
}
