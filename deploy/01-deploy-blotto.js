const ENTRY_MINIMUM_TOKENS = 1000

module.exports = async ({ getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [
        process.env.TOKEN_ADDRESS, 
        ENTRY_MINIMUM_TOKENS, 
        "300",
        "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D", 
        "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", 
        "6275", 
        "500000",
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