const { deployments } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe('Blotto Contract', () => {
    async function deployBlottoFixture() {
        await deployments.fixture(['Blotto']);
        const {tokenOwner} = await getNamedAccounts();
        const BlottoContract = await ethers.getContract('Blotto', tokenOwner);
        const BlottoTokenContract = await ethers.getContract('BlottoToken', tokenOwner);
//        console.log(`BlottoContract.address for Blotto.js found at${BlottoContract.address}`);
        const [owner, addr1, addr2] = await ethers.getSigners();

        return { BlottoContract, BlottoTokenContract, owner, addr1, addr2 };
    }
    describe("Deployment", function () {
        it("1- Received token address is not 0", async function () {
            const { BlottoContract } = await loadFixture(deployBlottoFixture);
            expect(await BlottoContract.getBlotTokenAddress()).to.not.equal(0);
        });

        it("2- Received token address is not 0", async function () {
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
            console.log("BlottoContract.s_lotteryStateOpen()="+BlottoContract.s_lotteryStateOpen());
            await expect(BlottoContract.s_lotteryStateOpen()).to.equal(true);
//                to.be.revertedWith("Lottery is not open");
        });
    });
});