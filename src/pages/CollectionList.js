import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Marketplace from "../abis/Marketplace.json";
import getWeb3 from "../getWeb3";

class CollectionList extends Component {
    state = {
        collections: []
    };

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            this.web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            this.accounts = await this.web3.eth.getAccounts();

            // Get the contract instance.
            this.networkId = await this.web3.eth.net.getId();

            this.MarketplaceInstance = new this.web3.eth.Contract(
                Marketplace.abi,
                Marketplace.networks[this.networkId] && Marketplace.networks[this.networkId].address
            );

            await this.loadCollections();
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    loadCollections = async () => {
        const collectionCount = await this.MarketplaceInstance.methods.collectionCount().call();

        const collections = [];

        for (let index = 0; index < collectionCount; index++) {
            const collection = await this.MarketplaceInstance.methods.getCollection(index).call();

            collections.push(collection);
        }

        this.state.collections = collections;
        this.setState(this.state);
    };

    render() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col">
                        {this.state.collections.map((ele, inx) => (
                            <div key={inx} className="item-book">
                                <h3>{ele.name}</h3>
                                <Link to={'/collections/' + ele.collectionAddress} >{ele.collectionAddress}</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </React.Fragment >
        );
    }
}

export default CollectionList;