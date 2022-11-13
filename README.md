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
***********
create dir frontend

yarn create next-app . --js --no-eslint
yarn add moralis react-moralis web3uikit
yarn add --dev tailwindcss postcss autoprefixer
yarn tailwindcss init -p

yarn add moralis-v1
yarn add @web3auth/web3auth magic-sdk@7.0.0



need to combine the above yarn commands at some point

go here and modify the 2 files: https://tailwindcss.com/docs/guides/nextjs
yarn run dev

yarn add --dev ethers
​yarn add --dev @nomiclabs/hardhat-ethers

yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
yarn add raw-loader -D

yarn add --dev @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers
