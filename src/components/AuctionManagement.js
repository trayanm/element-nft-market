import React, { Component } from "react";
import AppContext from "../store/app-context";
import AuctionPrice from "./AuctionPrice";

class AuctionManagement extends Component {
    static contextType = AppContext;

    state = {
        nft: null,
        auction: null,

        collectionAddress: null,

        initialPrice: null,
        buyItNowPrice: null,
        bid: null,
    };

    constructor(props) {
        super(props);
        const { nft, auction, collectionAddress } = props;

        this.state.nft = nft;
        this.state.auction = auction;
        this.state.collectionAddress = collectionAddress;
    }

    onChangeInitialPrice = (event) => {
        const _state = this.state;

        _state.initialPrice = parseFloat(event.currentTarget.value);
        this.setState(_state);

        console.log(this.state);
    };

    onChangeBuyItNowPrice = (event) => {
        const _state = this.state;

        _state.buyItNowPrice = parseFloat(event.currentTarget.value);
        this.setState(_state);

        console.log(this.state);
    };

    onChangeBid = (event) => {
        const _state = this.state;

        _state.bid = parseFloat(event.currentTarget.value);
        this.setState(_state);

        console.log(this.state);
    };

    handleSubmitCancel = async (event) => {
        event.preventDefault();

        try {
            // ...

        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitSell = async (event) => {
        event.preventDefault();

        try {
            const initialPrice = this.context.web3.utils.toWei(this.state.initialPrice, 'ether');
            const buyItNowPrice = this.context.web3.utils.toWei(this.state.buyItNowPrice, 'ether');

            await this.context.marketplaceInstance.methods.createAuction(
                this.state.collectionAddress,
                this.state.nft.id,
                initialPrice,
                buyItNowPrice
            )

        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitBuyNow = async (event) => {
        event.preventDefault();

        try {
            // ...

        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitBid = async (event) => {
        event.preventDefault();

        try {
            // ...

        } catch (error) {
            console.log(error);
        }
    };

    render() {
        if (this.state.nft.owner === this.context.account) {
            if (this.state.auction) {
                return (
                    <React.Fragment>
                        <div className="actions">
                            {/* <em>owner</em> | <em>auction</em> */}
                            <AuctionPrice nft={this.state.nft} auction={this.state.auction} />
                            <form onSubmit={(e) => this.handleSubmitCancel(e)}>
                                <button type="submit" className="btn btn-danger">Cancel</button>
                            </form>
                        </div>
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        <div className="actions">
                            {/* <em>owner</em> | <em>no auction</em> */}
                            <form onSubmit={(e) => this.handleSubmitSell(e)}>
                                <div className="mb-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Initial Price ETH"
                                        className="form-control"
                                        onChange={(e) => this.onChangeInitialPrice(e)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Buy Now Price ETH"
                                        className="form-control"
                                        onChange={(e) => this.onChangeBuyItNowPrice(e)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Sell</button>
                            </form>
                        </div>
                    </React.Fragment>
                );
            }
        }
        else {
            if (this.state.auction) {
                return (
                    <React.Fragment>
                        <div className="actions">
                            {/* <em>not owner</em> | <em>auction</em> */}
                            <AuctionPrice nft={this.state.nft} auction={this.state.auction} />
                            <form onSubmit={(e) => this.handleSubmitBid(e)}>
                                <div className="mb-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Bid ETH"
                                        className="form-control"
                                        value={this.state.bid}
                                        onChange={(e) => this.onChangeBid(e)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Bid</button>
                            </form>

                            <form onSubmit={(e) => this.handleSubmitBuyNow(e)}>
                                <button type="submit" className="btn btn-success" onClick={this.buyHandler} >Buy now</button>
                            </form>
                        </div>
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        <div className="actions">
                            <span>
                                {/* nothing */}
                            </span>
                        </div>
                    </React.Fragment>
                );
            }
        }
    }
}

export default AuctionManagement;
