import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";
import AuctionPrice from "../components/AuctionPrice";
import { AuctionStatusEnum } from "../helpers/enums";

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

            const _state = this.state;

            await this.context.checkStateAsync();

            this.NFTCollectionInstance = this.context.getNftCollectionInstance(this.state.collectionAddress);

            const canMint = await this.NFTCollectionInstance.methods.canMint(this.context.account).call();
            _state.canMint = canMint;

            _state.tokens = await this.loadTokens();
            _state.auctions = await this.loadCollectionAuctions();

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

        return tokens;
    };

    loadCollectionAuctions = async () => {
        const auctionIds = await this.context.marketPlaceInstance.methods.getCollectionAuctions(this.state.collectionAddress).call();

        const auctions = [];

        if (auctionIds.length > 0) {
            for (let i = 0; i < auctionIds.length; i++) {
                const _auctionId = auctionIds[i];

                const auction = await this.context.marketPlaceInstance.methods.getAuction(_auctionId).call();

                if (auction && auction.auctionStatus == AuctionStatusEnum.Running) {
                    auctions.push(auction);
                }
            }
        }

        console.log('auctions', auctions);

        return auctions;
    };

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
                                                    const auction = this.state.auctions ? this.state.auctions.find(auction => auction.tokenId == ele.id) : null;
                                                    return (
                                                        <div key={inx} className="col-lg-4 col-md-6 col-12">
                                                            <div className="single-item-grid">
                                                                <div className="image">
                                                                    <Link to={'/collections/' + this.state.collectionAddress + '/' + ele.id}>
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
                                                                        <Link to={'/collections/' + this.state.collectionAddress + '/' + ele.id}>
                                                                            {ele.title} ({ele.id})
                                                                        </Link>
                                                                    </h3>
                                                                    <AuctionPrice nft={ele} auction={auction} />
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
