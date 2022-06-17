import React, { Component } from "react";
import { Navigate } from 'react-router-dom'
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";

class CollectionTokenDetail extends Component {
    static contextType = AppContext;

    state = {
        collectionAddress: null,
        tokenId: null,
        nft: null
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

            await this.loadNft();

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    loadNft = async () => {
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
            id: this.state.tokenId,
            title: metadata.properties.name.description,
            img: metadata.properties.image.description,
            description: metadata.properties.description.description,
            owner: owner
        };


        const _state = this.state;

        _state.nft = nft;
        this.setState(_state);
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
                                            <h2 className="title">MacBook Pro 13-inch</h2>
                                            <p className="location"><i className="lni lni-map-marker"></i><a href="#!">New York, USA</a></p>
                                            <h3 className="price">$999</h3>
                                            <div className="list-info">
                                                <h4>Informations</h4>
                                                <ul>
                                                    <li><span>Condition:</span> New</li>
                                                    <li><span>Brand:</span> Apple</li>
                                                    <li><span>Model:</span> Mackbook Pro</li>
                                                </ul>
                                            </div>
                                            <div className="contact-info">
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

                        </div>
                    }
                </section>
            </React.Fragment>
        );
    }
}
export default withRouter(CollectionTokenDetail);
