import React, { Component } from "react";
import { Navigate, Link } from 'react-router-dom'
import AuctionManagement from "../components/AuctionManagement";
import DirectOfferByBuyer from "../components/DirectOfferByBuyer";
import DirectOffersByOwner from "../components/DirectOffersByOwner";
import { AuctionStatusEnum } from "../helpers/enums";
import { formatAddress, formatPrice } from "../helpers/utils";
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";


class CollectionTokenDetail extends Component {
    static contextType = AppContext;

    state = {
        collectionAddress: null,
        tokenId: null,
        nft: null,
        auction: null,
        approvedAddress: null,

        directOffersByOwner: null,
        directOfferByBuyer: null
    };

    constructor(props) {
        super(props);

        this.state.collectionAddress = props.params.collectionAddress;
        this.state.tokenId = props.params.tokenId;
    }

    componentDidMount = async () => {
        try {
            const _state = this.state;



            await this.context.checkStateAsync();

            // load nft
            this.NFTCollectionInstance = this.context.getNftCollectionInstance(this.state.collectionAddress);

            const hash = await this.NFTCollectionInstance.methods.tokenURIs(this.state.tokenId - 1).call();

            const response = await fetch(`https://ipfs.infura.io/ipfs/${hash}?clear`);
            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            const metadata = await response.json();

            const owner = await this.NFTCollectionInstance.methods.ownerOf(this.state.tokenId).call();

            const nft = {
                tokenId: this.state.tokenId,
                title: metadata.properties.name.description,
                img: metadata.properties.image.description,
                description: metadata.properties.description.description,
                owner: owner
            };

            // check if MarketPlace is approved
            const approvedAddress = await this.NFTCollectionInstance.methods.getApproved(nft.tokenId).call();

            const auction = await this.loadAuction(nft.tokenId);

            if (nft.owner == this.context.account) {
                const directOffersByOwner = await this.loadDirectOffersByOwner(nft.tokenId);
                _state.directOffersByOwner = directOffersByOwner;
            } else {
                const directOfferByBuyer = await this.loadDirectOfferByBuyer(nft.tokenId);
                _state.directOfferByBuyer = directOfferByBuyer;
            }

            // const directOffers = await this.loadDirectOffers(nft.tokenId);

            _state.nft = nft;
            _state.auction = auction;
            _state.approvedAddress = approvedAddress;

            this.setState(_state);

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    loadAuction = async (tokenId) => {
        const now = new Date();

        const collectionAuctions = await this.context.marketPlaceInstance.methods.getCollectionAuctions(this.state.collectionAddress).call();

        const auction = await this.context.marketPlaceInstance.methods.getAuctionBy(this.state.collectionAddress, tokenId).call();

        if (auction && auction.auctionId > 0 && auction.auctionStatus == AuctionStatusEnum.Running) {

            const auctionItem = {
                ownerAddress: auction.ownerAddress,
                collectionAddress: auction.collectionAddress,
                highestBidderAddress: auction.highestBidderAddress,
                highestBid: auction.highestBid,
                auctionId: auction.auctionId,
                tokenId: auction.tokenId,
                buyItNowPrice: auction.buyItNowPrice,
                initialPrice: auction.initialPrice,
                endTime: auction.endTime,
                auctionStatus: auction.auctionStatus
            };

            auctionItem.endDateTime = new Date(auctionItem.endTime * 1000);
            auctionItem.ended = auctionItem.endDateTime <= now;

            return auctionItem;
        }

        return null;
    };

    loadDirectOffersByOwner = async (tokenId) => {
        try {
            const directOffers = [];

            const subList = await this.context.marketPlaceInstance.methods.getDirectOffersByOwner(this.state.collectionAddress, tokenId).call({ from: this.context.account });

            if (subList && subList.length > 0) {
                for (let i = 0; i < subList.length; i++) {
                    const directOffer = subList[i];

                    if (directOffer.directOfferId > 0) {
                        directOffers.push({
                            ownerAddress: directOffer.ownerAddress,
                            collectionAddress: directOffer.collectionAddress,
                            buyerAddress: directOffer.buyerAddress,
                            directOfferId: directOffer.directOfferId,
                            tokenId: directOffer.tokenId,
                            offeredPrice: directOffer.offeredPrice,
                            directOfferStatus: directOffer.directOfferStatus
                        });
                    }
                }
            }

            return directOffers;

        } catch (error) {
            // Skip errors
            // alert(
            //     `Failed to load web3, accounts, or contract. Check console for details.`,
            // );
            // console.error(error);
        }

        return null;
    };

    loadDirectOfferByBuyer = async (tokenId) => {
        try {
            const directOffer = await this.context.marketPlaceInstance.methods.getDirectOfferByBuyer(this.state.collectionAddress, tokenId).call({ from: this.context.account });

            if (directOffer.directOfferId > 0) {
                return directOffer;
            }

            return null;
        } catch (error) {
            // Skip errors
            // alert(
            //     `Failed to load web3, accounts, or contract. Check console for details.`,
            // );
            // console.error(error);            
        }

        return null;
    };

    render() {
        if (this.state.nft === 'zulu') return <Navigate to="/error" />
        return (
            <React.Fragment>
                <div className="breadcrumbs">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="breadcrumbs-content">
                                    {this.state.nft &&
                                        <h1 className="page-title">{this.state.nft.title}</h1>
                                    }
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-12">
                                <ul className="breadcrumb-nav">
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/collections">Collections</Link></li>
                                    <li><Link to={'/collections/' + this.state.collectionAddress}>{formatAddress(this.state.collectionAddress)}</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="item-details section">
                    <div className="container">
                        {this.state.nft &&
                            <div className="top-area">
                                <div className="row">
                                    <div className="col-lg-6 col-md-12 col-12">
                                        <div className="product-images">
                                            <main id="gallery">
                                                <div className="main-img">
                                                    <img src={`https://ipfs.infura.io/ipfs/${this.state.nft.img}`} id="current" alt="#" />
                                                </div>
                                            </main>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-12 col-12">
                                        <div className="product-info">
                                            <h2 className="title">{this.state.nft.title}</h2>
                                            {/* <h3 className="price">
                                                {this.state.auction && this.state.auction.auctionStatus == AuctionStatusEnum.Running && this.state.auction.buyItNowPrice > 0 &&
                                                    <span>{formatPrice(this.state.auction.buyItNowPrice)} ETH</span>
                                                }
                                            </h3> */}
                                            <div className="list-info">
                                                <div>
                                                    {this.state.nft.description}
                                                </div>
                                            </div>
                                            <div className="auction-options">
                                                <AuctionManagement
                                                    nft={this.state.nft}
                                                    auction={this.state.auction}
                                                    collectionAddress={this.state.collectionAddress}
                                                    approvedAddress={this.state.approvedAddress}
                                                />

                                                {this.state.nft.owner === this.context.account &&
                                                    <DirectOffersByOwner
                                                        nft={this.state.nft}
                                                        collectionAddress={this.state.collectionAddress}
                                                        directOffers={this.state.directOffersByOwner}
                                                    />
                                                }

                                                {this.state.nft.owner !== this.context.account &&
                                                    <DirectOfferByBuyer
                                                        nft={this.state.nft}
                                                        collectionAddress={this.state.collectionAddress}
                                                        directOffer={this.state.directOfferByBuyer}
                                                    />
                                                }
                                            </div>
                                            <div className="social-share">
                                                <h4>Share</h4>
                                                <ul>
                                                    <li><a href="#!" className="facebook"><i className="lni lni-facebook-filled"></i></a></li>
                                                    <li><a href="#!" className="twitter"><i className="lni lni-twitter-original"></i></a></li>
                                                    <li><a href="#!" className="google"><i className="lni lni-google"></i></a></li>
                                                    <li><a href="#!" className="linkedin"><i className="lni lni-linkedin-original"></i></a></li>
                                                    <li><a href="#!" className="pinterest"><i className="lni lni-pinterest"></i></a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </section>
            </React.Fragment>
        );
    }
}
export default withRouter(CollectionTokenDetail);
