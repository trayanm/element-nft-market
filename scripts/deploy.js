const hardhat = require('hardhat');
const ethers = hardhat.ethers;

const { getSelectors, enumFacetCutAction } = require('./util');

// AuctionFacet
// CalculatorFacet
// CollectionFacet
// DiamondCutFacet
// DiamondLoupeFacet
// DirectOfferFacet
// OwnershipFacet
// PausableFacet

// auctionFacet
// calculatorFacet
// collectionFacet
// diamondCutFacet
// diamondLoupeFacet
// directOfferFacet
// ownershipFacet
// pausableFacet

async function deployDiamond(owner, feePercentage, precision) {
    await hardhat.run('compile');

    // deploy facets
    const auctionFacetFactory = await ethers.getContractFactory('AuctionFacet');
    auctionFacet = await auctionFacetFactory.deploy();
    console.log('Deploying AuctionFacet, please wait...');
    auctionFacet.deployed();

    const calculatorFacetFactory = await ethers.getContractFactory('CalculatorFacet');
    calculatorFacet = await calculatorFacetFactory.deploy();
    console.log('Deploying CalculatorFacet, please wait...');
    await calculatorFacet.deployed();

    const collectionFacetFactory = await ethers.getContractFactory('CollectionFacet');
    collectionFacet = await collectionFacetFactory.deploy();
    console.log('Deploying CollectionFacet, please wait...');
    await collectionFacet.deployed();

    const diamondCutFacetFactory = await ethers.getContractFactory('DiamondCutFacet');
    diamondCutFacet = await diamondCutFacetFactory.deploy();
    console.log('Deploying DiamondCutFacet, please wait...');
    await diamondCutFacet.deployed();

    const diamondLoupeFacetFactory = await ethers.getContractFactory('DiamondLoupeFacet');
    diamondLoupeFacet = await diamondLoupeFacetFactory.deploy();
    console.log('Deploying DiamondLoupeFacet, please wait...');
    await diamondLoupeFacet.deployed();

    const directOfferFacetFactory = await ethers.getContractFactory('DirectOfferFacet');
    directOfferFacet = await directOfferFacetFactory.deploy();
    console.log('Deploying DirectOfferFacet, please wait...');
    await directOfferFacet.deployed();

    const ownershipFacetFactory = await ethers.getContractFactory('OwnershipFacet');
    ownershipFacet = await ownershipFacetFactory.deploy();
    console.log('Deploying OwnershipFacet, please wait...');
    await ownershipFacet.deployed();

    const pausableFacetFactory = await ethers.getContractFactory('PausableFacet');
    pausableFacet = await pausableFacetFactory.deploy();
    console.log('Deploying PausableFacet, please wait...');
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
        owner
    ];

    // deploy diamond
    const diamondFactory = await ethers.getContractFactory('MarketPlaceDiamond');
    diamond = await diamondFactory.deploy(diamondCut, args);
    console.log('Deploying Diamond, please wait...');
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

     // Verification
     console.log('Verification, please wait...');
     await hardhat.run('verify:verify', { address: diamond.address, constructorArguments: [] });
     await hardhat.run('verify:verify', { address: auctionFacet.address, constructorArguments: [] });
     await hardhat.run('verify:verify', { address: calculatorFacet.address, constructorArguments: [] });
     await hardhat.run('verify:verify', { address: collectionFacet.address, constructorArguments: [] });
     await hardhat.run('verify:verify', { address: diamondCutFacet.address, constructorArguments: [] });
     await hardhat.run('verify:verify', { address: diamondLoupeFacet.address, constructorArguments: [] });
     await hardhat.run('verify:verify', { address: directOfferFacet.address, constructorArguments: [] });
     await hardhat.run('verify:verify', { address: ownershipFacet.address, constructorArguments: [] });
     await hardhat.run('verify:verify', { address: pausableFacet.address, constructorArguments: [] });
}

module.exports = deployDiamond;