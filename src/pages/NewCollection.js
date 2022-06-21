import React, { Component } from "react";
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
        capturedFileBuffer: null
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
            await this.context.refreshBlance();

            console.log(collectionAddress);

            // const accoutnBalance = await web3.eth.getBalance(this.context.account);
            // this.context.setAccountBalance(accoutnBalance);
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
                <div className="row">
                    <div className="col-12">
                        <div className="section-title">
                            <h2 className="wow fadeInUp" data-wow-delay=".4s">New Collection</h2>
                            <p className="wow fadeInUp" data-wow-delay=".6s">Create new collection.</p>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
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
                                <label className="col-sm-4 col-form-label">Title</label>
                                <div className="col-sm-8">
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
                            <button type="submit" className="btn btn-primary">Save</button>
                        </form>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
export default withRouter(NewCollection);
