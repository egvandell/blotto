const { ethers } = require("hardhat")

const networkConfig = {
    default: {
        name: "hardhat",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        ENTRY_MINIMUM_TOKENS: "1000",
        subscriptionId: "6275",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        automationUpdateInterval: "300",
        callbackGasLimit: "500000", // 500,000 gas
        BASE_FEE: "25000000000000000",
        GAS_PRICE_LINK: "1000000000",
        CHARITY_ADDRESS: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
        DAO_ADDRESS: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    },
    5: {
        name: "goerli",
        ENTRY_MINIMUM_TOKENS: "1000",
        subscriptionId: "6275",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        automationUpdateInterval: "300",
        callbackGasLimit: "500000", // 500,000 gas
        BASE_FEE: "25000000000000000",
        GAS_PRICE_LINK: "1000000000",
    },
    1: {
        name: "mainnet",
        keepersUpdateInterval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}

