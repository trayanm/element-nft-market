import React, { Component } from "react";
import { formatPrice } from "../helpers/utils";
import AppContext from "../store/app-context";
import web3 from "../connection/web3";
import { DirectOfferStatusEnum, GetDirectOfferStatusTitle } from "../helpers/enums";

class DirectOfferByBuyer extends Component {
    static contextType = AppContext;

    state = {
        nft: null,
        collectionAddress: null,
        directOffer: null,

        valueOfferedPrice: null
    };

    constructor(props) {
        super(props);
        const { nft, collectionAddress, directOffer } = props;

        this.state.nft = nft;
        this.state.collectionAddress = collectionAddress;
        this.state.directOffer = directOffer;
    };

    onChangeValueOfferedPrice = (event) => {
        const _state = this.state;

        _state.valueOfferedPrice = parseFloat(event.currentTarget.value);
        this.setState(_state);
    };

    handleSubmitCreateDirectOffer = async (event) => {
        event.preventDefault();

        const valueOfferedPrice = this.state.valueOfferedPrice != null ? web3.utils.toWei(String(this.state.valueOfferedPrice), 'ether') : 0;

        await this.context.marketPlaceInstance.methods.createDirectOffer(this.state.collectionAddress, this.state.nft.tokenId, valueOfferedPrice).send({ from: this.context.account });
        await this.context.refreshBlance();

        try {
            // ...
        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitCancel = async (event, buyerAddress) => {
        event.preventDefault();

        await this.context.marketPlaceInstance.methods.cancelDirectOffer(this.state.collectionAddress, this.state.nft.tokenId).send({ from: this.context.account });
        await this.context.refreshBlance();

        try {
            // ...
        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitFulfill = async (event) => {
        event.preventDefault();

        await this.context.marketPlaceInstance.methods.fulfillDirectOffer(this.state.collectionAddress, this.state.nft.tokenId).send({ from: this.context.account, value: this.state.directOffer.offeredPrice });
        await this.context.refreshBlance();

        try {
            // ...
        } catch (error) {
            console.log(error);
        }
    };

    componentDidMount = async () => {
        try {
            // ...
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    render() {
        return (
            <React.Fragment>
                <div>
                    <em>DirectOfferByBuyer</em>
                    {/* current offer */}
                    <div>
                        {this.state.directOffer &&
                            <div>
                                Current offer: {formatPrice(this.state.directOffer.offeredPrice)} ETH ({GetDirectOfferStatusTitle(this.state.directOffer.directOfferStatus)})
                                <form onSubmit={(e) => this.handleSubmitCancel(e)}>
                                    <div className="col-12">
                                        <div className="form-group button">
                                            <button type="submit" className="btn btn-danger">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                                {this.state.directOffer == null || this.state.directOffer.directOfferStatus == DirectOfferStatusEnum.Accepted &&
                                    <form onSubmit={(e) => this.handleSubmitFulfill(e)}>
                                        <div className="col-12">
                                            <div className="form-group button">
                                                <button type="submit" className="btn btn-danger">Fulfill</button>
                                            </div>
                                        </div>
                                    </form>
                                }
                            </div>
                        }

                        <div>
                            <form onSubmit={(e) => this.handleSubmitCreateDirectOffer(e)}>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Offered price</label>
                                    <div className="col-sm-8">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="ETH"
                                            className="form-control"
                                            onChange={(e) => this.onChangeValueOfferedPrice(e)}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group button">
                                        <button type="submit" className="btn btn-danger">Offer</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default DirectOfferByBuyer;
