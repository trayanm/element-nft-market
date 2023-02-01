# Moon Life

NFT Market place. The app supports the following functionalities:
- Create new collections as ERC721 contracts
- Mint new tokes to these collections (with restriction - only the collection creator can mint)
- Create/Cancel auction (if token owner)
- Bid/BuyNow of token 
- Create/Cancel Direct offer (if not token owner)

## Terminology
- _Collection_ - ERC721 contract
- _Token_ - NFT item from _Collection_
- _Auction_ - English auction for specific _Token_
- _Initial Price_ - starting price of the _Auction_
- _Buy Now Price_ - price for direct purchase without waiting for _Auction_ to finish
- _Direct Offer_ - intend for purchase of other's token

## Setup and test

### Install Dependencies
```bash
npm install
```

### Build contracts
```bash
npx hardhat compile
```

### Run tests
```bash
npx hardhat test
```

## Publish to Rinkeby using Infura
- Create .env file with the following content
```
MNEMONIC=<YOUR MNEMONIC HERE>
```

- Set the HDWalletProvider in truffle-config.js for network rinkeby_infura
- Run command 
```bash
npx hardhat deploy-diamond \
    --network <network> \
    --owner <address owner> \
    --fee-percentage <fee percentage, default 3000> \
    --precision <fee precision, default 100000>
```

## Run the application
- Run command 
```bash
npm start
```