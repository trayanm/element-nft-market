// const SimpleContract = artifacts.require("SimpleContract");
const Marketplace = artifacts.require("Marketplace");

module.exports = async function (deployer) {
  // await deployer.deploy(SimpleContract, 'I am some string');

  await deployer.deploy(Marketplace);
};