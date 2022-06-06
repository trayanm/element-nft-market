require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      gas: 9000000,
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

  // Configure your compilers
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      version: "^0.8.0" 
    }
  }
};