import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Marketplace from "../abis/Marketplace.json";
//import getWeb3 from "../getWeb3";
import { withRouter } from "../hooksHandler";
import web3 from '../connection/web3';

class CollectionList extends Component {
    state = {
        collections: []
    };

    async componentDidMount() {
        try {
            console.log('componentDidMount: 1');
            // Get network provider and web3 instance.
            //this.web3 = web3;

            console.log('componentDidMount: 2');

            // Use web3 to get the user's accounts.
            this.accounts = await web3.eth.getAccounts();

            console.log('componentDidMount: 3');

            // Get the contract instance.
            this.networkId = await web3.eth.net.getId();

            console.log('componentDidMount: 4');

            this.MarketplaceInstance = new web3.eth.Contract(
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

        console.log('this.state.collections', this.state.collections);
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

export default withRouter(CollectionList);