const { getNamedAccounts } = require("hardhat")

const ENTRY_MINIMUM_TOKENS = 1000

module.exports = async ({ getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
//    const { deployer } await getNamedAccounts(),

    const args = [
// args go here
        ENTRY_MINIMUM_TOKENS,
    ]

    const raffle = await deploy("Blotto", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmation: 6,
    })
}