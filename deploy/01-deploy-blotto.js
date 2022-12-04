const { networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    
    const args = [
        process.env.TOKEN_ADDRESS, 
        networkConfig[chainId]["ENTRY_MINIMUM_TOKENS"],
        networkConfig[chainId]["automationUpdateInterval"],
        networkConfig[chainId]["vrfCoordinatorV2"], 
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["subscriptionId"],
        networkConfig[chainId]["callbackGasLimit"], 
    ]

    const blotto = await deploy("Blotto", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmation: 6,
    })

    console.log(
        `Deployed Blotto.sol to ${blotto.address} with ${process.env.TOKEN_ADDRESS} as BlottoToken address`
      );
}