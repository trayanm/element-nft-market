import React, { Component } from "react";
import { Link } from 'react-router-dom';
import ipfsClient from 'ipfs-http-client';
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";

const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

class NewCollection extends Component {
    static contextType = AppContext;

    state = {
        name: '',
        symbol: '',
        description: '',
        capturedFileBuffer: null,
        submitted: false
    };

    componentDidMount = async () => {
        try {
            await this.context.checkStateAsync();

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
                    symbol: {
                        type: "string",
                        description: this.state.symbol
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
            const collectionAddress = await this.context.marketPlaceInstance.methods.createCollection(this.state.name, this.state.symbol, metadataAdded.path).send({ from: this.context.account });
            await this.context.refreshBalance();

            const _state = this.state;
            _state.submitted = true;
            this.setState(_state);

        } catch (error) {
            console.log(error);
        }
    };

    onChangeName = (event) => {
        const _state = this.state;
        _state.name = event.currentTarget.value;
        this.setState(_state);
    };

    onChangeSymbol = (event) => {
        const _state = this.state;
        _state.symbol = event.currentTarget.value;
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
    // --

    render() {
        return (
            <React.Fragment>
                <div className="breadcrumbs">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="breadcrumbs-content">
                                    <h1 className="page-title">New collection</h1>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-12">
                                <ul className="breadcrumb-nav">
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/collections">Collections</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="contact-us section">
                    <div className="container">
                        <div className="row">
                            <div className="col">

                                {!this.state.submitted &&
                                    <div className="form-main">
                                        <div className="form-title">
                                            <h2>New collection</h2>
                                            <p>Create new collection</p>
                                        </div>
                                        <form onSubmit={(e) => this.handleSubmit(e)}>
                                            <div className="row mb-3">
                                                <label className="col-sm-3 col-form-label">Title</label>
                                                <div className="col-sm-9">
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
                                                <label className="col-sm-3 col-form-label">Symbol</label>
                                                <div className="col-sm-9">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Symbol..."
                                                        value={this.state.symbol}
                                                        maxLength="5"
                                                        onChange={(e) => this.onChangeSymbol(e)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <label className="col-sm-3 col-form-label">Description</label>
                                                <div className="col-sm-9">
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
                                                <label className="col-sm-3 col-form-label">File</label>
                                                <div className="col-sm-9">
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        onChange={(e) => this.onChangeFile(e)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-group button">
                                                    <button type="submit" className="btn">Save</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                }
                                {this.state.submitted &&
                                    <div>
                                        <h4>Thank you for choosing Moon Life Market</h4>
                                        <p>Please check our <Link to="/collections">collections</Link>.</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </section>


            </React.Fragment>
        );
    }
}
export default withRouter(NewCollection);
