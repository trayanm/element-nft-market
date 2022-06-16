import React, { Component } from "react";
import { Link } from 'react-router-dom';
import NFTCollection from "../abis/NFTCollection.json";
import { withRouter } from "../hooksHandler";
import web3 from '../connection/web3';
import AppContext from "../store/app-context";
import AuctionManagement from "../components/AuctionManagement";

class CollectionDetail extends Component {
    static contextType = AppContext;

    state = {
        collectionAddress: null,
        auctions: [],
        tokens: [],
        canMint: false
    };

    constructor(props) {
        super(props);

        this.state.collectionAddress = props.params.collectionAddress;
    }

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            //this.web3 = await getWeb3();

            // Get the contract instance.
            //this.networkId = await web3.eth.net.getId();

            // Use web3 to get the user's accounts.
            //this.accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            // this.networkId = await web3.eth.net.getId();

            // this.MarketplaceInstance = new web3.eth.Contract(
            //     Marketplace.abi,
            //     Marketplace.networks[this.networkId] && Marketplace.networks[this.networkId].address
            // );

            await this.context.checkStateAsync();

            this.NFTCollectionInstance = new web3.eth.Contract(
                NFTCollection.abi,
                this.state.collectionAddress
            );

            const canMint = await this.NFTCollectionInstance.methods.canMint(this.context.account).call();
            this.state.canMint = canMint;

            await this.loadTokens();
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

                console.log('metadata', metadata);
                const owner = await this.NFTCollectionInstance.methods.ownerOf(_id).call();

                // const approvedAddress = await this.NFTCollectionInstance.methods.getApproved(_id).call();

                tokens = [{
                    id: _id,
                    title: metadata.properties.name.description,
                    img: metadata.properties.image.description,
                    description: metadata.properties.description.description,
                    owner: owner
                }, ...tokens];

            } catch {
                console.error('Something went wrong');
            }
        }

        this.state.tokens = tokens;
        this.setState(this.state);
    };

    loadCollectionOffers = async () => {
        const auctionIds = await this.context.marketplaceInstance.methods.getCollectionAuctions(this.state.collectionAddress).call();

        const auctions = [];

        if (auctionIds.length > 0) {
            for (let i = 0; i < auctionIds.length; i++) {
                const _auctionId = auctionIds[i];

                const auction = await this.context.marketplaceInstance.methods.getAuction(_auctionId).call();

                if (auction) {
                    auctions.push(auction);
                }
            }
        }

        this.state.auctions = auctions;
        this.setState(this.state);
    };

    handleGiveApprove = async (event, id) => {
        event.preventDefault();

        await this.NFTCollectionInstance.methods.approve(this.state.collectionAddress, id).send({ from: this.context.account });
    };

    handleRevokeApprove = async (event, id) => {
        event.preventDefault();

        await this.NFTCollectionInstance.methods.approve(this.state.collectionAddress, id).send({ from: this.context.account });
    };

    render() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-12">
                        <div className="section-title">
                            <h2 className="wow fadeInUp" data-wow-delay=".4s">{this.state.name} ({this.state.symbol})</h2>
                            <p className="wow fadeInUp" data-wow-delay=".6s">Browse user collections.</p>
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
                                                    const auction = this.state.auctions ? this.state.auctions.find(auction => auction.id === ele.id) : -1;
                                                    //const buyItNowPrice = auctionIndex !== -1 ? formatPrice(marketplaceCtx.auctions[auctionIndex].buyItNowPrice).toFixed(2) : null;

                                                    return (
                                                        <div key={inx} className="col-lg-4 col-md-6 col-12">
                                                            <div className="single-item-grid">
                                                                <div className="image">
                                                                    <a href="item-details.html">
                                                                        <img src={`https://ipfs.infura.io/ipfs/${ele.img}`} alt="#" />
                                                                    </a>
                                                                    {ele.owner === this.context.account &&
                                                                        <i className="cross-badge lni lni-user"></i>
                                                                    }
                                                                    <span className="flat-badge sale">Sale</span>
                                                                </div>
                                                                <div className="content">
                                                                    <a href="#!" className="tag">{ele.description}</a>
                                                                    <h3 className="title">
                                                                        <a href="item-details.html">{ele.title}</a>
                                                                    </h3>

                                                                    <AuctionManagement token={ele} auction={auction} />
                                                                    {/* {auction && ele.owner === this.context.account &&
<button>Cancel</button>
}

{auction && ele.owner !== this.context.account &&
<button>Buy</button>
} */}

                                                                    <ul className="info">
                                                                        <li className="price">$890.00</li>
                                                                        <li className="like">
                                                                            <a href="#!"><i className="lni lni-heart"></i></a>
                                                                        </li>
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
            </React.Fragment>
        );
    }
}
export default withRouter(CollectionDetail);
