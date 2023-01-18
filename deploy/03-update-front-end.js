const { network } = require("hardhat")
const { frontEndContractsFile, frontEndAbiFile, frontEndAbiTokenFile } = require("../helper-hardhat-config")
const fs = require("fs")

module.exports = async () => {
    const chainId = network.config.chainId

    if (chainId == 31337) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const blotto = await ethers.getContract("Blotto")
    const blottoToken = await ethers.getContract("BlottoToken")
    fs.writeFileSync(frontEndAbiFile, blotto.interface.format(ethers.utils.FormatTypes.json))
    fs.writeFileSync(frontEndAbiTokenFile, blottoToken.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const blotto = await ethers.getContract("Blotto")
    const blottoToken = await ethers.getContract("BlottoToken")

    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
/*
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(blotto.address)) {
            contractAddresses[network.config.chainId.toString()].push(blotto.address)
        }
        if (!contractAddresses[network.config.chainId.toString()].includes(blottoToken.address)) {
            contractAddresses[network.config.chainId.toString()].push(blottoToken.address)
        }
    } else {
        */
        contractAddresses[network.config.chainId.toString()] = [blotto.address]
        contractAddresses[network.config.chainId.toString()].push(blottoToken.address)
//    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]