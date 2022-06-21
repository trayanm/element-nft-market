import React, { Component } from "react";
import { Navigate } from 'react-router-dom'
import AuctionManagement from "../components/AuctionManagement";
import { AuctionStatusEnum } from "../helpers/enums";
import { formatPrice } from "../helpers/utils";
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";

class CollectionTokenDetail extends Component {
    static contextType = AppContext;

    state = {
        collectionAddress: null,
        tokenId: null,
        nft: null,
        auction: null,
        approvedAddress: null
    };

    constructor(props) {
        super(props);

        this.state.collectionAddress = props.params.collectionAddress;
        this.state.tokenId = props.params.tokenId;
    }

    componentDidMount = async () => {
        try {
            console.log(this.state);

            await this.context.checkStateAsync();

            // load nft
            this.NFTCollectionInstance = this.context.getNftCollectionInstance(this.state.collectionAddress);

            const hash = await this.NFTCollectionInstance.methods.tokenURIs(this.state.tokenId - 1).call();

            const response = await fetch(`https://ipfs.infura.io/ipfs/${hash}?clear`);
            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            const metadata = await response.json();

            console.log('metadata', metadata);
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
            console.log('approvedAddress', approvedAddress);

            const auction = await this.loadAuction(nft.tokenId);

            const _state = this.state;

            _state.auction = auction;
            _state.nft = nft;
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
        //  TODO : Use context
        const collectionAuctions = await this.context.marketPlaceInstance.methods.getCollectionAuctions(this.state.collectionAddress).call();

        for (let i = 0; i < collectionAuctions.length; i++) {
            const _auctionId = collectionAuctions[i];

            const auction = await this.context.marketPlaceInstance.methods.getAuction(_auctionId).call();

            console.log('auction', auction);

            if (auction && auction.auctionStatus == AuctionStatusEnum.Running&& auction.tokenId === tokenId) {
                return auction;
            }
        }

        return null;
    };

    render() {
        if (this.state.tokenId === 'zulu') return <Navigate to="/error" />
        return (
            <React.Fragment>
                <section className="item-details section">
                    {this.state.nft &&
                        <div className="container">
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
                                            <h3 className="price">
                                                {/* {this.state.auction && this.state.auction.auctionStatus == AuctionStatusEnum.Running && this.state.auction.initialPrice > 0 &&
                                                    <span className="price-line"><span className="price-tag">Initial</span>{formatPrice(this.state.auction.initialPrice)} ETH</span>
                                                } */}
                                                {this.state.auction && this.state.auction.auctionStatus == AuctionStatusEnum.Running && this.state.auction.buyItNowPrice > 0 &&
                                                    <span>{formatPrice(this.state.auction.buyItNowPrice)} ETH</span>
                                                }
                                            </h3>
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
                                            </div>
                                            {/* <div className="contact-info">
                                                <ul>
                                                    <li>
                                                        <a href="tel:+002562352589" className="call">
                                                            <i className="lni lni-phone-set"></i>
                                                            +00 256 235 2589
                                                            <span>Call &amp; Get more info</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="mailto:example@gmail.com" className="mail">
                                                            <i className="lni lni-envelope"></i>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div> */}
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

                        </div>
                    }
                </section>
            </React.Fragment>
        );
    }
}
export default withRouter(CollectionTokenDetail);
