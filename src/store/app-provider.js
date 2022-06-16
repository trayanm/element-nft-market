import React from "react";
import AppContext from "./app-context";

class AppProvider extends React.Component {
    state = {
        account: null,
        setAccount: null,

        userFunds: null,

        networkId: null,
        setNetworkId: null,

        etherscanUrl: null,

        marketplaceInstance: null,
        setMarketplaceInstance: null,

        mktIsLoading: true,

        // test
        conValue: null,
    };

    setMktIsLoading = (mktIsLoading) => {
        this.state.mktIsLoading = mktIsLoading;
        this.setState(this.state);
    };

    setAccount = (account) => {
        this.state.account = account;
        this.setState(this.state);
    };

    setAccountBalance = (accountBalance) => {
        this.state.accountBalance = accountBalance;
        this.setState(this.state);
    };

    setMarketplaceInstance = (marketplaceInstance) => {
        this.state.marketplaceInstance = marketplaceInstance;
        this.setState(this.state);
    };

    setNetworkId = (networkId) => {
        console.log('setNetworkId', networkId);

        switch (networkId) {
            case 3: this.state.etherscanUrl = 'https://ropsten.etherscan.io';
                break;
            case 4: this.state.etherscanUrl = 'https://rinkeby.etherscan.io';
                break;
            case 5: this.state.etherscanUrl = 'https://goerli.etherscan.io';
                break;
            default:
                this.state.etherscanUrl = 'https://etherscan.io';
                break;
        }

        this.state.networkId = networkId;
        this.setState(this.state);

        console.log(this.state);
    };

    setConValue = (conValue) => {
        this.state.conValue = conValue;
        this.setState((prevState) => this.state);
    };

    componentDidMount = () => {
        console.log('componentDidMount: AppProvider');

        this.state.conValue = 'set from provider';
        this.setState(this.state);
    };

    render() {
        const { children } = this.props;
        const { conValue } = this.state;

        return (
            <AppContext.Provider
                value={{
                    account: this.state.account,
                    setAccount: this.setAccount,

                    userFunds: this.state.userFunds,

                    networkId: this.state.networkId,
                    setNetworkId: this.setNetworkId,

                    accountBalance: this.state.accountBalance,
                    setAccountBalance: this.setAccountBalance,

                    etherscanUrl: this.state.etherscanUrl,

                    marketplaceInstance: this.state.marketplaceInstance,
                    setMarketplaceInstance: this.setMarketplaceInstance,

                    mktIsLoading: this.state.mktIsLoading,
                    setMktIsLoading: this.setMktIsLoading,

                    conValue: this.state.conValue,
                    setConValue: this.setConValue,
                }}>
                {children}
            </AppContext.Provider>
        )
    };
}

export default AppProvider;