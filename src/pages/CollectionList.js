import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Marketplace from "../abis/Marketplace.json";
//import getWeb3 from "../getWeb3";
import { withRouter } from "../hooksHandler";
import web3 from '../connection/web3';
import AppContext from "../store/app-context";
import { formatAddress } from "../helpers/utils";

class CollectionList extends Component {
    static contextType = AppContext;

    state = {
        collections: []
    };

    async componentDidMount() {
        try {
            console.log('componentDidMount: CollectionList');
            // Get network provider and web3 instance.
            //this.web3 = web3;

            // Use web3 to get the user's accounts.
            this.accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            this.networkId = await web3.eth.net.getId();

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
                    <div className="col-12">
                        <div className="section-title">
                            <h2 className="wow fadeInUp" data-wow-delay=".4s">Collections</h2>
                            <p className="wow fadeInUp" data-wow-delay=".6s">Browse user collections.</p>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="category-grid-list">
                            <div className="row">
                                <div className="col-12">
                                    <div className="tab-content" id="nav-tabContent">
                                        <div className="tab-pane fade active show" id="nav-grid" role="tabpanel" aria-labelledby="nav-grid-tab">
                                            <div className="row">

                                                {this.state.collections.map((ele, inx) => (
                                                    <div key={inx} className="col-lg-4 col-md-6 col-12">
                                                        <div className="single-item-grid" >
                                                            <div className="content">
                                                                <h3 className="title">
                                                                    <Link to={'/collections/' + ele.collectionAddress}>{formatAddress(ele.collectionAddress)}</Link>
                                                                </h3>                                                          
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment >
        );
    }
}

export default withRouter(CollectionList);