import React from "react";
import web3 from "../connection/web3";
import AppContext from "./app-context";
import MarketPlace from "../abis/MarketPlace.json";
import NFTCollection from "../abis/NFTCollection.json";

class AppProvider extends React.Component {
    state = {
        checkState: null,

        account: null,
        setAccount: null,

        userFunds: null,

        networkId: null,
        setNetworkId: null,

        etherscanUrl: null,

        MarketPlaceInstance: null,
        setMarketPlaceInstance: null,

        nftCollectionDictionary: {},

        mktIsLoading: true
    };

    getNftCollectionInstance = (collectionAddress) => {
        const _state = this.state;

        let result = null;
        if (_state.nftCollectionDictionary[collectionAddress]) {
            result = _state.nftCollectionDictionary[collectionAddress];
        }
        else {
            result = new web3.eth.Contract(
                NFTCollection.abi,
                collectionAddress
            );

            _state.nftCollectionDictionary[collectionAddress] = result;
            this.setState(_state);
        }

        return result;
    };

    setMktIsLoading = (mktIsLoading) => {
        const _state = this.state;
        _state.mktIsLoading = mktIsLoading;
        this.setState(_state);
    };

    setAccount = (account) => {
        const _state = this.state;
        _state.account = account;
        this.setState(_state);
    };

    setAccountBalance = (accountBalance) => {
        const _state = this.state;
        _state.accountBalance = accountBalance;
        this.setState(_state);
    };

    setMarketPlaceInstance = (MarketPlaceInstance) => {
        const _state = this.state;
        _state.MarketPlaceInstance = MarketPlaceInstance;
        this.setState(_state);
    };

    setNetworkId = (networkId) => {
        const _state = this.state;

        switch (networkId) {
            case 3: _state.etherscanUrl = 'https://ropsten.etherscan.io';
                break;
            case 4: _state.etherscanUrl = 'https://rinkeby.etherscan.io';
                break;
            case 5: _state.etherscanUrl = 'https://goerli.etherscan.io';
                break;
            default:
                _state.etherscanUrl = 'https://etherscan.io';
                break;
        }

        _state.networkId = networkId;
        this.setState(_state);
    };

    componentDidMount = () => {
    };

    checkStateAsync = async () => {
        if (this.state.mktIsLoading === true) {
            const _state = this.state;

            _state.networkId = await web3.eth.net.getId();
            _state.accounts = await web3.eth.getAccounts();
            _state.account = _state.accounts[0];
            _state.accoutnBalance = await web3.eth.getBalance(_state.account);

            _state.MarketPlaceInstance = new web3.eth.Contract(
                MarketPlace.abi,
                MarketPlace.networks[_state.networkId] && MarketPlace.networks[_state.networkId].address
            );

            _state.mktIsLoading = false;
            this.setState(_state);
        }
        else {
            console.log('state is ok');
        }
    };

    refreshBlance = async () => {
        const accoutnBalance = await web3.eth.getBalance(this.state.account);
        this.setAccountBalance(accoutnBalance);
    };

    render() {
        const { children } = this.props;

        return (
            <AppContext.Provider
                value={{
                    checkStateAsync: this.checkStateAsync,
                    refreshBlance: this.refreshBlance,

                    account: this.state.account,
                    setAccount: this.setAccount,

                    userFunds: this.state.userFunds,

                    networkId: this.state.networkId,
                    setNetworkId: this.setNetworkId,

                    accountBalance: this.state.accountBalance,
                    setAccountBalance: this.setAccountBalance,

                    etherscanUrl: this.state.etherscanUrl,

                    MarketPlaceInstance: this.state.MarketPlaceInstance,
                    setMarketPlaceInstance: this.setMarketPlaceInstance,

                    getNftCollectionInstance: this.getNftCollectionInstance,

                    mktIsLoading: this.state.mktIsLoading,
                    setMktIsLoading: this.setMktIsLoading
                }}>
                {children}
            </AppContext.Provider>
        )
    };
}

export default AppProvider;