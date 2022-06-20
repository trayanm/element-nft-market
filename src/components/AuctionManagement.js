import React, { Component } from "react";
import AppContext from "../store/app-context";
import AuctionPrice from "./AuctionPrice";
import web3 from "../connection/web3";
import { AuctionStatusEnum } from "../helpers/enums";

class AuctionManagement extends Component {
    static contextType = AppContext;

    state = {
        nft: null,
        auction: null,

        collectionAddress: null,
        approvedAddress: null,

        initialPrice: null,
        buyItNowPrice: null,
        bid: null,
    };

    constructor(props) {
        super(props);
        const { nft, auction, collectionAddress, approvedAddress } = props;

        this.state.nft = nft;
        this.state.auction = auction;
        this.state.collectionAddress = collectionAddress;
        this.state.approvedAddress = approvedAddress;

        console.log('auction', this.state.auction);
    }

    onChangeInitialPrice = (event) => {
        const _state = this.state;

        _state.initialPrice = parseFloat(event.currentTarget.value);
        this.setState(_state);

        console.log(this.state.initialPrice);
    };

    onChangeBuyItNowPrice = (event) => {
        const _state = this.state;

        _state.buyItNowPrice = parseFloat(event.currentTarget.value);
        this.setState(_state);

        console.log(this.state.buyItNowPrice);
    };

    onChangeBid = (event) => {
        const _state = this.state;

        _state.bid = parseFloat(event.currentTarget.value);
        this.setState(_state);

        console.log(this.state.bid);
    };

    handleSubmitCancel = async (event) => {
        event.preventDefault();

        try {
            await this.context.marketPlaceInstance.methods.cancelAuction(this.state.nft.tokenId).send({ from: this.context.account });
            await this.context.refreshBlance();

        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitSell = async (event) => {
        event.preventDefault();

        try {
            const initialPrice = web3.utils.toWei(web3.utils.toBN(this.state.initialPrice), 'ether');
            const buyItNowPrice = web3.utils.toWei(web3.utils.toBN(this.state.buyItNowPrice), 'ether');

            await this.context.marketPlaceInstance.methods.createAuction(
                this.state.collectionAddress,
                this.state.nft.tokenId,
                initialPrice,
                buyItNowPrice
            ).send({ from: this.context.account });
            await this.context.refreshBlance();

        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitApprove = async (event) => {
        event.preventDefault();

        try {
            console.log(this.context.marketPlaceInstance._address);
            console.log(this.state.nft.tokenId);

            await this.NFTCollectionInstance.methods.approve(this.context.marketPlaceInstance._address, this.state.nft.tokenId).send({ from: this.context.account });
            await this.context.refreshBlance();
        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitBuyNow = async (event) => {
        event.preventDefault();

        try {
            console.log('buyItNowPrice', this.state.auction.buyItNowPrice);

            await this.context.marketPlaceInstance.methods.buyNowAuction(this.state.auction.auctionId).send({ from: this.context.account, value: this.state.auction.buyItNowPrice });
            await this.context.refreshBlance();
        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitBid = async (event) => {
        event.preventDefault();

        // TODO : Implement MarketPlace.bid
        // await this.context.marketPlaceInstance.methods.bid(this.state.auction.auctionId, this.state.nft.tokenId).send({ from: this.context.account, value: this.state.bid });
        // await this.context.refreshBlance();
        try {
            // ...

        } catch (error) {
            console.log(error);
        }
    };

    componentDidMount = async () => {
        try {
            this.NFTCollectionInstance = this.context.getNftCollectionInstance(this.state.collectionAddress)

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    render() {
        if (this.state.nft.owner === this.context.account) {
            if (this.state.auction && this.state.auction.auctionStatus == AuctionStatusEnum.Running) {
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

                            {this.state.approvedAddress === this.context.marketPlaceInstance._address &&
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
                            }

                            {this.state.approvedAddress !== this.context.marketPlaceInstance._address &&
                                <form onSubmit={(e) => this.handleSubmitApprove(e)}>
                                    <button type="submit" className="btn btn-success" >Approve to market</button>
                                </form>
                            }
                        </div>
                    </React.Fragment>
                );
            }
        }
        else {
            if (this.state.auction && this.state.auction.auctionStatus == AuctionStatusEnum.Running) {
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
                                        onChange={(e) => this.onChangeBid(e)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Bid</button>
                            </form>

                            <form onSubmit={(e) => this.handleSubmitBuyNow(e)}>
                                <button type="submit" className="btn btn-success" >Buy now</button>
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
