// const SimpleContract = artifacts.require("SimpleContract");
const Marketplace = artifacts.require("Marketplace");
// const AuctionHub = artifacts.require("AuctionHub");

module.exports = async function (deployer) {
  
  await deployer.deploy(Marketplace);
  // await deployer.deploy(AuctionHub);
  // const addressAuctionHub = await AuctionHub.deployed();
  // await deployer.deploy(Marketplace, addressAuctionHub.address);
};