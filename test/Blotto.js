const { deployments } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");

describe('Blotto Contract', () => {
    async function deployBlottoFixture() {
        await deployments.fixture(['Blotto']);
//        const {tokenOwner} = await getNamedAccounts();
        accounts = await ethers.getSigners();
        tokenOwner = accounts[0];   // also specified in hardhat.config.js
        const BlottoContract = await ethers.getContract('Blotto', tokenOwner);
//        const BlottoContract2 = await ethers.getContract('Blotto', accounts[1]);
        const BlottoTokenContract = await ethers.getContract('BlottoToken', tokenOwner);
//        const BlottoTokenContract2 = await ethers.getContract('BlottoToken', accounts[1]);
        const vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', tokenOwner);

        console.log(`vrfCoordinatorV2Mock.address for Blotto.js found at ${vrfCoordinatorV2Mock.address}`);
        const [owner, addr1, addr2] = await ethers.getSigners();

        return { BlottoContract, BlottoTokenContract, vrfCoordinatorV2Mock, owner, addr1, addr2 };
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
            const { BlottoContract, BlottoTokenContract } = await loadFixture(deployBlottoFixture)
            interval = await BlottoContract.getInterval()

            await BlottoTokenContract.approve(BlottoContract.address, "1")
            await BlottoContract.getTicket("1")
            await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
            await network.provider.request({ method: "evm_mine", params: [] })

            const { upkeepNeeded } = await BlottoContract.callStatic.checkUpkeep("0x")
            expect(upkeepNeeded).to.to.equal(false)
        })
        it("succeeds if enough time has passed, the lottery is open and there are players (tokens)", async function () {
            const { BlottoContract, BlottoTokenContract } = await loadFixture(deployBlottoFixture)
            interval = await BlottoContract.getInterval()

            await BlottoTokenContract.approve(BlottoContract.address, "1")
            await BlottoContract.getTicket("1")

            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })

            const { upkeepNeeded } = await BlottoContract.checkUpkeep("0x")
            expect(upkeepNeeded).to.to.equal(true)
        })
    })

    describe("performUpkeep", function () {
        it("only runs when checkUpkeep returns true", async function () {
            const { BlottoContract, BlottoTokenContract } = await loadFixture(deployBlottoFixture)
            interval = await BlottoContract.getInterval()

            await BlottoTokenContract.approve(BlottoContract.address, "1")
            await BlottoContract.getTicket("1")

            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })

            const tx = await BlottoContract.performUpkeep("0x")
            assert(tx)
        })
    })

    describe("fulfillRandomWords", function () {
        it("only called after performUpkeep", async function () {
            const { BlottoContract, BlottoTokenContract, vrfCoordinatorV2Mock } = await loadFixture(deployBlottoFixture)
            interval = await BlottoContract.getInterval()

            await BlottoTokenContract.approve(BlottoContract.address, "1")
            await BlottoContract.getTicket("1")

            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })

            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, BlottoContract.address))
                .to.be.revertedWith("nonexistent request")
        });

        it("Correctly picks winner, transferred tokens to winner/charity/dao, resets", async function () {
            const { BlottoContract, BlottoTokenContract, vrfCoordinatorV2Mock } = await loadFixture(deployBlottoFixture)
            interval = await BlottoContract.getInterval()

            await BlottoTokenContract.approve(BlottoContract.address, "100")
            await BlottoContract.getTicket("100")


            /*
            // need to allocate tokens to the 2nd address
            await BlottoTokenContract.approve(accounts[1].address, "40")
            BlottoTokenContract2.transferFrom(accounts[0].address, accounts[1].address, "40");

            await BlottoTokenContract2.approve(BlottoContract.address, "40")
            await BlottoContract2.getTicket("40")
            */

            const winnerStartingBalance = await BlottoTokenContract.balanceOf(accounts[0].address)

            const charityAddress = await BlottoContract.getCharityAddress()
            const charityStartingBalance = await BlottoTokenContract.balanceOf(charityAddress)

            const daoAddress = await BlottoContract.getDaoAddress()
            const daoStartingBalance = await BlottoTokenContract.balanceOf(daoAddress)
            
            // WinnerPicked not kicking off w/o Promise
            await new Promise(async (resolve, reject) => {
                const tx = await BlottoContract.performUpkeep("0x")
                const txReceipt = await tx.wait(1)
                await vrfCoordinatorV2Mock.fulfillRandomWords(
                    txReceipt.events[1].args.requestId,
                    BlottoContract.address
                )
                
                BlottoContract.once("WinnerPicked", async () => { // event listener for WinnerPicked
//                    console.log("WinnerPicked event fired!")
                    // assert throws an error if it fails, so we need to wrap
                    // it in a try/catch so that the promise returns event
                    // if it fails.
                    try {
                        // Get values after 1 round of winner being picked
//                        const lastWinner = await BlottoContract.getLastWinner()
                        const winnerEndingBalance = await BlottoTokenContract.balanceOf(accounts[0].address)
                        const charityEndingBalance = await BlottoTokenContract.balanceOf(charityAddress)
                        const daoEndingBalance = await BlottoTokenContract.balanceOf(daoAddress)

                        // Check if ending values are correct:
//                        assert.equal(lastWinner.toString(), accounts[0].address)
                        assert.equal(winnerEndingBalance.sub(winnerStartingBalance), 50)
                        assert.equal(charityEndingBalance.sub(charityStartingBalance), 45)
                        assert.equal(daoEndingBalance.sub(daoStartingBalance), 5)

                        // get new lottery_id
                        const newLotteryId = await BlottoContract.getLotteryId();
                        
                        assert.equal(newLotteryId, 1)

                        resolve() // if try passes, resolves the promise 
                    } catch (e) { 
                        reject(e) // if try fails, rejects the promise
                    }
                })
            });
        });
    });
});
