// const SimpleContract = artifacts.require("SimpleContract");
const MarketPlace = artifacts.require("MarketPlace");
// const AuctionHub = artifacts.require("AuctionHub");

module.exports = async function (deployer) {
  
  await deployer.deploy(MarketPlace);
  // await deployer.deploy(AuctionHub);
  // const addressAuctionHub = await AuctionHub.deployed();
  // await deployer.deploy(MarketPlace, addressAuctionHub.address);
};