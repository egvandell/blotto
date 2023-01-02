const { deployments } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { assert } = require("chai");

//const { BigNumber } = require("ethers");

describe('Blotto Contract', () => {
    async function deployBlottoFixture() {
        await deployments.fixture(['Blotto']);
//        const {tokenOwner} = await getNamedAccounts();
        accounts = await ethers.getSigners();
        tokenOwner = accounts[0];   // also specified in hardhat.config.js
        const BlottoContract = await ethers.getContract('Blotto', tokenOwner);
        const BlottoTokenContract = await ethers.getContract('BlottoToken', tokenOwner);
        const vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', tokenOwner);

        console.log(`vrfCoordinatorV2Mock.address for Blotto.js found at ${vrfCoordinatorV2Mock.address}`);
        const [owner, addr1, addr2] = await ethers.getSigners();

        return { BlottoContract, BlottoTokenContract, owner, addr1, addr2 };
    }
    describe("Deployment", function () {
        it("Received token address is not 0", async function () {
            const { BlottoContract } = await loadFixture(deployBlottoFixture);
            expect(await BlottoContract.getBlotTokenAddress()).to.not.equal(0);
        });
    });

    describe("getTicket", function () {
        it("Revert if tokenAmount is 0", async function () {
            const { BlottoContract, BlottoTokenContract } = await loadFixture(deployBlottoFixture);
            await BlottoTokenContract.approve(BlottoContract.address, 1);
            await expect(BlottoContract.getTicket(0)).to.be.revertedWith("Not Enough Tokens Sent");
        });
        it("Revert if allowance is insufficient", async function () {
            const { BlottoContract } = await loadFixture(deployBlottoFixture);
            await expect(BlottoContract.getTicket(1)).to.be.revertedWith("Allowance Insufficient");
        });
        it("Revert if token balance is insufficient", async function () {
            const { BlottoContract, BlottoTokenContract } = await loadFixture(deployBlottoFixture);
            await BlottoTokenContract.approve(BlottoContract.address, "99999999999999999999999999998");
            await expect(BlottoContract.getTicket("99999999999999999999999999999")).to.be.revertedWith("Allowance Insufficient");
        });
        it("Revert if lottery is not open", async function () {
            const { BlottoContract } = await loadFixture(deployBlottoFixture);
//            const lotteryStateOpen = await BlottoContract.s_lotteryStateOpen();
//            console.log("BlottoContract.s_lotteryStateOpen()="+lotteryStateOpen);
            expect (await BlottoContract.s_lotteryStateOpen()).to.equal(true).to.be.revertedWith("Lottery is not open");
        });
        it("Emits event when successfully got a ticket", async function () {
            const { BlottoContract, BlottoTokenContract, owner } = await loadFixture(deployBlottoFixture);
            await BlottoTokenContract.approve(BlottoContract.address, 1);
            const getTokenBalanceSender = await BlottoContract.getTokenBalanceSender();
            await expect(BlottoContract.getTicket(1)).to.emit(BlottoContract, "GotTicket")
        });
    });

    describe("checkUpkeep", function () {
        it("fails if not enough time has passed", async function () {
            const { BlottoContract, BlottoTokenContract } = await loadFixture(deployBlottoFixture);
            interval = await BlottoContract.getInterval()

            await BlottoTokenContract.approve(BlottoContract.address, "1");
            await BlottoContract.getTicket("1");
            await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
            await network.provider.request({ method: "evm_mine", params: [] })

            const { upkeepNeeded } = await BlottoContract.callStatic.checkUpkeep("0x");
            expect(upkeepNeeded).to.to.equal(false);
        });
        it("succeeds if enough time has passed, the lottery is open and there are players (tokens)", async function () {
            const { BlottoContract, BlottoTokenContract } = await loadFixture(deployBlottoFixture);
            interval = await BlottoContract.getInterval();

            await BlottoTokenContract.approve(BlottoContract.address, "1");
            await BlottoContract.getTicket("1");

            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({ method: "evm_mine", params: [] });

            const { upkeepNeeded } = await BlottoContract.callStatic.checkUpkeep("0x");
            expect(upkeepNeeded).to.to.equal(true);
        });
    });

    describe("performUpkeep", function () {
        it("only runs when checkUpkeep returns true", async function () {
            const { BlottoContract, BlottoTokenContract } = await loadFixture(deployBlottoFixture);
            interval = await BlottoContract.getInterval();

            await BlottoTokenContract.approve(BlottoContract.address, "1");
            await BlottoContract.getTicket("1");

            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({ method: "evm_mine", params: [] });

            const { tx } = await BlottoContract.performUpkeep("0x");
            assert (tx);
        });
    });

    describe("fulfillRandomWords", function () {
        it("Placeholder", async function () {
            const { BlottoContract } = await loadFixture(deployBlottoFixture);
            expect(await BlottoContract.getBlotTokenAddress()).to.not.equal(0);
        });
    });
});
