import React, { Component } from "react";
import Marketplace from "../abis/Marketplace.json";
import NFTCollection from "../abis/NFTCollection.json";
//import getWeb3 from "../getWeb3";
import ipfsClient from 'ipfs-http-client';
import web3 from '../connection/web3';
import { withRouter } from "../hooksHandler";

const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

class NewCollectionToken extends Component {

    state = {
        collectionAddress: null,
        name: '',
        description: '',
        capturedFileBuffer: null
    };

    constructor(props) {
        super(props);
        this.state.collectionAddress = props.params.collectionAddress;
    }

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            //this.web3 = await getWeb3();

            // Get the contract instance.
            this.networkId = await web3.eth.net.getId();

            // Use web3 to get the user's accounts.
            this.accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            this.networkId = await web3.eth.net.getId();

            this.MarketplaceInstance = new web3.eth.Contract(
                Marketplace.abi,
                Marketplace.networks[this.networkId] && Marketplace.networks[this.networkId].address
            );

            this.NFTCollectionInstance = new web3.eth.Contract(
                NFTCollection.abi,
                this.state.collectionAddress
            );

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    // #region Handlers
    handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const fileAdded = await ipfs.add(this.state.capturedFileBuffer);

            if (!fileAdded) {
                console.error('Something went wrong when updloading the file');
                return;
            }

            const metadata = {
                title: "Asset Metadata",
                type: "object",
                haho: "peeeeeeee",
                properties: {
                    name: {
                        type: "string",
                        description: this.state.name
                    },
                    description: {
                        type: "string",
                        description: this.state.description
                    },
                    image: {
                        type: "string",
                        description: fileAdded.path
                    },
                    sumo: {
                        type: "string",
                        description: "I am sumo"
                    }
                }
            };

            const metadataAdded = await ipfs.add(JSON.stringify(metadata));
            if (!metadataAdded) {
                console.error('Something went wrong when updloading the file');
                return;
            }

            this.NFTCollectionInstance.methods.safeMint(metadataAdded.path).send({ from: this.accounts[0] })
                .on('transactionHash', (hash) => {
                    //   collectionCtx.setNftIsLoading(true);
                })
                .on('error', (e) => {
                    window.alert('Something went wrong when pushing to the blockchain');
                    //   collectionCtx.setNftIsLoading(false);  
                })

        } catch (error) {
            console.log(error);
        }
    };

    onChangeName = (event) => {
        this.state.name = event.currentTarget.value;
        this.setState(this.state);
    };

    onChangeDescription = (event) => {
        this.state.description = event.currentTarget.value;
        this.setState(this.state);
    };

    onChangeFile = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];

        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
            this.state.capturedFileBuffer = Buffer(reader.result);
            this.setState(this.state);
        };
    };
    // #endregion

    render() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col">
                        <form onSubmit={(e) => this.handleSubmit(e)}>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Name..."
                                    value={this.state.name}
                                    onChange={(e) => this.onChangeName(e)}
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Description..."
                                    value={this.state.description}
                                    onChange={(e) => this.onChangeDescription(e)}
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => this.onChangeFile(e)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Mint</button>
                        </form>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(NewCollectionToken);
