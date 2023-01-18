const { networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId == 31337) {
        const args = [
            networkConfig[chainId]["BASE_FEE"],
            networkConfig[chainId]["GAS_PRICE_LINK"], 
        ]

        const VRFCoordinatorV2Mock = await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmation: 6,
        })

        console.log(
            `Deployed VRFCoordinatorV2Mock.sol to ${VRFCoordinatorV2Mock.address}`
        );
    }
}