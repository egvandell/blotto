const {deployments} = require('hardhat');

describe('Blotto', () => {
  it('testing 1 2 3', async function () {
    await deployments.fixture(['Blotto']);
    const {tokenOwner} = await getNamedAccounts();
    const BlottoContract = await ethers.getContract('Blotto', tokenOwner);

    //    const Blotto = await deployments.get('Blotto');
    console.log(`BlottoContract.address for example.js found at${BlottoContract.address}`);
//    const ERC721BidSale = await deployments.get('ERC721BidSale');
//    console.log({ERC721BidSale});
  });
});