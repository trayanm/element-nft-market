truffle compile
truffle build
truffle migrate --network ganache --reset > .\logs\migrate.ganache.log

truffle compile | truffle build | truffle test
truffle compile | truffle build | truffle run contract-size

truffle test --stacktrace

npm start

using truffle
do not use hardhat