import React, { Component } from "react";
import { Link } from 'react-router-dom'
import ipfsClient from 'ipfs-http-client';
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";
import { formatAddress } from "../helpers/utils";

const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

class NewCollectionToken extends Component {
    static contextType = AppContext;

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

            await this.context.checkStateAsync();

            this.NFTCollectionInstance = this.context.getNftCollectionInstance(this.state.collectionAddress);
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

            // this.NFTCollectionInstance.methods.safeMint(metadataAdded.path).send({ from: this.context.account })
            //     .on('transactionHash', (hash) => {
            //         //   collectionCtx.setNftIsLoading(true);
            //         this.context.refreshBlance();
            //     })
            //     .on('error', (e) => {
            //         window.alert('Something went wrong when pushing to the blockchain');
            //         //   collectionCtx.setNftIsLoading(false);  
            //     });

            await this.NFTCollectionInstance.methods.safeMint(metadataAdded.path).send({ from: this.context.account });
            await this.context.refreshBlance();

        } catch (error) {
            console.log(error);
        }
    };

    onChangeName = (event) => {
        const _state = this.state;

        _state.name = event.currentTarget.value;
        this.setState(_state);
    };

    onChangeDescription = (event) => {
        const _state = this.state;

        _state.description = event.currentTarget.value;
        this.setState(_state);
    };

    onChangeFile = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];

        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
            const _state = this.state;

            _state.capturedFileBuffer = Buffer(reader.result);
            this.setState(_state);
        };
    };
    // #endregion

    render() {
        return (
            <React.Fragment>
                <div className="breadcrumbs">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="breadcrumbs-content">
                                    <h1 className="page-title">New token</h1>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-12">
                                <ul className="breadcrumb-nav">
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/collections">Collections</Link></li>
                                    <li><Link to={'/collections/' + this.state.collectionAddress}>{formatAddress(this.state.collectionAddress)}</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="contact-us section">
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                <div className="form-main">
                                    <div className="form-title">
                                        <h2>New token</h2>
                                        <p>Create new token</p>
                                    </div>
                                    <form onSubmit={(e) => this.handleSubmit(e)}>
                                        <div className="row mb-3">
                                            <label className="col-sm-4 col-form-label">Title</label>
                                            <div className="col-sm-8">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Name..."
                                                    value={this.state.name}
                                                    maxLength="50"
                                                    onChange={(e) => this.onChangeName(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label className="col-sm-4 col-form-label">Description</label>
                                            <div className="col-sm-8">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Description..."
                                                    value={this.state.description}
                                                    maxLength="150"
                                                    onChange={(e) => this.onChangeDescription(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label className="col-sm-4 col-form-label">File</label>
                                            <div className="col-sm-8">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => this.onChangeFile(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group button">
                                                <button type="submit" className="btn">Mint</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

export default withRouter(NewCollectionToken);
