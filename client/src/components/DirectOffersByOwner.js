import React, { Component } from "react";
import { DirectOfferStatusEnum, getDirectOfferStatusTitle } from "../helpers/enums";
import { formatPrice } from "../helpers/utils";
import AppContext from "../store/app-context";

class DirectOffersByOwner extends Component {
    static contextType = AppContext;

    state = {
        nft: null,
        collectionAddress: null,
        directOffers: null,
    };

    constructor(props) {
        super(props);
        const { nft, collectionAddress, directOffers } = props;

        this.state.nft = nft;
        this.state.collectionAddress = collectionAddress;
        this.state.directOffers = directOffers;
    };

    handleSubmitAccept = async (event, buyerAddress) => {
        event.preventDefault();

        await this.context.marketPlaceInstance.methods.acceptDirectOffer(this.state.collectionAddress, this.state.nft.tokenId, buyerAddress).send({ from: this.context.account });
        await this.context.refreshBalance();

        try {
            // ...
        } catch (error) {
            console.log(error);
        }
    };

    componentDidMount = async () => {
        try {

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `DirectOffersByOwner : Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    render() {
        if (this.state.directOffers == null) {
            return (<></>);
        }

        return (
            <React.Fragment>
                <div>
                    {this.state.directOffers.map((ele, inx) => (
                        <div key={inx}>

                            {ele.directOfferStatus == DirectOfferStatusEnum.Open &&
                                <form onSubmit={(e) => this.handleSubmitAccept(e, ele.buyerAddress)}>
                                    <div className="row">
                                        <label className="col-8 col-form-label">Offer: {formatPrice(ele.offeredPrice)} ETH ({getDirectOfferStatusTitle(ele.directOfferStatus)})</label>
                                        <div className="col-4">
                                            <div className="form-group">
                                                <button type="submit" className="btn btn-primary">Accept</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            }

                            {ele.directOfferStatus != DirectOfferStatusEnum.Open &&
                                <div className="row">
                                    <label className="col-8 col-form-label">Offer: {formatPrice(ele.offeredPrice)} ETH ({getDirectOfferStatusTitle(ele.directOfferStatus)})</label>
                                    <div className="col-4">
                                        <div className="form-group">
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </React.Fragment>
        );
    }
}

export default DirectOffersByOwner;
