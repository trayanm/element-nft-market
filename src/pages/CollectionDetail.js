import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";
import AuctionPrice from "../components/AuctionPrice";
import { AuctionStatusEnum, DirectOfferStatus } from "../helpers/enums";
import Spinner from '../components/Spinner';
import web3 from "../connection/web3";
import { dateUtility } from "../helpers/dateUtility";
import Countdown from "react-countdown";

class CollectionDetail extends Component {
    static contextType = AppContext;

    state = {
        collectionAddress: null,
        auctions: [],
        tokens: [],
        // directOffers: [],
        canMint: false,
        loading: true
    };

    constructor(props) {
        super(props);

        this.state.collectionAddress = props.params.collectionAddress;
    }

    componentDidMount = async () => {
        try {

            const _state = this.state;

            await this.context.checkStateAsync();

            this.NFTCollectionInstance = this.context.getNftCollectionInstance(this.state.collectionAddress);

            const canMint = await this.NFTCollectionInstance.methods.canMint(this.context.account).call();
            _state.canMint = canMint;

            _state.tokens = await this.loadTokens();
            _state.auctions = await this.loadCollectionAuctions(_state.tokens);
            // _state.directOffers = await this.loadCollectionDirectOffers(_state.tokens);

            _state.loading = false;

            this.setState(_state);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    loadTokens = async () => {
        const totalSupply = await this.NFTCollectionInstance.methods.totalSupply().call();

        this.state.name = await this.NFTCollectionInstance.methods.name().call();
        this.state.symbol = await this.NFTCollectionInstance.methods.symbol().call();

        let tokens = [];

        for (let i = 0; i < totalSupply; i++) {
            const _id = i + 1;
            const hash = await this.NFTCollectionInstance.methods.tokenURIs(i).call();
            try {
                const response = await fetch(`https://ipfs.infura.io/ipfs/${hash}?clear`);
                if (!response.ok) {
                    throw new Error('Something went wrong');
                }

                const metadata = await response.json();
                const owner = await this.NFTCollectionInstance.methods.ownerOf(_id).call();

                const token = {
                    tokenId: _id,
                    title: metadata.properties.name.description,
                    img: metadata.properties.image.description,
                    description: metadata.properties.description.description,
                    owner: owner
                };
                tokens.push(token);
            } catch {
                console.error('Something went wrong');
            }
        }

        return tokens;
    };

    loadCollectionAuctions = async (tokens) => {
        //const auctionIds = await this.context.marketPlaceInstance.methods.getCollectionAuctions(this.state.collectionAddress).call();
        const result = [];

        const now = new Date();

        if (tokens && tokens.length > 0) {
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];

                const auction = await this.context.marketPlaceInstance.methods.getAuctionBy(this.state.collectionAddress, token.tokenId).call();

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

                    result.push(auctionItem);
                }
            }
        }

        // const result = [];

        // if (auctionIds.length > 0) {
        //     for (let i = 0; i < auctionIds.length; i++) {
        //         const _auctionId = auctionIds[i];

        //         const auction = await this.context.marketPlaceInstance.methods.getAuction(_auctionId).call();

        //         if (auction && auction.auctionStatus == AuctionStatusEnum.Running) {
        //             result.push(auction);
        //         }
        //     }
        // }

        return result;
    };

    // loadCollectionDirectOffers = async (tokens) => {
    //     let result = [];

    //     if (tokens && tokens.length > 0) {
    //         for (let i = 0; i < tokens.length; i++) {
    //             const token = tokens[i];

    //             // TODO : Filter hide by buyer or seller
    //             const directOffers = await this.context.marketPlaceInstance.getDirectOffers(this.state.collectionAddress, token.tokenId).call();

    //             if (directOffers && directOffers.length > 0) {                    
    //                 result = result.concat(directOffers);
    //             }
    //         }
    //     }

    //     return result;
    // };

    handleGiveApprove = async (event, id) => {
        event.preventDefault();

        await this.NFTCollectionInstance.methods.approve(this.state.collectionAddress, id).send({ from: this.context.account });
        await this.context.refreshBlance();
    };

    handleRevokeApprove = async (event, id) => {
        event.preventDefault();

        await this.NFTCollectionInstance.methods.approve(this.state.collectionAddress, id).send({ from: this.context.account });
        await this.context.refreshBlance();
    };

    handleCountDownComplete = async (event, auctionId) => {
        // ...
    };

    render() {
        if (this.state.loading === true) {
            return (<Spinner />);
        }

        return (
            <React.Fragment>
                <div className="breadcrumbs">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="breadcrumbs-content">
                                    <h1 className="page-title">{this.state.name} ({this.state.symbol})</h1>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-12">
                                <ul className="breadcrumb-nav">
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/collections">Collections</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="section">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div>
                                    {this.state.canMint &&
                                        <p>
                                            <Link to={'/collections/' + this.state.collectionAddress + '/new'}  >New token</Link>
                                        </p>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="category-grid-list">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="tab-content" id="nav-tabContent">
                                                <div className="tab-pane fade active show" id="nav-grid" role="tabpanel" aria-labelledby="nav-grid-tab">
                                                    <div className="row">

                                                        {this.state.tokens.map((ele, inx) => {
                                                            const auction = this.state.auctions ? this.state.auctions.find(auction => auction.tokenId == ele.tokenId) : null;
                                                            //const directOffers = this.state.directOffers ? this.state.directOffers.filter(directOffer => directOffer.tokenId == ele.tokenId) : null;

                                                            return (
                                                                <div key={inx} className="col-lg-4 col-md-6 col-12">
                                                                    <div className="single-item-grid">
                                                                        <div className="image">
                                                                            <Link to={'/collections/' + this.state.collectionAddress + '/' + ele.tokenId}>
                                                                                <img src={`https://ipfs.infura.io/ipfs/${ele.img}`} alt="#" />
                                                                            </Link>
                                                                            {ele.owner === this.context.account &&
                                                                                <i className="cross-badge lni lni-user"></i>
                                                                            }
                                                                            {auction && auction.auctionStatus == AuctionStatusEnum.Running &&
                                                                                <span className="flat-badge sale">Sale</span>
                                                                            }
                                                                        </div>
                                                                        <div className="content">
                                                                            <a href="#!" className="tag">{ele.description}</a>
                                                                            <h3 className="title">
                                                                                <Link to={'/collections/' + this.state.collectionAddress + '/' + ele.tokenId}>
                                                                                    {ele.title}
                                                                                </Link>
                                                                            </h3>
                                                                            <AuctionPrice nft={ele} auction={auction} />
                                                                            {auction && auction.endTime > 0 &&
                                                                                <Countdown date={auction.endDateTime} daysInHours={true} onComplete={(e) => this.handleCountDownComplete(e, auction.auctionId)} />
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}
export default withRouter(CollectionDetail);
