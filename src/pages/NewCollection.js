import React, { Component } from "react";
import Marketplace from "../abis/Marketplace.json";
import getWeb3 from "../getWeb3";

class NewCollection extends Component {
    state = {
        name: '',
        symbol: ''
    };

    constructor(props) {
        super(props);

        //this.state.collectionAddress = props.params.collectionAddress;
    }

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            this.web3 = await getWeb3();

            // Get the contract instance.
            this.networkId = await this.web3.eth.net.getId();

            // Use web3 to get the user's accounts.
            this.accounts = await this.web3.eth.getAccounts();

            // Get the contract instance.
            this.networkId = await this.web3.eth.net.getId();

            this.MarketplaceInstance = new this.web3.eth.Contract(
                Marketplace.abi,
                Marketplace.networks[this.networkId] && Marketplace.networks[this.networkId].address
            );

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    // -- Handlers
    handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const collectionAddress = await this.MarketplaceInstance.methods.createCollection(this.state.name, this.state.symbol).send({ from: this.accounts[0] });
        } catch (error) {
            console.log(error);
        }
    };

    onChangeName = (event) => {
        this.state.name = event.currentTarget.value;
        this.setState(this.state);
    };

    onChangeSymbol = (event) => {
        this.state.symbol = event.currentTarget.value;
        this.setState(this.state);
    };
    // --

    render() {
        return (
            <React.Fragment>
                <div>
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <input type="text" value={this.state.name} onChange={(e) => this.onChangeName(e)} />
                        <input type="text" value={this.state.symbol} onChange={(e) => this.onChangeSymbol(e)} />
                        <button type="submit">Save</button>
                    </form>
                </div>
            </React.Fragment>
        );
    }
}
export default NewCollection;
