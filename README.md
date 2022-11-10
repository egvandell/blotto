Blockchain Lottery!

** HIGH LEVEL **
- Create a lottery that exists solely on the blockchain
- Designed as a DAO with Snapshot for Voting & Gnosis Safe for Treasury
- Chainlink VRF - for generating the random numbers
- Chainlink Automation - for the drawing to be on schedule
- Lottery proceeds allocated as follows: 
    a. 1st Winner - 80%
    b. Charity - 19%
    c. Returned to DAO Treasury for Operations - 1%

*********************************
Uses:
https://github.com/wighawag/hardhat-deploy

must use yarn - dependencies failed on mac & pc using npm for hardhat-deploy

yarn add --dev hardhat-deploy
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
yarn add --dev prettier-plugin-solidity prettier
yarn add --dev dotenv
yarn add --dev @nomiclabs/hardhat-waffle
