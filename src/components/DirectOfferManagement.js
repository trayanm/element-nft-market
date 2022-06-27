import React, { Component } from "react";
import AppContext from "../store/app-context";

class DirectOfferManagement extends Component {
    static contextType = AppContext;

    state = {
        nft: null,
        auction: null,
        directOffers: null,
        collectionAddress: null,

        offeredPrice: null
    };

    constructor(props) {
        super(props);
        const { nft, auction, directOffers, collectionAddress } = props;

        this.state.nft = nft;
        this.state.auction = auction;
        this.state.directOffers = directOffers;
        this.state.collectionAddress = collectionAddress;
    };

    onChangeOfferedPrice = (event) => {
        const _state = this.state;

        _state.offeredPrice = parseFloat(event.currentTarget.value);
        this.setState(_state);
    };

    handleSubmitCreateDirectOffer = async (event) => {
        event.preventDefault();

        try {
            await this.context.marketPlaceInstance.methods.createDirectOffer(this.state.collectionAddress, this.state.nft.tokenId, this.state.offeredPrice).call(this.context.account);

        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitCancelDirectOffer = async (event) => {
        event.preventDefault();

        try {
            await this.context.marketPlaceInstance.methods.cancelDirectOffer(0).call({ from: this.context.account });

        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitAcceptDirectOffer = async (event) => {
        event.preventDefault();

        try {
            await this.context.marketPlaceInstance.methods.acceptDirectOffer(0).call({ from: this.context.account });

        } catch (error) {
            console.log(error);
        }
    };

    handleSubmitFulfillDirectOffer = async (event) => {
        event.preventDefault();

        try {
            await this.context.marketPlaceInstance.methods.fulfillDirectOffer(0).send({ from: this.context.account, value: this.state.directOffer.offeredPrice });

        } catch (error) {
            console.log(error);
        }
    };

    componentDidMount = async () => {
        try {
            this.NFTCollectionInstance = this.context.getNftCollectionInstance(this.state.collectionAddress);

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
                    <em>DirectOfferManagement</em>
                </div>
            </React.Fragment>
        );
    }
}

export default DirectOfferManagement;
