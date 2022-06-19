require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider-privkey');

module.exports = {
  networks: {
    develop: {
      port: 7545,
      host: "127.0.0.1",
      network_id: 5777
    },
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      gas     : 20000000,
      gasPrice: 25000000000,
      network_id: "*" //match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          [process.env.RINKEBY_PRIVATE_KEY], // array of private keys
          process.env.RINKEBY_RPC_URL // Url to an Ethereum node
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 4
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          [process.env.ROPSTEN_PRIVATE_KEY], // array of private keys
          process.env.ROPSTEN_RPC_URL // Url to an Ethereum node
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 3
    }
  },
  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis',

  plugins: ["truffle-contract-size"],
  
  // Configure your compilers
  compilers: {
    solc: {
      version: '^0.8.0',
      settings: {
        evmVersion: 'byzantium', // Default: "petersburg"
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};