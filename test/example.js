const {deployments} = require('hardhat');

describe('Blotto', () => {
  it('testing 1 2 3', async function () {
    await deployments.fixture(['Blotto']);
    const Blotto = await deployments.get('Blotto');
    console.log(`Blotto.address for example.js found at${Blotto.address}`);
//    const ERC721BidSale = await deployments.get('ERC721BidSale');
//    console.log({ERC721BidSale});
  });
});