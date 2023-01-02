const hre = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
//  const chainId = network.config.chainId

//  if (chainId == 31337) {
    const blottoToken = await deploy("BlottoToken", {
          from: deployer,
          log: true,
      });
//      await blottoToken.deployed();
//    if (blottoToken.deployed) {
      process.env.TOKEN_ADDRESS = blottoToken.address;
      console.log(
        `Deployed BlottoToken.sol to ${blottoToken.address}`
      );
//    }
//  }
}
