import React from "react";
import AppContext from "./app-context";

class AppProvider extends React.Component {
    state = {
        // connected account address
        networkId: null,
        account: null,
        accountBalance: null,
        userFunds: null,
        etherscanUrl: null,

        // test
        conValue: null,
    };

    setAccount = async (account) => {
        this.state.account = account;
        this.setState(this.state);
    };

    setAccountBalance = async (accountBalance) => {
        this.state.accountBalance = accountBalance;
        this.setState(this.state);
    };

    setNetworkId = async (networkId) => {
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

    setConValue = async (conValue) => {
        this.state.conValue = conValue;
        this.setState((prevState) => this.state);
    };

    componentDidMount = async () => {
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

                    accountBalance : this.state.accountBalance,
                    setAccountBalance : this.setAccountBalance,

                    etherscanUrl:this.state.etherscanUrl,

                    conValue: this.state.conValue,
                    setConValue: this.setConValue,
                }}>
                {children}
            </AppContext.Provider>
        )
    };
}

export default AppProvider;