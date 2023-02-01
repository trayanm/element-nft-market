import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";
import { AuctionStatusEnum, DirectOfferStatus } from "../helpers/enums";
import Spinner from '../components/Spinner';
import web3 from "../connection/web3";
import { dateUtility } from "../helpers/dateUtility";
import Countdown from "react-countdown";
import { formatPrice } from "../helpers/utils";

class CollectionDetail extends Component {
    static contextType = AppContext;

    state = {
        collectionAddress: null,
        auctions: [],
        tokens: [],
        filteredTokens: [],

        countAll: 0,
        countMine: 0,
        countOnSale: 0,

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

            // map tokens to auctions
            if (_state.tokens && _state.tokens.length > 0) {
                for (let i = 0; i < _state.tokens.length; i++) {
                    const ele = _state.tokens[i];
                    const auction = this.state.auctions ? this.state.auctions.find(auction => auction.tokenId == ele.tokenId) : null;
                    ele.auction = auction;
                }
            }

            _state.countAll = _state.tokens.length;
            _state.filteredTokens = _state.tokens;

            const tokenCounts = this.getTokenCounts(_state.filteredTokens);

            _state.countMine = tokenCounts.countMine;
            _state.countOnSale = tokenCounts.countOnSale;

            _state.loading = false;

            this.setState(_state);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `CollectionDetail : Failed to load web3, accounts, or contract. Check console for details.`,
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
                    owner: owner,
                    owned: owner == this.context.account
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

        return result;
    };

    handleFilterTokens = (e, { mineYn, saleYn }) => {
        e.preventDefault();

        const _state = this.state;

        let filteredTokens = _state.tokens;

        console.log('this.context.account', this.context.account);

        if (mineYn === true) {
            filteredTokens = filteredTokens.filter(function (ele) { return ele.owned === true; });
        }

        if (saleYn === true) {
            filteredTokens = filteredTokens.filter(function (ele) { return ele.auction && ele.auction.auctionId > 0; });
        }

        _state.filteredTokens = filteredTokens;

        this.setState(_state);
    };

    getTokenCounts = (filteredTokens) => {
        const result = {
            countMine: 0,
            countOnSale: 0
        };

        for (let i = 0; i < filteredTokens.length; i++) {
            const ele = filteredTokens[i];

            if (ele.owner === this.context.account) {
                result.countMine++;
            }

            if (ele.auction && ele.auction.auctionId > 0) {
                result.countOnSale++;
            }
        }

        return result;
    };

    handleGiveApprove = async (event, id) => {
        event.preventDefault();

        await this.NFTCollectionInstance.methods.approve(this.state.collectionAddress, id).send({ from: this.context.account });
        await this.context.refreshBalance();
    };

    handleRevokeApprove = async (event, id) => {
        event.preventDefault();

        await this.NFTCollectionInstance.methods.approve(this.state.collectionAddress, id).send({ from: this.context.account });
        await this.context.refreshBalance();
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

                            <div className="col-lg-3 col-md-4 col-12">
                                <div className="category-sidebar">

                                    {/* <div className="single-widget search">
                                        <h3>Search Token</h3>
                                        <form action="#">
                                            <input type="text" placeholder="Search Here..." />
                                            <button type="submit"><i className="lni lni-search-alt"></i></button>
                                        </form>
                                    </div> */}

                                    <div className="single-widget">
                                        <h3>Filters</h3>
                                        <ul className="list">
                                            <li>
                                                <a href="#!" onClick={(e) => this.handleFilterTokens(e, {})}>All tokens<span>{this.state.countAll}</span></a>
                                            </li>
                                            <li>
                                                <a href="#!" onClick={(e) => this.handleFilterTokens(e, { mineYn: true })}><i className="lni lni-control-panel"></i> Mine <span>{this.state.countMine}</span></a>
                                            </li>
                                            <li>
                                                <a href="#!" onClick={(e) => this.handleFilterTokens(e, { saleYn: true })}><i className="lni lni-bullhorn"></i> On sale <span>{this.state.countOnSale}</span></a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-9 col-md-8 col-12">
                                <div className="category-grid-list">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="tab-content" id="nav-tabContent">
                                                <div className="tab-pane fade active show" id="nav-grid" role="tabpanel" aria-labelledby="nav-grid-tab">
                                                    <div className="row">

                                                        {this.state.filteredTokens.map((ele, inx) => {
                                                            const auction = ele.auction;
                                                            // const auction = this.state.auctions ? this.state.auctions.find(auction => auction.tokenId == ele.tokenId) : null;
                                                            // const directOffers = this.state.directOffers ? this.state.directOffers.filter(directOffer => directOffer.tokenId == ele.tokenId) : null;

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
                                                                            {auction && !auction.ended && auction.auctionStatus == AuctionStatusEnum.Running &&
                                                                                <>
                                                                                    <span className="flat-badge sale">
                                                                                        <span>Sale</span>&nbsp;
                                                                                        {auction && auction.endTime > 0 &&
                                                                                            <Countdown date={auction.endDateTime} daysInHours={true} onComplete={(e) => this.handleCountDownComplete(e, auction.auctionId)} />
                                                                                        }
                                                                                    </span>
                                                                                </>
                                                                            }

                                                                        </div>
                                                                        <div className="content">
                                                                            <a href="#!" className="tag">{ele.description}</a>
                                                                            <h3 className="title">
                                                                                <Link to={'/collections/' + this.state.collectionAddress + '/' + ele.tokenId}>
                                                                                    {ele.title}
                                                                                </Link>
                                                                            </h3>
                                                                            {/* <AuctionPrice nft={ele} auction={auction} /> */}
                                                                            <ul className="info">
                                                                                {auction &&
                                                                                    <>
                                                                                        {auction.initialPrice > 0 &&
                                                                                            <li className="price"><span>Initial</span><br />{formatPrice(auction.initialPrice)} ETH</li>
                                                                                        }
                                                                                        {auction.highestBid > 0 &&

                                                                                            <>
                                                                                                {auction.highestBidderAddress == this.context.account &&
                                                                                                    <li className="price my-bid" title="You are highest bidder"><span>High</span><br />{formatPrice(auction.highestBid)} ETH </li>
                                                                                                }

                                                                                                {auction.highestBidderAddress != this.context.account &&
                                                                                                    <li className="price"><span>High</span><br />{formatPrice(auction.highestBid)} ETH</li>
                                                                                                }
                                                                                            </>
                                                                                        }
                                                                                        {auction.buyItNowPrice > 0 &&
                                                                                            <li className="price"><span>Buy now</span><br />{formatPrice(auction.buyItNowPrice)} ETH</li>
                                                                                        }

                                                                                        {/* <li><em>{auction.ended}</em></li> */}
                                                                                    </>
                                                                                }
                                                                            </ul>
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
