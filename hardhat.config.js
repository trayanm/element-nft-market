const { task } = require('hardhat/config');

require("@nomiclabs/hardhat-etherscan");
require('@nomiclabs/hardhat-waffle');
require('solidity-coverage');
require('hardhat-gas-reporter');
require('hardhat-abi-exporter');
require('hardhat-contract-sizer');
require("dotenv").config();

task('deploy-diamond', 'Deploys Router contract will all the necessary facets')
    .addParam('owner', 'The owner of the to-be deployed router')
    .addParam('feePercentage', 'Fee percentage with respect to precision', 3_000, types.int)
    .addParam('precision', 'Precision for fee calculations', 100_000, types.int)
    .setAction(async (taskArgs) => {
        const deployDiamond = require('./scripts/deploy');
        await deployDiamond(
            taskArgs.owner,
            taskArgs.feePercentage,
            taskArgs.precision);
    });


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: '0.8.17',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
                details: {
                    yul: false
                }
            },
        },
    },
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            hardfork: 'berlin'
        },
        local: {
            url: 'http://127.0.0.1:7545',
        },
        ropsten: {
            url: process.env.ROPSTEN_RPC_HTTP,
            accounts: [process.env.ROPSTEN_PRIVATE_KEY]
        },
        mumbai: {
            url: process.env.MUMBAI_RPC_HTTP,
            accounts: [process.env.MUMBAI_PRIVATE_KEY]
        },
        goerli: {
            url: process.env.GOERLI_RPC_HTTP,
            accounts: [process.env.GOERLI_PRIVATE_KEY]
        },
    },
    etherscan: {
        apiKey: ''
    },
    mocha: {
        timeout: 20000,
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
        // only: [':ERC20$'],
    },
    abiExporter: {
        path: './client/src/abis',
        runOnCompile: true,
        clear: true,
        flat: true,
        //only: [':ERC20$'],
        spacing: 2,
        pretty: false,
        format: "json",
    }
};
