require('hardhat-deploy')
require("dotenv").config()
require("@nomiclabs/hardhat-waffle")
require("@nomicfoundation/hardhat-chai-matchers")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    localhost: {
        chainId: 31337,
    },
    goerli: {
        url: process.env.GOERLI_RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
        saveDeployments: true,
        chainId: 5,
    },
    mainnet: {
        url: process.env.MAINNET_RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
        saveDeployments: true,
        chainId: 1,
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
    }
  },
  solidity: "0.8.5",
};
