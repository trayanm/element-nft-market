import React, { Component } from "react";
import AppContext from "../store/app-context";
import web3 from "../connection/web3";
import { AuctionStatusEnum } from "../helpers/enums";
import { formatPrice } from "../helpers/utils";
import Countdown from "react-countdown";

class AuctionManagement extends Component {
    static contextType = AppContext;

    state = {
        nft: null,
        auction: null,

        collectionAddress: null,
        approvedAddress: null,

        initialPrice: null,
        buyItNowPrice: null,
        bid: null
    };

    constructor(props) {
        super(props);
        const { nft, auction, collectionAddress, approvedAddress } = props;

        this.state.nft = nft;
        this.state.auction = auction;
        this.state.collectionAddress = collectionAddress;
        this.state.approvedAddress = approvedAddress;
    }

    onChangeInitialPrice = (event) => {
        const _state = this.state;

        _state.initialPrice = parseFloat(event.currentTarget.value);
        this.setState(_state);
    };

    onChangeBuyItNowPrice = (event) => {
        const _state = this.state;

        _state.buyItNowPrice = parseFloat(event.currentTarget.value);
        this.setState(_state);
    };

    onChangeBid = (event) => {
        const _state = this.state;

        _state.bid = parseFloat(event.currentTarget.value);
        this.setState(_state);
    };

    handleSubmitCancel = async (event) => {
        event.preventDefault();

        try {
            await this.context.marketPlaceInstance.methods.cancelAuction(this.state.auction.auctionId).send({ from: this.context.account });
            await this.context.refreshBlance();

        } catch (error) {
            // console.log(error);
        }
    };

    handleSubmitSell = async (event) => {
        event.preventDefault();

        try {
            const initialPrice = this.state.initialPrice != null ? web3.utils.toWei(String(this.state.initialPrice), 'ether') : 0;
            const buyItNowPrice = this.state.buyItNowPrice != null ? web3.utils.toWei(String(this.state.buyItNowPrice), 'ether') : 0;

            await this.context.marketPlaceInstance.methods.createAuction(
                /* address _collectionAddress */ this.state.collectionAddress,
                /* uint256 _tokenId */ this.state.nft.tokenId,
                /* uint256 _initialPrice */ initialPrice,
                /* uint256 _buyItNowPrice */ buyItNowPrice,
                /* uint256 _durationDays */ 1
            ).send({ from: this.context.account });

            await this.context.refreshBlance();
        } catch (error) {
            // console.log(error);
        }
    };

    handleSubmitApprove = async (event) => {
        event.preventDefault();

        try {
            await this.NFTCollectionInstance.methods.approve(this.context.marketPlaceInstance._address, this.state.nft.tokenId).send({ from: this.context.account });
            await this.context.refreshBlance();
        } catch (error) {
            // console.log(error);
        }
    };

    handleSubmitBuyNow = async (event) => {
        event.preventDefault();

        try {
            await this.context.marketPlaceInstance.methods.buyNowAuction(this.state.auction.auctionId).send({ from: this.context.account, value: this.state.auction.buyItNowPrice });
            await this.context.refreshBlance();
        } catch (error) {
            // console.log(error);
        }
    };

    handleSubmitBid = async (event) => {
        event.preventDefault();

        try {
            const bid = this.state.bid != null ? web3.utils.toWei(String(this.state.bid), 'ether') : 0;

            await this.context.marketPlaceInstance.methods.bidAuction(this.state.auction.auctionId).send({ from: this.context.account, value: bid });
            await this.context.refreshBlance();

            // ...
        } catch (error) {
            // console.log(error);
        }
    };

    handleSubmitFinish = async (event) => {
        event.preventDefault();

        try {
            await this.context.marketPlaceInstance.methods.checkAuction(this.state.auction.auctionId).send({ from: this.context.account });
            await this.context.refreshBlance();

            // ...
        } catch (error) {
            // console.log(error);
        }
    };

    handleCountDownComplete = async (event) => {
        // ...
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
                        {/* <em>owner</em> | <em>auction</em> */}

                        {!this.state.auction.ended &&
                            <div className="action-sec">
                                <form onSubmit={(e) => this.handleSubmitCancel(e)}>
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <button type="submit" className="btn btn-danger">Cancel auction</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        }

                        {this.state.auction.auctionStatus == AuctionStatusEnum.Running && this.state.auction.ended &&
                            <div className="action-sec">
                                <form onSubmit={(e) => this.handleSubmitFinish(e)}>
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <button type="submit" className="btn btn-danger">Finish auction</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        }
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        {/* <em>owner</em> | <em>no auction</em> */}
                        {this.state.approvedAddress === this.context.marketPlaceInstance._address &&
                            <div className="action-sec">
                                <form onSubmit={(e) => this.handleSubmitSell(e)}>
                                    <div className="row mb-3">
                                        <label className="col-sm-4 col-form-label">Initial price</label>
                                        <div className="col-sm-8">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="ETH"
                                                className="form-control"
                                                onChange={(e) => this.onChangeInitialPrice(e)}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-4 col-form-label">Buy now price</label>
                                        <div className="col-sm-8">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="ETH"
                                                className="form-control"
                                                onChange={(e) => this.onChangeBuyItNowPrice(e)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-danger">Create auction</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        }

                        {this.state.approvedAddress !== this.context.marketPlaceInstance._address &&
                            <div className="action-sec">
                                <form onSubmit={(e) => this.handleSubmitApprove(e)}>
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <button type="submit" className="btn btn-success">Approve to market</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        }
                    </React.Fragment >
                );
            }
        }
        else {
            if (this.state.auction && this.state.auction.auctionStatus == AuctionStatusEnum.Running) {
                return (
                    <React.Fragment>
                        {/* <em>not owner</em> | <em>auction</em> */}
                        {this.state.auction.buyItNowPrice > 0 &&
                            <div className="action-sec">
                                <form onSubmit={(e) => this.handleSubmitBuyNow(e)}>
                                    <div className="row mb-3">
                                        <div className="col">
                                            <div className="col-12">
                                                <div className="form-group button">
                                                    <button type="submit" className="btn btn-success">Buy for {formatPrice(this.state.auction.buyItNowPrice)} ETH</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        }

                        {this.state.auction.highestBidderAddress != this.context.account &&
                            <div className="action-sec">
                                <form onSubmit={(e) => this.handleSubmitBid(e)}>
                                    <div className="row mb-3">
                                        <div className="col-sm-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="ETH"
                                                className="form-control"
                                                onChange={(e) => this.onChangeBid(e)}
                                            />
                                        </div>
                                        <div className="col-sm-4">
                                            <button type="submit" className="btn btn-primary">Bid to auction</button>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-group">

                                        </div>
                                    </div>
                                </form>
                            </div>
                        }

                        {this.state.auction.auctionStatus == AuctionStatusEnum.Running && this.state.auction.ended &&
                            <div className="action-sec">
                                <form onSubmit={(e) => this.handleSubmitFinish(e)}>
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <button type="submit" className="btn btn-primary">Finish auction</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        }
                    </React.Fragment >
                );
            }
            else {
                return (
                    <React.Fragment>
                        <span>
                            {/* nothing */}
                        </span>
                    </React.Fragment>
                );
            }
        }
    }
}

export default AuctionManagement;
