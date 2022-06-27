//const { artifacts, contract } = require("truffle");
const { assert } = require('chai');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');
// const { web3Utils } = require('web3-utils');
// const { web3 } = require('web3');

const MarketPlace = artifacts.require('MarketPlace');
const NFTCollection = artifacts.require('NFTCollection');

// var MarketPlace = artifacts.require("../src/contracts/MarketPlace.sol");
// var NFTCollection = artifacts.require("../src/contracts/NFTCollection.sol");

contract('MarketPlace', function (accounts) {
    let theMarketPlace;

    const account_owner = accounts[0];
    const account_1 = accounts[1];
    const account_2 = accounts[2];
    const account_3 = accounts[3];
    const account_4 = accounts[3];

    beforeEach(async function () {
        theMarketPlace = await MarketPlace.new();
    });

    xit('Test: Collection - create', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        await theMarketPlace.createCollection('Doodle', 'DOO', 'collectionURI_2', { from: account_2 });

        const collectionCount = await theMarketPlace.getCollectionCount();
        assert.equal(collectionCount, 2, "Count should be 2");

        const collectionitem_1 = await theMarketPlace.getCollection(1);
        assert.equal(collectionitem_1.ownerAddress, account_1, 'Should be account_1');

        const collectionitem_2 = await theMarketPlace.getCollection(2);
        assert.equal(collectionitem_2.ownerAddress, account_2, 'Should be account_2');

        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);

        const name = await collectionContract_1.name();
        const symbol = await collectionContract_1.symbol();

        assert.equal(name, 'Symbol', 'Should be Symbol');
        assert.equal(symbol, 'SYM', 'Should be SYM');

        let canMint = await collectionContract_1.canMint(account_1);
        assert.equal(canMint, true, 'account_1 can mint on Symbol');

        canMint = await collectionContract_1.canMint(account_2);
        assert.equal(canMint, false, 'account_2 cannot mint on Symbol');
    });

    xit('Test: Collection - Mint via collection', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await collectionContract_1.safeMint('_tokenURI_1', { from: account_1 });
        await collectionContract_1.safeMint('_tokenURI_2', { from: account_1 });

        let errorMessage = 'ERC721PresetMinterPauserAutoId: must have minter role to mint';
        try {
            await collectionContract_1.safeMint('_tokenURI_3', { from: account_2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        errorMessage = 'The token URI should be unique';
        try {
            await collectionContract_1.safeMint('_tokenURI_2', { from: account_1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }
    });

    xit('Test: Collection - Mint external', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);

        let errorMessage = 'ERC721PresetMinterPauserAutoId: must have admin role to mint';
        try {
            await collectionContract_1.externalMint(account_1, '_tokenURI_1', { from: account_1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }
    });

    xit('Test: MarketPlace - mint', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);

        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });

        let errorMessage = 'ERC721PresetMinterPauserAutoId: must have minter role to mint';
        try {
            await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        const newOwner_1 = await collectionContract_1.ownerOf(1);
        assert.equal(newOwner_1, account_1, 'New owner is account_1');

        const approved_1 = await collectionContract_1.getApproved(1);
        assert.equal(approved_1, theMarketPlace.address, 'MarketPlace is approved');
    });

    xit('Test: Auction - Create', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await collectionContract_1.safeMint('_tokenURI_1', { from: account_1 });
        await collectionContract_1.safeMint('_tokenURI_2', { from: account_1 });
        await collectionContract_1.safeMint('_tokenURI_3', { from: account_1 });

        let errorMessage = 'MarketPlace is not approved';
        try {
            await theMarketPlace.createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2,
                { from: account_1 }
            );
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        await collectionContract_1.approve(theMarketPlace.address, 1, { from: account_1 });
        await theMarketPlace.createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        await collectionContract_1.approve(theMarketPlace.address, 2, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 2,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 3,
                /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        const auctionCount = await theMarketPlace.getAuctionCount();
        assert.equal(auctionCount, 2, "Count should be 2");

        const auction_1 = await theMarketPlace.getAuction(1);
        assert.equal(auction_1.auctionId, 1, 'auction id is 1');
        assert.equal(auction_1.tokenId, 1, 'token id is 1');
        assert.equal(auction_1.buyItNowPrice, 2, 'buyItNowPrice is 2');
        assert.equal(auction_1.auctionStatus, 0, 'auctionStatus is Running');

        errorMessage = 'Not token owner';
        try {
            await theMarketPlace.createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 1,
                /* uint256 _durationDays */ 2,
                { from: account_2 }
            );
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        // create auction twice
        errorMessage = 'Auction for this token exists';
        try {
            await collectionContract_1.approve(theMarketPlace.address, 3, { from: account_1 });
            await theMarketPlace.createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 3,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2,
                { from: account_1 }
            );

            await theMarketPlace.createAuction(
                    /* address _collectionAddress */ collectionitem_1.collectionAddress,
                    /* uint256 _tokenId */ 3,
                    /* uint256 _initialPrice */ 2,
                        /* uint256 _buyItNowPrice */ 4,
                    /* uint256 _durationDays */ 2,
                { from: account_1 }
            );
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }
    });


    xit('Test: Auction - Get', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await collectionContract_1.safeMint('_tokenURI_1', { from: account_1 });
        await collectionContract_1.safeMint('_tokenURI_2', { from: account_1 });

        await collectionContract_1.approve(theMarketPlace.address, 1, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 2,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        const auction_Get = await theMarketPlace.getAuction(1);
        const auction_GetBy = await theMarketPlace.getAuctionBy(collectionitem_1.collectionAddress, 1);

        assert.equal(auction_Get.auctionId, auction_GetBy.auctionId, 'auction id is the same');
        assert.equal(auction_Get.tokenId, auction_GetBy.tokenId, 'token id is the same');
        assert.equal(auction_Get.buyItNowPrice, auction_GetBy.buyItNowPrice, 'buyItNowPrice is the same');
        assert.equal(auction_Get.auctionStatus, auction_GetBy.auctionStatus, 'auctionStatus is the same');
    });

    xit('Test: Auction - Buy now violations', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await collectionContract_1.safeMint('_tokenURI_1', { from: account_1 });
        await collectionContract_1.safeMint('_tokenURI_2', { from: account_1 });

        await collectionContract_1.approve(theMarketPlace.address, 1, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 2,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        await collectionContract_1.approve(theMarketPlace.address, 2, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 2,
            /* uint256 _initialPrice */ 1,
            /* uint256 _buyItNowPrice */ 0,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        // let errorMessage = 'Token price cannot be zero';
        // try {
        //     await theMarketPlace.createAuction(collectionitem_1.collectionAddress, 1, 0, 0, { from: account_1 });
        // }
        // catch (error) {
        //     assert.notEqual(error, undefined, 'Error must be thrown');
        //     assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        // }

        let errorMessage = 'ERC721: owner query for nonexistent token';
        try {
            await theMarketPlace.createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 999,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 1,
                /* uint256 _durationDays */ 2,
                { from: account_1 }
            );
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        errorMessage = 'Auction owner cannot buy it';
        try {
            await theMarketPlace.buyNowAuction(1, { from: account_1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        errorMessage = 'Buy now price is greater';
        try {
            await theMarketPlace.buyNowAuction(1, { from: account_2, value: 1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        errorMessage = 'Buy now is not allowed';
        try {
            await theMarketPlace.buyNowAuction(2, { from: account_2, value: 1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }
    });

    xit('Test: Auction - Buy now and transfer', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await collectionContract_1.safeMint('_tokenURI_1', { from: account_1 });
        await collectionContract_1.safeMint('_tokenURI_2', { from: account_1 });

        await collectionContract_1.approve(theMarketPlace.address, 1, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 2,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        await collectionContract_1.approve(theMarketPlace.address, 2, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 2,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 3,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        // buy now other's nft
        await theMarketPlace.buyNowAuction(1, { from: account_2, value: 2 });

        const auction_1_after = await theMarketPlace.getAuction(1);
        assert.equal(auction_1_after.auctionStatus, 2, 'auctionStatus should be Finished');

        const newOwner_1 = await collectionContract_1.ownerOf(1);
        assert.equal(newOwner_1, account_2, 'New owner is account_2');
    });

    xit('Test: Auction - Buy now and transfer after MarketPlace mint', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_1 });

        // await collectionContract_1.approve(theMarketPlace.address, 1, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 2,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        //await collectionContract_1.approve(theMarketPlace.address, 2, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 2,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 3,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        // buy now other's nft
        await theMarketPlace.buyNowAuction(1, { from: account_2, value: 2 });

        const auction_1_after = await theMarketPlace.getAuction(1);
        assert.equal(auction_1_after.auctionStatus, 2, 'auctionStatus should be Finished');

        const newOwner_1 = await collectionContract_1.ownerOf(1);
        assert.equal(newOwner_1, account_2, 'New owner is account_2');

        // const approved_2 = await collectionContract_1.getApproved(1);
        // assert.equal(approved_2, theMarketPlace.address, 'MarketPlace is approved');
    });

    xit('Test: Auction - Buy now and sell again', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await collectionContract_1.safeMint('_tokenURI_1', { from: account_1 });

        await collectionContract_1.approve(theMarketPlace.address, 1, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 2,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        // buy now other's nft
        await theMarketPlace.buyNowAuction(1, { from: account_2, value: 2 });

        const auction_1_after = await theMarketPlace.getAuction(1);
        assert.equal(auction_1_after.auctionStatus, 2, 'auctionStatus should be Finished');

        const newOwner_1 = await collectionContract_1.ownerOf(1);
        assert.equal(newOwner_1, account_2, 'New owner is account_2');

        // account_2 create new auction
        await collectionContract_1.approve(theMarketPlace.address, 1, { from: account_2 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 2,
            /* uint256 _buyItNowPrice */ 4,
            /* uint256 _durationDays */ 2,
            { from: account_2 }
        );

        const auctionCount = await theMarketPlace.getAuctionCount();
        assert.equal(auctionCount, 2, "auctionCount Count should be 2");

        // const auction_2 = await theMarketPlace.getAuctionBy(collectionitem_1.collectionAddress, 1);
        const auction_2 = await theMarketPlace.getAuction(2);
        assert.equal(auction_2.auctionId, 2, 'auction id is 2');
        assert.equal(auction_2.initialPrice, 2, 'initialPrice is 2');
        assert.equal(auction_2.buyItNowPrice, 4, 'buyItNowPrice is 4');
        assert.equal(auction_2.auctionStatus, 0, 'auctionStatus should be Running');
    });

    xit('Test: Auction - Cancel', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await collectionContract_1.safeMint('_tokenURI_1', { from: account_1 });
        await collectionContract_1.safeMint('_tokenURI_2', { from: account_1 });

        await collectionContract_1.approve(theMarketPlace.address, 1, { from: account_1 });
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 2,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        let errorMessage = 'Only auction owner can cancel';
        try {
            await theMarketPlace.cancelAuction(1, { from: account_2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        await theMarketPlace.cancelAuction(1, { from: account_1 });

        const auction_1_after = await theMarketPlace.getAuction(1);
        assert.equal(auction_1_after.auctionStatus, 3, 'auctionStatus is Canceled');

        // try to buy canceled auction
        errorMessage = 'Auction is not running';
        try {
            await theMarketPlace.buyNowAuction(1, { from: account_2, value: 2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }
    });

    xit('Test: Auction - Bidding', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_1 });

        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 1,
            /* uint256 _buyItNowPrice */ 5,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        let auction = await theMarketPlace.getAuction(1);
        assert.equal(auction.auctionId, 1, 'auction id is 1');
        assert.equal(auction.tokenId, 1, 'token id is 1');
        assert.equal(auction.initialPrice, 1, 'initialPrice is 2');
        assert.equal(auction.buyItNowPrice, 5, 'buyItNowPrice is 5');
        assert.equal(auction.auctionStatus, 0, 'auctionStatus should be Running');
        assert.equal(auction.highestBid, 0, 'highestBid should be 0');
        assert.equal(auction.highestBidderAddress, '0x0000000000000000000000000000000000000000', 'highestBidderAddress should be zero');

        // acount_2 bid 1 eth
        await theMarketPlace.bidAuction(1, { from: account_2, value: 1 });

        auction = await theMarketPlace.getAuction(1);
        assert.equal(auction.auctionId, 1, 'auction id is 1');
        assert.equal(auction.initialPrice, 1, 'initialPrice is 1');
        assert.equal(auction.buyItNowPrice, 5, 'buyItNowPrice is 5');
        assert.equal(auction.auctionStatus, 0, 'auctionStatus should be Running');
        assert.equal(auction.highestBid, 1, 'highestBid should be 1');
        assert.equal(auction.highestBidderAddress, account_2, 'highestBidderAddress should be account_2');

        // acount_3 bid 2 eth
        await theMarketPlace.bidAuction(1, { from: account_3, value: 2 });

        auction = await theMarketPlace.getAuction(1);
        assert.equal(auction.auctionId, 1, 'auction id is 1');
        assert.equal(auction.initialPrice, 1, 'initialPrice is 1');
        assert.equal(auction.buyItNowPrice, 5, 'buyItNowPrice is 5');
        assert.equal(auction.auctionStatus, 0, 'auctionStatus should be Running');
        assert.equal(auction.highestBid, 2, 'highestBid should be 2');
        assert.equal(auction.highestBidderAddress, account_3, 'highestBidderAddress should be account_3');

        // account_2 try to under bid
        let errorMessage = 'Bid is less than highest';
        try {
            await theMarketPlace.bidAuction(1, { from: account_2, value: 1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }
    });

    // xit('Test: Auction - Bidding and funds', async function () {
    //     await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
    //     const collectionitem_1 = await theMarketPlace.getCollection(1);
    //     const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
    //     await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });
    //     await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_1 });

    //     await theMarketPlace.createAuction(
    //         /* address _collectionAddress */ collectionitem_1.collectionAddress,
    //         /* uint256 _tokenId */ 1,
    //         /* uint256 _initialPrice */ 1,
    //         /* uint256 _buyItNowPrice */ 5,
    //         /* uint256 _durationDays */ 2,
    //         { from: account_1 }
    //     );

    //     let balance_account_2 = await web3.eth.getBalance(account_2);
    //     balance_account_2 = web3.utils.fromWei(balance_account_2, 'ether');

    //     let balance_account_3 = await web3.eth.getBalance(account_3);
    //     balance_account_3 = web3.utils.fromWei(balance_account_3, 'ether');

    //     assert.equal(balance_account_2, 1000, 'balance of account_2 should be 1000000000000000000000');
    //     assert.equal(balance_account_3, 1000, 'balance of account_3 should be 1000000000000000000000');

    //     await theMarketPlace.bidAuction(1, { from: account_2, value: 5 });
    //     balance_account_2 = await web3.eth.getBalance(account_2);
    //     // assert.equal(balance_account_2, 1, 'balance of account_2 should be 1000000000000000000000');

    //     await theMarketPlace.bidAuction(1, { from: account_3, value: 7 });
    //     balance_account_3 = await web3.eth.getBalance(account_3);
    //     // assert.equal(balance_account_3, 1, 'balance of account_3 should be 1000000000000000000000');

    //     await theMarketPlace.claimFunds({ from: account_2 });

    //     balance_account_2 = await web3.eth.getBalance(account_2);
    //     assert.equal(balance_account_2, 1, 'balance of account_2 should be 1000000000000000000000');
    // });

    it('Test: DirectOffer - Empty', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_1 });

        const directOffersByOwner = await theMarketPlace.getDirectOffersByOwner(collectionitem_1.collectionAddress, 2, { from: account_1 });
        const directOfferByBuyer = await theMarketPlace.getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2, { from: account_2 });
    });

    xit('Test: DirectOffer - Create', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_1 });

        let errorMessage = 'Already token owner';
        try {
            await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 1, 9, { from: account_1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        errorMessage = 'Offered price cannot be zero';
        try {
            await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 1, 0, { from: account_2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        // create auction to validate direct offer creation no allowed
        await theMarketPlace.createAuction(
            /* address _collectionAddress */ collectionitem_1.collectionAddress,
            /* uint256 _tokenId */ 1,
            /* uint256 _initialPrice */ 0,
            /* uint256 _buyItNowPrice */ 2,
            /* uint256 _durationDays */ 2,
            { from: account_1 }
        );

        errorMessage = 'Auction for this token exists';
        try {
            await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 1, 9, { from: account_2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 9, { from: account_2 });
        const directOfferCount = await theMarketPlace.getDirectOffersByOwner(collectionitem_1.collectionAddress, 2, { from: account_1 });
        assert.equal(directOfferCount.length, 1, "should be 1");

        const directOffer_1 = await theMarketPlace.getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2, { from: account_2 });
        assert.equal(directOffer_1.ownerAddress, account_1, 'Owner is account_1');
        assert.equal(directOffer_1.collectionAddress, collectionitem_1.collectionAddress, 'Collection address is ok');
        assert.equal(directOffer_1.buyerAddress, account_2, 'buyerAddress is account_2');
        assert.equal(directOffer_1.directOfferId, 1, 'Direct offer id is 1');
        assert.equal(directOffer_1.tokenId, 2, 'Token Id is 2');
        assert.equal(directOffer_1.offeredPrice, 9, 'offeredPrice is 9');
        assert.equal(directOffer_1.directOfferStatus, 0, 'directOfferStatus is zero');

        // create second direct offer
        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 5, { from: account_2 });

        const directOfferCount_2 = await theMarketPlace.getDirectOffersByOwner(collectionitem_1.collectionAddress, 2, { from: account_1 });
        assert.equal(directOfferCount_2.length, 1, "Count should be 1");

        const directOfferBy_1 = await theMarketPlace.getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2, { from: account_2 });
        assert.equal(directOfferBy_1.ownerAddress, account_1, 'Owner is account_1');
        assert.equal(directOfferBy_1.collectionAddress, collectionitem_1.collectionAddress, 'Collection address is ok');
        assert.equal(directOfferBy_1.buyerAddress, account_2, 'buyerAddress is account_2');
        assert.equal(directOfferBy_1.directOfferId, 2, 'Direct offer id is 2');
        assert.equal(directOfferBy_1.tokenId, 2, 'Token Id is 2');
        assert.equal(directOfferBy_1.offeredPrice, 5, 'offeredPrice is 5');
        assert.equal(directOfferBy_1.directOfferStatus, 0, 'directOfferStatus is zero');
    });

    xit('Test: DirectOffer - Create ovveride', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_1 });

        // create to offers by the same buyer
        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 9, { from: account_2 });
        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 5, { from: account_2 });

        const directOffers = await theMarketPlace.getDirectOffersByOwner(collectionitem_1.collectionAddress, 2, { from: account_1 });
        assert.equal(directOffers.length, 1, "Count should be 1");
        assert.equal(directOffers[0].ownerAddress, account_1, 'Owner is account_1');
        assert.equal(directOffers[0].collectionAddress, collectionitem_1.collectionAddress, 'Collection address is ok');
        assert.equal(directOffers[0].buyerAddress, account_2, 'buyerAddress is account_2');
        assert.equal(directOffers[0].directOfferId, 2, 'Direct offer id is 2');
        assert.equal(directOffers[0].tokenId, 2, 'Token Id is 2');
        assert.equal(directOffers[0].offeredPrice, 5, 'offeredPrice is 5');
        assert.equal(directOffers[0].directOfferStatus, 0, 'directOfferStatus is zero');

        // create again
        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 7, { from: account_2 });

        const directOfferSingle = await theMarketPlace.getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2, { from: account_2 });
        assert.equal(directOfferSingle.buyerAddress, account_2, 'buyerAddress is account_2');
        assert.equal(directOfferSingle.directOfferId, 3, 'Direct offer id is 3');
        assert.equal(directOfferSingle.tokenId, 2, 'Token Id is 2');
        assert.equal(directOfferSingle.offeredPrice, 7, 'offeredPrice is 7');
    });

    xit('Test: DirectOffer - Create multi and cancel', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_1 });

        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 9, { from: account_2 });
        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 5, { from: account_2 });

        let directOffersFor_2 = await theMarketPlace.getDirectOffersByOwner(collectionitem_1.collectionAddress, 2, { from: account_1 });
        assert.equal(directOffersFor_2.length, 1, "Count should be 1");

        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 50, { from: account_3 });
        directOffersFor_2 = await theMarketPlace.getDirectOffersByOwner(collectionitem_1.collectionAddress, 2, { from: account_1 });
        assert.equal(directOffersFor_2.length, 2, "Count should be 2");

        let errorMessage = 'Offer not found';
        try {
            await theMarketPlace.cancelDirectOffer(collectionitem_1.collectionAddress, 2, { from: account_1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        await theMarketPlace.cancelDirectOffer(collectionitem_1.collectionAddress, 2, { from: account_2 });

        errorMessage = 'Offer not found';
        try {
            const offerAfterCancel = await theMarketPlace.getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2, { from: account_2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        directOffersFor_2 = await theMarketPlace.getDirectOffersByOwner(collectionitem_1.collectionAddress, 2, { from: account_1 });
        assert.equal(directOffersFor_2.length, 1, "Count should be 1");
    });

    xit('Test: DirectOffer - Accept and transfer', async function () {
        await theMarketPlace.createCollection('Symbol', 'SYM', 'collectionURI_1', { from: account_1 });
        const collectionitem_1 = await theMarketPlace.getCollection(1);
        const collectionContract_1 = await NFTCollection.at(collectionitem_1.collectionAddress);
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_1', { from: account_1 });
        await theMarketPlace.mint(collectionitem_1.collectionAddress, '_tokenURI_2', { from: account_1 });

        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 5, { from: account_2 }); // 1
        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 9, { from: account_2 }); // 2 (override)
        await theMarketPlace.createDirectOffer(collectionitem_1.collectionAddress, 2, 7, { from: account_3 }); // 3

        let errorMessage = 'Not token owner';
        try {
            await theMarketPlace.acceptDirectOffer(collectionitem_1.collectionAddress, 2, account_2, { from: account_2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        await theMarketPlace.acceptDirectOffer(collectionitem_1.collectionAddress, 2, account_2, { from: account_1 });

        const directOfferSingle = await theMarketPlace.getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2, { from: account_2 });
        assert.equal(directOfferSingle.ownerAddress, account_1, 'Owner is account_1');
        assert.equal(directOfferSingle.collectionAddress, collectionitem_1.collectionAddress, 'Collection address is ok');
        assert.equal(directOfferSingle.buyerAddress, account_2, 'buyerAddress is account_2');
        assert.equal(directOfferSingle.directOfferId, 2, 'Direct offer id is 1');
        assert.equal(directOfferSingle.tokenId, 2, 'Token Id is 2');
        assert.equal(directOfferSingle.offeredPrice, 9, 'offeredPrice is 9');
        assert.equal(directOfferSingle.directOfferStatus, 1, 'directOfferStatus is Accepted (1)');

        errorMessage = 'Offer is not accepted';
        try {
            await theMarketPlace.fulfillDirectOffer(collectionitem_1.collectionAddress, 2, { from: account_3, value: 9 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        errorMessage = 'Offered price is incorrect';
        try {
            await theMarketPlace.fulfillDirectOffer(collectionitem_1.collectionAddress, 2, { from: account_2, value: 2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search(errorMessage), -1, errorMessage);
        }

        const approved_2 = await collectionContract_1.getApproved(2);
        assert.equal(approved_2, theMarketPlace.address, 'MarketPlace is approved');

        await theMarketPlace.fulfillDirectOffer(collectionitem_1.collectionAddress, 2, { from: account_2, value: 9 });

        const newOwner_2 = await collectionContract_1.ownerOf(2);
        assert.notEqual(newOwner_2, account_1, 'New owner is not account_1');
        assert.equal(newOwner_2, account_2, 'New owner is account_2');
    });
});