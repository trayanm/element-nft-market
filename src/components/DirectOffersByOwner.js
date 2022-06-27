import React, { Component } from "react";
import { DirectOfferStatusEnum, GetDirectOfferStatusTitle } from "../helpers/enums";
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

        await this.context.marketPlaceInstance.methods.acceptDirectOffer(this.state.collectionAddress, this.state.nft.tokenId, buyerAddress).send({ from: this.context.account});
        await this.context.refreshBlance();

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
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    render() {
        return (
            <React.Fragment>
                <div>
                    <em>DirectOffersByOwner</em>
                    {this.state.directOffers.map((ele, inx) => (
                        <div key={inx}>
                            Offer: {formatPrice(ele.offeredPrice)} ETH ({GetDirectOfferStatusTitle(ele.directOfferStatus)})
                            {ele.directOfferStatus == DirectOfferStatusEnum.Open &&
                                    <form onSubmit={(e) => this.handleSubmitAccept(e, ele.buyerAddress)}>
                                        <div className="col-12">
                                            <div className="form-group button">
                                                <button type="submit" className="btn btn-danger">Accept</button>
                                            </div>
                                        </div>
                                    </form>
                                }
                        </div>
                    ))}
                </div>
            </React.Fragment>
        );
    }
}

export default DirectOffersByOwner;
