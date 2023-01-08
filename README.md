## Blockchain Lottery! ##

** HIGH LEVEL **
- Create a lottery that exists solely on the blockchain
- Designed as a DAO with Snapshot for Voting & Gnosis Safe for Treasury
- Chainlink VRF - for generating the random numbers
- Chainlink Automation - for the drawing to be on schedule
- Lottery proceeds allocated as follows: 
    a. Winner - 50%
    b. Charity - 45%
    c. Returned to DAO Treasury for Operations - 5%

*********************************
Uses:
https://github.com/wighawag/hardhat-deploy

suggest using yarn - dependencies failed on mac & pc using npm for hardhat-deploy

yarn add --dev hardhat-deploy @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers prettier-plugin-solidity prettier dotenv @nomiclabs/hardhat-waffle @nomicfoundation/hardhat-network-helpers @nomicfoundation/hardhat-chai-matchers

Thanks to PatrickAlphaC for his Raffle videos & code for reference!
***********
frontend - moved to separate repo
https://github.com/egvandell/blotto-fe

Need to modify code to allow for no winner situation and proceeds going to subsequent drawing