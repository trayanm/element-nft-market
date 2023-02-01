import React, { Component } from "react";
import { Navigate, Link } from 'react-router-dom'
import AuctionManagement from "../components/AuctionManagement";
import DirectOfferByBuyer from "../components/DirectOfferByBuyer";
import DirectOffersByOwner from "../components/DirectOffersByOwner";
import { AuctionStatusEnum } from "../helpers/enums";
import { formatAddress, formatPrice } from "../helpers/utils";
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";
import Countdown from "react-countdown";

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
                `CollectionTokenDetail : Failed to load web3, accounts, or contract. Check console for details.`,
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
                            <>
                                <div className="top-area">
                                    <div className="row">
                                        <div className="col-lg-6 col-md-12 col-12">
                                            <div className="product-images">
                                                <main id="gallery">
                                                    <div className="main-img">
                                                        <img src={`https://ipfs.infura.io/ipfs/${this.state.nft.img}`} id="current" alt="#!" />
                                                    </div>
                                                </main>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-12 col-12">
                                            <div className="product-info">
                                                <h2 className="title">{this.state.nft.title}</h2>
                                                <div className="auction-options">
                                                    {this.state.auction && !this.state.auction.ended &&
                                                        <div className="list-info">
                                                            <div className="counter">Ends in:
                                                                <span>
                                                                    <Countdown date={this.state.auction.endDateTime} daysInHours={true} onComplete={(e) => this.handleCountDownComplete(e)} />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    }
                                                    <div className="list-info">
                                                        {this.state.auction &&
                                                            <ul>
                                                                {this.state.auction.initialPrice > 0 &&
                                                                    <li><span>Initial:</span> {formatPrice(this.state.auction.initialPrice)} ETH</li>
                                                                }
                                                                {this.state.auction.buyItNowPrice > 0 &&
                                                                    <li><span>Buy now:</span> {formatPrice(this.state.auction.buyItNowPrice)} ETH</li>
                                                                }
                                                                {this.state.auction.highestBid > 0 &&
                                                                    <>
                                                                        {this.state.auction.highestBidderAddress == this.context.account &&
                                                                            <li><span>High:</span> {formatPrice(this.state.auction.highestBid)} ETH by <strong>You</strong></li>
                                                                        }

                                                                        {this.state.auction.highestBidderAddress != this.context.account &&
                                                                            <li><span>High:</span> {formatPrice(this.state.auction.highestBid)} ETH</li>
                                                                        }
                                                                    </>
                                                                }
                                                            </ul>
                                                        }

                                                        <div className="auction-management">
                                                            <AuctionManagement
                                                                nft={this.state.nft}
                                                                auction={this.state.auction}
                                                                collectionAddress={this.state.collectionAddress}
                                                                approvedAddress={this.state.approvedAddress}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* {this.state.nft.owner === this.context.account &&
                                                            <div className="list-info">
                                                                <DirectOffersByOwner
                                                                    nft={this.state.nft}
                                                                    collectionAddress={this.state.collectionAddress}
                                                                    directOffers={this.state.directOffersByOwner}
                                                                />
                                                            </div>
                                                        } */}

                                                    {/* {this.state.nft.owner !== this.context.account &&
                                                            <div className="list-info">
                                                                <DirectOfferByBuyer
                                                                    nft={this.state.nft}
                                                                    collectionAddress={this.state.collectionAddress}
                                                                    directOffer={this.state.directOfferByBuyer}
                                                                />
                                                            </div>
                                                        } */}
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

                                <div className="item-details-blocks">
                                    <div className="row">
                                        <div className="col-lg-8 col-md-7 col-12">

                                            <div className="single-block description">
                                                <h3>Description</h3>
                                                <p>
                                                    {this.state.nft.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-5 col-12">
                                            <div className="item-details-sidebar">
                                                {!this.state.auction && this.state.nft.owner !== this.context.account &&
                                                    <div className="single-block">
                                                        <h3>Direct offer</h3>
                                                        <div>
                                                            <DirectOfferByBuyer
                                                                nft={this.state.nft}
                                                                collectionAddress={this.state.collectionAddress}
                                                                directOffer={this.state.directOfferByBuyer}
                                                            />
                                                            {/* <img src="assets/images/testimonial/testi3.jpg" alt="#!" />
                                                            <h4>Miliya Jessy</h4>
                                                            <span>Member Since May 15,2023</span>
                                                            <a href="#!" className="see-all">See All Ads</a> */}
                                                        </div>
                                                    </div>
                                                }

                                                {!this.state.auction && this.state.nft.owner === this.context.account && this.state.directOffersByOwner &&
                                                    <div className="single-block">
                                                        <h3>Direct offers</h3>
                                                        <div className="">
                                                            <DirectOffersByOwner
                                                                nft={this.state.nft}
                                                                collectionAddress={this.state.collectionAddress}
                                                                directOffers={this.state.directOffersByOwner}
                                                            />
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </section>
            </React.Fragment>
        );
    }
}
export default withRouter(CollectionTokenDetail);
