// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableMap.sol';
import '../interfaces/IAuctionFacet.sol';
import '../libraries/LibCollectionFacet.sol';
import '../libraries/LibAuctionFacet.sol';
import '../libraries/LibDirectOfferFacet.sol';
import '../libraries/LibPausableFacet.sol';
import '../libraries/LibCalculatorFacet.sol';
import '../interfaces/INftCollection.sol';

contract AuctionFacet is IAuctionFacet {
    using Counters for Counters.Counter;

    function createAuction(
        address _collectionAddress,
        uint256 _tokenId,
        uint256 _initialPrice,
        uint256 _buyItNowPrice,
        uint256 _durationDays
    ) external override {
        LibAuctionFacet.AuctionStorage storage auctionStorage = LibAuctionFacet.auctionStorage();
        LibCollectionFacet.CollectionStorage storage collectionStorage = LibCollectionFacet.collectionStorage();
        LibDirectOfferFacet.DirectOfferStorage storage directOfferStorage = LibDirectOfferFacet.directOfferStorage();

         // transfer token to the market (this)
        INftCollection nftCollection = INftCollection(_collectionAddress);

        // check token owner
        require(msg.sender == nftCollection.ownerOf(_tokenId), 'Not token owner');

        // check if MarketPlace is approved
        require(address(this) == nftCollection.getApproved(_tokenId), 'MarketPlace is not approved');

        // create auction twice
        require(auctionStorage.tokenAuctions[_collectionAddress][_tokenId] == 0, 'Auction for this token exists');

        require(_durationDays > 0, 'Invalid duration');

        // create auction
        auctionStorage._auctionIds.increment();
        uint256 _auctionId = auctionStorage._auctionIds.current();
        auctionStorage.auctionStore[_auctionId] = AuctionItem({
            ownerAddress: msg.sender,
            collectionAddress: _collectionAddress,
            highestBidderAddress: address(0),
            highestBid : 0,
            auctionId: _auctionId,
            tokenId: _tokenId,
            buyItNowPrice: _buyItNowPrice,
            //reservedPrice: 0,
            initialPrice: _initialPrice,
            //minBidStep: 0,
            //maxBidStep: 0,
            endTime: block.timestamp + (_durationDays * 1 days),
            auctionStatus: AuctionStatus.Running
            //auctionType: AuctionType.FixedPrice
        });

        collectionStorage.collectionToAcutions[_collectionAddress].push(_auctionId);

        auctionStorage.tokenAuctions[_collectionAddress][_tokenId] = _auctionId;

        // delete direct offer for specific token
        directOfferStorage.tokenDirectOffers[_collectionAddress][_tokenId].active = false;

        emit onAuctionCreated(_auctionId, _tokenId);
    }

    function getCollectionAuctions(address collectionAddress) external override view returns (uint256[] memory) {
        return LibCollectionFacet.collectionStorage().collectionToAcutions[collectionAddress];
    }

    function getAuction(uint256 _auctionId) external override view returns (AuctionItem memory) {
        AuctionItem memory _auction = LibAuctionFacet.auctionStorage().auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');        

        return _auction;
    }

    function getAuctionBy(address _collectionAddress, uint256 _tokenId) external override view returns (AuctionItem memory) {
        uint256 _auctionId = LibAuctionFacet.auctionStorage().tokenAuctions[_collectionAddress][_tokenId];

        AuctionItem memory _auction = LibAuctionFacet.auctionStorage().auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');        

        return _auction;
    }

    function buyNowAuction(uint256 _auctionId) external override payable {
        LibAuctionFacet.AuctionStorage storage auctionStorage = LibAuctionFacet.auctionStorage();
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        AuctionItem storage _auction = auctionStorage.auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');
        
        _checkAuction(_auction);
        
        if(_auction.auctionStatus == AuctionStatus.Running) {
            require(_auction.ownerAddress != msg.sender, 'Auction owner cannot buy it');
            // require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');
            require(_auction.buyItNowPrice > 0, 'Buy now is not allowed');

            require(msg.value == _auction.buyItNowPrice, 'Buy now price is greater');

            INftCollection nftCollection = INftCollection(_auction.collectionAddress);

            // transfer from MarketPalce as approved
            nftCollection.transferFrom(_auction.ownerAddress, msg.sender, _auction.tokenId);

            // TODO : Approve to market after transfer

            // return to the current highest bidder if any
            if(_auction.highestBid > 0 && _auction.highestBidderAddress != address(0)) {
                calculatorStorage.userFunds[_auction.highestBidderAddress] = calculatorStorage.userFunds[_auction.highestBidderAddress] + _auction.highestBid;
            }

            _auction.auctionStatus = AuctionStatus.Finished;

            uint256 fee = (_auction.highestBid * calculatorStorage.feePercentage) / calculatorStorage.precision;
            uint256 userFund = msg.value -fee;
            calculatorStorage.profit += fee;
            calculatorStorage.userFunds[_auction.ownerAddress] = calculatorStorage.userFunds[_auction.ownerAddress] + userFund;

            delete auctionStorage.tokenAuctions[_auction.collectionAddress][_auction.tokenId]; // reset

            emit onAuctionFinished(_auctionId, _auction.tokenId);
        }
    }

    function cancelAuction(uint256 _auctionId) external override {
        LibAuctionFacet.AuctionStorage storage auctionStorage = LibAuctionFacet.auctionStorage();
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        AuctionItem storage _auction = auctionStorage.auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');

        _checkAuction(_auction);

        if(_auction.auctionStatus == AuctionStatus.Running) {
            require(_auction.ownerAddress == msg.sender, 'Only auction owner can cancel');
            // require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');

            _auction.auctionStatus = AuctionStatus.Canceled;

            delete auctionStorage.tokenAuctions[_auction.collectionAddress][_auction.tokenId]; // reset

            // return prev bid
            // send _auction.highestBid to _auction.highestBidderAddress
            if(_auction.highestBid > 0 && _auction.highestBidderAddress != address(0)) {
                calculatorStorage.userFunds[_auction.highestBidderAddress] = calculatorStorage.userFunds[_auction.highestBidderAddress] + _auction.highestBid;
            }

            emit onAuctionCancelled(_auctionId, _auction.tokenId);
        }
    }

    function checkAuction(uint256 _auctionId) external override {
        LibAuctionFacet.AuctionStorage storage auctionStorage = LibAuctionFacet.auctionStorage();
        AuctionItem storage _auction = auctionStorage.auctionStore[_auctionId];

        //require(_auction.auctionId == _auctionId, 'Auction does not exists');

        _checkAuction(_auction);
    }

    function bidAuction(uint256 _auctionId) external override payable {
        LibAuctionFacet.AuctionStorage storage auctionStorage = LibAuctionFacet.auctionStorage();
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();

        AuctionItem storage _auction = auctionStorage.auctionStore[_auctionId];

        require(_auction.auctionId == _auctionId, 'Auction does not exists');

        _checkAuction(_auction);

        if(_auction.auctionStatus == AuctionStatus.Running) {
            require(_auction.ownerAddress != msg.sender, 'Auction owner cannot bid');
            require(_auction.highestBidderAddress != msg.sender, 'Already highest bidder');
            // require(_auction.auctionStatus == AuctionStatus.Running, 'Auction is not running');

            // current bid must be above initial price and above zero

            require(msg.value >= _auction.initialPrice , 'Bid is less than initial');
            require(msg.value > _auction.highestBid , 'Bid is less than highest');

            // return prev bid
            // send _auction.highestBid to _auction.highestBidderAddress
            if(_auction.highestBid > 0 && _auction.highestBidderAddress != address(0)) {
                calculatorStorage.userFunds[_auction.highestBidderAddress] = calculatorStorage.userFunds[_auction.highestBidderAddress] + _auction.highestBid;
            }

            // load new bid
            _auction.highestBid = msg.value;
            _auction.highestBidderAddress = msg.sender;

            emit onAuctionBid(_auctionId, msg.value);
        }
    }

    function _checkAuction(AuctionItem storage _auction) private {
        LibCalculatorFacet.CalculatorStorage storage calculatorStorage = LibCalculatorFacet.calculatorStorage();
        // check timestamp

        if(_auction.auctionStatus == AuctionStatus.Running) {
            bool ended = _auction.endTime <= block.timestamp;

            if(ended) {
                INftCollection nftCollection = INftCollection(_auction.collectionAddress);

                if(_auction.highestBid > _auction.initialPrice) {
                    _auction.auctionStatus = AuctionStatus.Finished;

                    // peform transfer
                    uint256 fee = (_auction.highestBid * calculatorStorage.feePercentage) / calculatorStorage.precision;
                    uint256 userFund = _auction.highestBid -fee;
                    calculatorStorage.profit += fee;
                    calculatorStorage.userFunds[_auction.ownerAddress] = calculatorStorage.userFunds[_auction.ownerAddress] + userFund;

                    // transfer from MarketPalce as approved
                    nftCollection.transferFrom(_auction.ownerAddress, msg.sender, _auction.tokenId);

                    // TODO : Approve to market after transfer

                    emit onAuctionFinished(_auction.auctionId, _auction.tokenId);
                }
                else {
                    _auction.auctionStatus = AuctionStatus.Closed;

                    // return money
                    // if(_auction.highestBid > 0 && _auction.highestBidderAddress != address(0)) {
                    //     pausableStorage.userFunds[_auction.highestBidderAddress] = pausableStorage.userFunds[_auction.highestBidderAddress].add(_auction.highestBid);
                    // }

                    emit onAuctionClosed(_auction.auctionId, _auction.tokenId);
                }
            }
        }        
    }
}
