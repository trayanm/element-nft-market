import React, { Component } from "react";
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";

class NewCollection extends Component {
    static contextType = AppContext;

    state = {
        name: '',
        symbol: ''
    };

    componentDidMount = async () => {
        try {
            // // Get network provider and web3 instance.
            // //this.web3 = await getWeb3();

            // // Get the contract instance.
            // this.networkId = await web3.eth.net.getId();

            // // Use web3 to get the user's accounts.
            // this.accounts = await web3.eth.getAccounts();

            // // Get the contract instance.
            // this.networkId = await web3.eth.net.getId();

            // this.MarketPlaceInstance = new web3.eth.Contract(
            //     MarketPlace.abi,
            //     MarketPlace.networks[this.networkId] && MarketPlace.networks[this.networkId].address
            // );

            // console.log(MarketPlace.networks[this.networkId].address);
            // console.log(this.MarketPlaceInstance);

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
            const collectionAddress = await this.context.marketPlaceInstance.methods.createCollection(this.state.name, this.state.symbol).send({ from: this.context.account});
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
                                    placeholder="Symbol..."
                                    value={this.state.symbol}
                                    onChange={(e) => this.onChangeSymbol(e)}
                                />
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
