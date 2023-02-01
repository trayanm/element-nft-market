const chai = require('chai');
const { ethers, waffle, network } = require('hardhat');
chai.use(waffle.solidity);
const expect = chai.expect;

const { createPermit, diamondAsFacet, getInterfaceId, getSelectors, enumFacetCutAction } = require('../scripts/util');

const formatPrice = (buyItNowPrice) => {
    const DECIMALS = (10 ** 18);

    const ether = wei => wei / DECIMALS;

    const precision = 100; // Use 2 decimal places

    buyItNowPrice = ether(buyItNowPrice);
    buyItNowPrice = Math.round(buyItNowPrice * precision) / precision;

    return buyItNowPrice;
};

describe('MarketPlace', async () => {
    let account_owner;
    let account_1;
    let account_2;
    let account_3;
    let account_4;
    let account_5;
    let account_6;
    let account_7;
    let account_8;
    let account_9;

    let NFTCollectionFactory;

    let router;
    let auctionFacet;
    let calculatorFacet;
    let collectionFacet;
    let diamondCutFacet;
    let diamondLoupeFacet;
    let directOfferFacet;
    let ownershipFacet;
    let pausableFacet;

    const feePercentage = 3_000;
    const precision = 100_000;

    before(async () => {
        // test accounts
        [
            account_owner,
            account_1,
            account_2,
            account_3,
            account_4,
            account_5,
            account_6,
            account_7,
            account_8,
            account_9
        ] = await ethers.getSigners();

        console.log('balance: account_owner', ethers.utils.formatEther(await ethers.provider.getBalance(account_owner.address)));
        console.log('balance: account_1', ethers.utils.formatEther(await ethers.provider.getBalance(account_1.address)));
        console.log('balance: account_2', ethers.utils.formatEther(await ethers.provider.getBalance(account_2.address)));
        console.log('balance: account_3', ethers.utils.formatEther(await ethers.provider.getBalance(account_3.address)));
        console.log('balance: account_4', ethers.utils.formatEther(await ethers.provider.getBalance(account_4.address)));
        console.log('balance: account_5', ethers.utils.formatEther(await ethers.provider.getBalance(account_5.address)));
        console.log('balance: account_6', ethers.utils.formatEther(await ethers.provider.getBalance(account_6.address)));
        console.log('balance: account_7', ethers.utils.formatEther(await ethers.provider.getBalance(account_7.address)));
        console.log('balance: account_8', ethers.utils.formatEther(await ethers.provider.getBalance(account_8.address)));
        console.log('balance: account_9', ethers.utils.formatEther(await ethers.provider.getBalance(account_9.address)));
        console.log('--')

        NFTCollectionFactory = await ethers.getContractFactory('NftCollection');

        // deploy facets
        const auctionFacetFactory = await ethers.getContractFactory('AuctionFacet');
        auctionFacet = await auctionFacetFactory.deploy();
        auctionFacet.deployed();

        const calculatorFacetFactory = await ethers.getContractFactory('CalculatorFacet');
        calculatorFacet = await calculatorFacetFactory.deploy();
        await calculatorFacet.deployed();

        const collectionFacetFactory = await ethers.getContractFactory('CollectionFacet');
        collectionFacet = await collectionFacetFactory.deploy();
        await collectionFacet.deployed();

        const diamondCutFacetFactory = await ethers.getContractFactory('DiamondCutFacet');
        diamondCutFacet = await diamondCutFacetFactory.deploy();
        await diamondCutFacet.deployed();

        const diamondLoupeFacetFactory = await ethers.getContractFactory('DiamondLoupeFacet');
        diamondLoupeFacet = await diamondLoupeFacetFactory.deploy();
        await diamondLoupeFacet.deployed();

        const directOfferFacetFactory = await ethers.getContractFactory('DirectOfferFacet');
        directOfferFacet = await directOfferFacetFactory.deploy();
        await directOfferFacet.deployed();

        const ownershipFacetFactory = await ethers.getContractFactory('OwnershipFacet');
        ownershipFacet = await ownershipFacetFactory.deploy();
        await ownershipFacet.deployed();

        const pausableFacetFactory = await ethers.getContractFactory('PausableFacet');
        pausableFacet = await pausableFacetFactory.deploy();
        await pausableFacet.deployed();

        // diamond cut
        const diamondCut = [
            // 0 stands for FacetCutAction.Add
            [auctionFacet.address, enumFacetCutAction.Add, getSelectors(auctionFacet)],
            [calculatorFacet.address, enumFacetCutAction.Add, getSelectors(calculatorFacet)],
            [collectionFacet.address, enumFacetCutAction.Add, getSelectors(collectionFacet)],
            [diamondCutFacet.address, enumFacetCutAction.Add, getSelectors(diamondCutFacet)],
            [diamondLoupeFacet.address, enumFacetCutAction.Add, getSelectors(diamondLoupeFacet)],
            [directOfferFacet.address, enumFacetCutAction.Add, getSelectors(directOfferFacet)],
            [ownershipFacet.address, enumFacetCutAction.Add, getSelectors(ownershipFacet)],
            [pausableFacet.address, enumFacetCutAction.Add, getSelectors(pausableFacet)]
        ];

        const args = [
            account_owner.address
        ];

        // deploy diamond
        const diamondFactory = await ethers.getContractFactory('MarketPlaceDiamond');
        const diamond = await diamondFactory.deploy(diamondCut, args);
        await diamond.deployed();

        // cut
        router = await ethers.getContractAt('IMarketPlaceDiamond', diamond.address);

        // init
        console.log(`initFeeCalculator(feePercentage: ${feePercentage}, precision: ${precision})`);
        const initGovernanceTx = await (await router.initFeeCalculator(feePercentage, precision));
        await initGovernanceTx.wait();

        // print log
        console.log('Diamond address: ', diamond.address);
        console.log('AuctionFacet address: ', auctionFacet.address);
        console.log('CalculatorFacet address: ', calculatorFacet.address);
        console.log('CollectionFacet address: ', collectionFacet.address);
        console.log('DiamondCutFacet address: ', diamondCutFacet.address);
        console.log('DiamondLoupeFacet address: ', diamondLoupeFacet.address);
        console.log('DirectOfferFacet address: ', directOfferFacet.address);
        console.log('OwnershipFacet address: ', ownershipFacet.address);
        console.log('PausableFacet address: ', pausableFacet.address);
    });

    beforeEach(async function () {
        snapshotId = await ethers.provider.send('evm_snapshot', []);
    });

    afterEach(async function () {
        await ethers.provider.send('evm_revert', [snapshotId]);
    });

    describe('setup', async () => {
        it('should successfully deploy Router contract', async () => {
            expect(router.address).to.be.properAddress;
            expect(auctionFacet.address).to.be.properAddress;
            expect(calculatorFacet.address).to.be.properAddress;
            expect(collectionFacet.address).to.be.properAddress;
            expect(diamondCutFacet.address).to.be.properAddress;
            expect(diamondLoupeFacet.address).to.be.properAddress;
            expect(directOfferFacet.address).to.be.properAddress;
            expect(ownershipFacet.address).to.be.properAddress;
            expect(pausableFacet.address).to.be.properAddress;

            // calc
            expect(await router.getPrecision()).to.equal(precision);
            expect(await router.getFeePercentage()).to.equal(feePercentage);

            expect(await router.facetAddresses())
                .to.include(auctionFacet.address)
                .to.include(calculatorFacet.address)
                .to.include(collectionFacet.address)
                .to.include(diamondCutFacet.address)
                .to.include(diamondLoupeFacet.address)
                .to.include(directOfferFacet.address)
                .to.include(ownershipFacet.address)
                .to.include(pausableFacet.address);

            const facets = await router.facets();
            for (const facet of facets) {
                switch (facet.facetAddress) {
                    case auctionFacet.address: expect(facet.functionSelectors).to.deep.equal(getSelectors(auctionFacet)); break;
                    case calculatorFacet.address: expect(facet.functionSelectors).to.deep.equal(getSelectors(calculatorFacet)); break;
                    case collectionFacet.address: expect(facet.functionSelectors).to.deep.equal(getSelectors(collectionFacet)); break;
                    case diamondCutFacet.address: expect(facet.functionSelectors).to.deep.equal(getSelectors(diamondCutFacet)); break;
                    case diamondLoupeFacet.address: expect(facet.functionSelectors).to.deep.equal(getSelectors(diamondLoupeFacet)); break;
                    case directOfferFacet.address: expect(facet.functionSelectors).to.deep.equal(getSelectors(directOfferFacet)); break;
                    case ownershipFacet.address: expect(facet.functionSelectors).to.deep.equal(getSelectors(ownershipFacet)); break;
                    case pausableFacet.address: expect(facet.functionSelectors).to.deep.equal(getSelectors(pausableFacet)); break;
                    default:
                        throw 'invalid facet address'
                }
            }

            expect(await router.supportsInterface(getInterfaceId(ownershipFacet))).to.be.true;
        });
    });

    describe('Collection', async () => {
        it('Create', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            await router.connect(account_2).createCollection('Doodle', 'DOO', 'collectionURI_2');

            const collectionCount = await router.getCollectionCount();
            expect(collectionCount).to.equal(2);

            const collectionitem_1 = await router.getCollection(1);
            expect(collectionitem_1.ownerAddress).to.equal(account_1.address);

            const collectionitem_2 = await router.getCollection(2);
            expect(collectionitem_2.ownerAddress).to.equal(account_2.address);

            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);

            const name = await collectionContract_1.name();
            const symbol = await collectionContract_1.symbol();

            expect(name).to.equal('Symbol');
            expect(symbol).to.equal('SYM');

            let canMint = await collectionContract_1.canMint(account_1.address);
            expect(canMint).to.be.true;

            canMint = await collectionContract_1.canMint(account_2.address);
            expect(canMint).to.be.false;
        });

        it('Mint via collection', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_1');
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_2');

            await expect(collectionContract_1.connect(account_2).safeMint('_tokenURI_3')).to.be.revertedWith('ERC721PresetMinterPauserAutoId: must have minter role to mint');

            await expect(collectionContract_1.connect(account_1).safeMint('_tokenURI_2')).to.be.revertedWith('The token URI should be unique');
        });

        it('Mint external', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);

            await expect(collectionContract_1.connect(account_1).diamondMint(account_1.address, '_tokenURI_1')).to.be.revertedWith('ERC721PresetMinterPauserAutoId: must have admin role to mint');
        });

        it('Mint', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);

            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');

            await expect(router.connect(account_2).mint(collectionitem_1.collectionAddress, '_tokenURI_2')).to.be.revertedWith('ERC721PresetMinterPauserAutoId: must have minter role to mint');

            const newOwner_1 = await collectionContract_1.ownerOf(1);
            expect(newOwner_1).to.equal(account_1.address);

            const approved_1 = await collectionContract_1.getApproved(1);
            expect(approved_1).to.equal(router.address);
        });
    });

    describe('Auction', async () => {
        it('Bidding and funds', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_2');

            // acount_1 create auction
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ ethers.utils.parseEther('1'),
                /* uint256 _buyItNowPrice */ ethers.utils.parseEther('5'),
                /* uint256 _durationDays */ 2
            );

            let balance_account_owner = await ethers.provider.getBalance(account_owner.address);
            balance_account_owner = ethers.utils.formatEther(balance_account_owner);
            expect(parseInt(balance_account_owner)).to.be.lessThan(10000);

            let balance_account_2 = await ethers.provider.getBalance(account_2.address);
            balance_account_2 = ethers.utils.formatEther(balance_account_2);
            expect(parseInt(balance_account_2)).to.be.lessThan(10001);

            // auction_2 bid -> check account_2
            await router.connect(account_2).bidAuction(1, { value: ethers.utils.parseEther('2') });
            balance_account_2 = await ethers.provider.getBalance(account_2.address);
            balance_account_2 = ethers.utils.formatEther(balance_account_2);
            expect(parseInt(balance_account_2)).to.be.lessThan(9998);

            // account_3 buy now -> check account_3
            await router.connect(account_3).buyNowAuction(1, { value: ethers.utils.parseEther('5') });
            let balance_account_3 = await ethers.provider.getBalance(account_3.address);
            balance_account_3 = ethers.utils.formatEther(balance_account_3);
            expect(parseInt(balance_account_3)).to.be.lessThan(9995);

            // account_1 claims on successful sale -> check_account_1
            await router.connect(account_1).claimFunds();
            let balance_account_1 = await ethers.provider.getBalance(account_1.address);
            balance_account_1 = ethers.utils.formatEther(balance_account_1);
            expect(parseInt(balance_account_1)).to.be.greaterThan(10001);

            // account_2 claims on bid returns-> check_account_2
            await router.connect(account_2).claimFunds();
            balance_account_2 = await ethers.provider.getBalance(account_2.address);
            balance_account_2 = ethers.utils.formatEther(balance_account_2);
            expect(parseInt(balance_account_2)).to.be.greaterThan(9998);

            // MaprketPlace profit -> check
            await router.connect(account_owner).withdrawProfit();
            balance_account_owner = await ethers.provider.getBalance(account_owner.address);
            balance_account_owner = ethers.utils.formatEther(balance_account_owner);
            expect(parseInt(balance_account_owner)).to.be.greaterThanOrEqual(9999);
        });

        it('Create', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_1');
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_2');
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_3');
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_4');

            await expect(router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            )).to.be.revertedWith('MarketPlace is not approved');

            await collectionContract_1.connect(account_1).approve(router.address, 1);
            await router.connect(account_1).createAuction(
                    /* address _collectionAddress */ collectionitem_1.collectionAddress,
                    /* uint256 _tokenId */ 1,
                    /* uint256 _initialPrice */ 0,
                    /* uint256 _buyItNowPrice */ 2,
                    /* uint256 _durationDays */ 2
            );

            await collectionContract_1.connect(account_1).approve(router.address, 2);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                    /* uint256 _tokenId */ 2,
                    /* uint256 _initialPrice */ 0,
                    /* uint256 _buyItNowPrice */ 3,
                    /* uint256 _durationDays */ 2
            );

            const auction_1 = await router.getAuction(1);
            expect(auction_1.auctionId).to.equal(1);
            expect(auction_1.tokenId).to.equal(1);
            expect(auction_1.buyItNowPrice).to.equal(2);
            expect(auction_1.auctionStatus).to.equal(0);

            await expect(router.connect(account_2).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 1,
                /* uint256 _durationDays */ 2
            )).to.be.revertedWith('Not token owner');

            // create auction twice
            await collectionContract_1.connect(account_1).approve(router.address, 3);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 3,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            );

            await expect(router.connect(account_1).createAuction(
                    /* address _collectionAddress */ collectionitem_1.collectionAddress,
                    /* uint256 _tokenId */ 3,
                    /* uint256 _initialPrice */ 2,
                        /* uint256 _buyItNowPrice */ 4,
                    /* uint256 _durationDays */ 2
            )).to.be.revertedWith('Auction for this token exists');
        });


        it('Get', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_1');
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_2');

            await collectionContract_1.connect(account_1).approve(router.address, 1);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            );

            const auction_Get = await router.getAuction(1);
            const auction_GetBy = await router.getAuctionBy(collectionitem_1.collectionAddress, 1);

            expect(auction_Get.auctionId).to.equal(auction_GetBy.auctionId);
            expect(auction_Get.tokenId).to.equal(auction_GetBy.tokenId);
            expect(auction_Get.buyItNowPrice).to.equal(auction_GetBy.buyItNowPrice);
            expect(auction_Get.auctionStatus).to.equal(auction_GetBy.auctionStatus);
        });

        it('Buy now violations', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_1');
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_2');

            await collectionContract_1.connect(account_1).approve(router.address, 1);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            );

            await collectionContract_1.connect(account_1).approve(router.address, 2);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 2,
                /* uint256 _initialPrice */ 1,
                /* uint256 _buyItNowPrice */ 0,
                /* uint256 _durationDays */ 2
            );

            await expect(router.connect(account_1).createAuction(
                 /* address _collectionAddress */ collectionitem_1.collectionAddress,
                 /* uint256 _tokenId */ 999,
                 /* uint256 _initialPrice */ 0,
                 /* uint256 _buyItNowPrice */ 1,
                 /* uint256 _durationDays */ 2
            )).to.be.revertedWith('ERC721: owner query for nonexistent token');

            await expect(router.connect(account_1).buyNowAuction(1)).to.be.revertedWith('Auction owner cannot buy it');

            await expect(router.connect(account_2).buyNowAuction(1, { value: 1 })).to.be.revertedWith('Buy now price is greater');

            await expect(router.connect(account_2).buyNowAuction(2, { value: 1 })).to.be.revertedWith('Buy now is not allowed');
        });

        it('Buy now and transfer', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_1');
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_2');

            await collectionContract_1.connect(account_1).approve(router.address, 1);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            );

            await collectionContract_1.connect(account_1).approve(router.address, 2);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 2,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 3,
                /* uint256 _durationDays */ 2
            );

            // buy now other's nft
            await router.connect(account_2).buyNowAuction(1, { value: 2 });

            const auction_1_after = await router.getAuction(1);
            expect(auction_1_after.auctionStatus).to.equal(2);

            const newOwner_1 = await collectionContract_1.ownerOf(1);
            expect(newOwner_1).to.equal(account_2.address);
        });

        it('Buy now and transfer after MarketPlace mint', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_2');

            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            );

            //await collectionContract_1.approve(router.address, 2);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 2,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 3,
                /* uint256 _durationDays */ 2
            );

            // buy now other's nft
            await router.connect(account_2).buyNowAuction(1, { value: 2 });

            const auction_1_after = await router.getAuction(1);
            expect(auction_1_after.auctionStatus).to.equal(2);

            const newOwner_1 = await collectionContract_1.ownerOf(1);
            expect(newOwner_1).to.equal(account_2.address);
        });

        it('Buy now and sell again', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_1');

            await collectionContract_1.connect(account_1).approve(router.address, 1);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            );

            // buy now other's nft
            await router.connect(account_2).buyNowAuction(1, { value: 2 });

            const auction_1_after = await router.getAuction(1);
            expect(auction_1_after.auctionStatus).to.equal(2, 'auctionStatus should be Finished');

            const newOwner_1 = await collectionContract_1.ownerOf(1);
            expect(newOwner_1).to.equal(account_2.address);

            // account_2 create new auction
            await collectionContract_1.connect(account_2).approve(router.address, 1);
            await router.connect(account_2).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 2,
                /* uint256 _buyItNowPrice */ 4,
                /* uint256 _durationDays */ 2
            );

            // const auction_2 = await router.getAuctionBy(collectionitem_1.collectionAddress, 1);
            const auction_2 = await router.getAuction(2);
            expect(auction_2.auctionId).to.equal(2);
            expect(auction_2.initialPrice).to.equal(2);
            expect(auction_2.buyItNowPrice).to.equal(4);
            expect(auction_2.auctionStatus).to.equal(0);
        });

        it('Cancel', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_1');
            await collectionContract_1.connect(account_1).safeMint('_tokenURI_2');

            await collectionContract_1.connect(account_1).approve(router.address, 1);
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            );

            await expect(router.connect(account_2).cancelAuction(1)).to.be.revertedWith('Only auction owner can cancel');

            await router.connect(account_1).cancelAuction(1);

            const auction_1_after = await router.getAuction(1);
            expect(auction_1_after.auctionStatus).to.equal(3);
        });

        it('Bidding', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_2');

            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 1,
                /* uint256 _buyItNowPrice */ 5,
                /* uint256 _durationDays */ 2
            );

            let auction = await router.getAuction(1);
            expect(auction.auctionId).to.equal(1);
            expect(auction.tokenId).to.equal(1);
            expect(auction.initialPrice).to.equal(1);
            expect(auction.buyItNowPrice).to.equal(5);
            expect(auction.auctionStatus).to.equal(0);
            expect(auction.highestBid).to.equal(0);
            expect(auction.highestBidderAddress).to.equal(ethers.constants.AddressZero);

            // acount_2 bid 1 eth
            await router.connect(account_2).bidAuction(1, { value: 1 });

            auction = await router.getAuction(1);
            expect(auction.auctionId).to.equal(1);
            expect(auction.initialPrice).to.equal(1);
            expect(auction.buyItNowPrice).to.equal(5);
            expect(auction.auctionStatus).to.equal(0);
            expect(auction.highestBid).to.equal(1);
            expect(auction.highestBidderAddress).to.equal(account_2.address);

            // acount_3 bid 2 eth
            await router.connect(account_3).bidAuction(1, { value: 2 });

            auction = await router.getAuction(1);
            expect(auction.auctionId).to.equal(1);
            expect(auction.initialPrice).to.equal(1);
            expect(auction.buyItNowPrice).to.equal(5);
            expect(auction.auctionStatus).to.equal(0);
            expect(auction.highestBid).to.equal(2);
            expect(auction.highestBidderAddress).to.equal(account_3.address);

            // account_2 try to under bid
            await expect(router.connect(account_2).bidAuction(1, { value: 1 })).to.be.revertedWith('Bid is less than highest');
        });
    });

    describe('Direct Offer', async () => {
        it('Empty', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_2');

            await expect(router.connect(account_1).getDirectOffersByOwner(collectionitem_1.collectionAddress, 2)).to.be.revertedWith('Offers not found');

            await expect(router.connect(account_2).getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2)).to.be.revertedWith('Offer not found');
        });

        it('Create', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_2');

            await expect(router.connect(account_1).createDirectOffer(collectionitem_1.collectionAddress, 1, 9)).to.be.revertedWith('Already token owner');

            await expect(router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 1, 0)).to.be.revertedWith('Offered price cannot be zero');

            // create auction to validate direct offer creation no allowed
            await router.connect(account_1).createAuction(
                /* address _collectionAddress */ collectionitem_1.collectionAddress,
                /* uint256 _tokenId */ 1,
                /* uint256 _initialPrice */ 0,
                /* uint256 _buyItNowPrice */ 2,
                /* uint256 _durationDays */ 2
            );

            await expect(router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 1, 9)).to.be.revertedWith('Auction for this token exists');

            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 9);
            const directOfferCount = await router.connect(account_1).getDirectOffersByOwner(collectionitem_1.collectionAddress, 2);
            expect(directOfferCount.length).to.equal(1);

            const directOffer_1 = await router.connect(account_2).getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2);
            expect(directOffer_1.ownerAddress).to.equal(account_1.address);
            expect(directOffer_1.collectionAddress).to.equal(collectionitem_1.collectionAddress);
            expect(directOffer_1.buyerAddress).to.equal(account_2.address);
            expect(directOffer_1.directOfferId).to.equal(1);
            expect(directOffer_1.tokenId).to.equal(2);
            expect(directOffer_1.offeredPrice).to.equal(9);
            expect(directOffer_1.directOfferStatus).to.equal(0);

            // create second direct offer
            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 5);

            const directOfferCount_2 = await router.connect(account_1).getDirectOffersByOwner(collectionitem_1.collectionAddress, 2);
            expect(directOfferCount_2.length).to.equal(1);

            const directOfferBy_1 = await router.connect(account_2).getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2);
            expect(directOfferBy_1.ownerAddress).to.equal(account_1.address);
            expect(directOfferBy_1.collectionAddress).to.equal(collectionitem_1.collectionAddress);
            expect(directOfferBy_1.buyerAddress).to.equal(account_2.address);
            expect(directOfferBy_1.directOfferId).to.equal(2);
            expect(directOfferBy_1.tokenId).to.equal(2);
            expect(directOfferBy_1.offeredPrice).to.equal(5);
            expect(directOfferBy_1.directOfferStatus).to.equal(0);
        });

        it('Create ovveride', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_2');

            // create to offers by the same buyer
            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 9);
            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 5);

            const directOffers = await router.connect(account_1).getDirectOffersByOwner(collectionitem_1.collectionAddress, 2);
            expect(directOffers.length).to.equal(1);
            expect(directOffers[0].ownerAddress).to.equal(account_1.address);
            expect(directOffers[0].collectionAddress).to.equal(collectionitem_1.collectionAddress);
            expect(directOffers[0].buyerAddress).to.equal(account_2.address);
            expect(directOffers[0].directOfferId).to.equal(2);
            expect(directOffers[0].tokenId).to.equal(2);
            expect(directOffers[0].offeredPrice).to.equal(5);
            expect(directOffers[0].directOfferStatus).to.equal(0);

            // create again
            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 7);

            const directOfferSingle = await router.connect(account_2).getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2);
            expect(directOfferSingle.buyerAddress).to.equal(account_2.address);
            expect(directOfferSingle.directOfferId).to.equal(3);
            expect(directOfferSingle.tokenId).to.equal(2);
            expect(directOfferSingle.offeredPrice).to.equal(7);
        });

        it('Create multi and cancel', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_2');

            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 9);
            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 5);

            let directOffersFor_2 = await router.connect(account_1).getDirectOffersByOwner(collectionitem_1.collectionAddress, 2);
            expect(directOffersFor_2.length).to.equal(1);

            await router.connect(account_3).createDirectOffer(collectionitem_1.collectionAddress, 2, 50);
            directOffersFor_2 = await router.connect(account_1).getDirectOffersByOwner(collectionitem_1.collectionAddress, 2);
            expect(directOffersFor_2.length).to.equal(2);

            await expect(router.connect(account_1).cancelDirectOffer(collectionitem_1.collectionAddress, 2)).to.be.revertedWith('Offer not found');

            await router.connect(account_2).cancelDirectOffer(collectionitem_1.collectionAddress, 2);

            await expect(router.connect(account_2).getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2)).to.be.revertedWith('Offer not found');

            directOffersFor_2 = await router.connect(account_1).getDirectOffersByOwner(collectionitem_1.collectionAddress, 2);
            expect(directOffersFor_2.length).to.equal(1);
        });

        it('Accept and transfer', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_2');

            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 5); // 1
            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 2, 9); // 2 (override)
            await router.connect(account_3).createDirectOffer(collectionitem_1.collectionAddress, 2, 7); // 3

            await expect(router.connect(account_2).acceptDirectOffer(collectionitem_1.collectionAddress, 2, account_2.address)).to.be.revertedWith('Not token owner');

            await router.connect(account_1).acceptDirectOffer(collectionitem_1.collectionAddress, 2, account_2.address);

            const directOfferSingle = await router.connect(account_2).getDirectOfferByBuyer(collectionitem_1.collectionAddress, 2);
            expect(directOfferSingle.ownerAddress).to.equal(account_1.address);
            expect(directOfferSingle.collectionAddress).to.equal(collectionitem_1.collectionAddress);
            expect(directOfferSingle.buyerAddress).to.equal(account_2.address);
            expect(directOfferSingle.directOfferId).to.equal(2);
            expect(directOfferSingle.tokenId).to.equal(2);
            expect(directOfferSingle.offeredPrice).to.equal(9);
            expect(directOfferSingle.directOfferStatus).to.equal(1);

            await expect(router.connect(account_3).fulfillDirectOffer(collectionitem_1.collectionAddress, 2, { value: 9 })).to.be.revertedWith('Offer is not accepted');

            await expect(router.connect(account_2).fulfillDirectOffer(collectionitem_1.collectionAddress, 2, { value: 2 })).to.be.revertedWith('Offered price is incorrect');

            const approved_2 = await collectionContract_1.getApproved(2);
            expect(approved_2).to.equal(router.address);

            await router.connect(account_2).fulfillDirectOffer(collectionitem_1.collectionAddress, 2, { value: 9 });

            const newOwner_2 = await collectionContract_1.ownerOf(2);
            expect(newOwner_2).to.not.equal(account_1.address);
            expect(newOwner_2).to.equal(account_2.address);
        });

        it('Violation after transfer', async function () {
            await router.connect(account_1).createCollection('Symbol', 'SYM', 'collectionURI_1');
            const collectionitem_1 = await router.getCollection(1);
            const collectionContract_1 = await NFTCollectionFactory.attach(collectionitem_1.collectionAddress);
            await router.connect(account_1).mint(collectionitem_1.collectionAddress, '_tokenURI_1');

            await router.connect(account_2).createDirectOffer(collectionitem_1.collectionAddress, 1, 5); // 1
            await router.connect(account_3).createDirectOffer(collectionitem_1.collectionAddress, 1, 9); //

            await router.connect(account_1).acceptDirectOffer(collectionitem_1.collectionAddress, 1, account_2.address);
            await router.connect(account_1).acceptDirectOffer(collectionitem_1.collectionAddress, 1, account_3.address);

            await router.connect(account_2).fulfillDirectOffer(collectionitem_1.collectionAddress, 1, { value: 5 });

            const newOwner_2 = await collectionContract_1.ownerOf(1);
            expect(newOwner_2).to.not.equal(account_1.address);
            expect(newOwner_2).to.equal(account_2.address);

            await expect(router.connect(account_3).getDirectOfferByBuyer(collectionitem_1.collectionAddress, 1)).to.be.revertedWith('Offer not found');

            await expect( router.connect(account_3).fulfillDirectOffer(collectionitem_1.collectionAddress, 1, { value: 9 })).to.be.revertedWith('Offer not found');
        });
    });
});