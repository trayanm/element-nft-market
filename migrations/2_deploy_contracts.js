// const SimpleContract = artifacts.require("SimpleContract");
const NFTMarketplace = artifacts.require("NFTMarketplace");

module.exports = async function (deployer) {
  // await deployer.deploy(SimpleContract, 'I am some string');

  await deployer.deploy(NFTMarketplace);
};