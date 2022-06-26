import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";
import { formatAddress } from "../helpers/utils";
import Spinner from '../components/Spinner';

class CollectionList extends Component {
    static contextType = AppContext;

    state = {
        collections: [],
        loading: true
    };

    async componentDidMount() {
        try {
            const _state = this.state;

            await this.context.checkStateAsync();

            await this.loadCollections();

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

    loadCollections = async () => {
        const collectionCount = await this.context.marketPlaceInstance.methods.getCollectionCount().call();

        const collections = [];

        for (let index = 0; index < collectionCount; index++) {
            const collection = await this.context.marketPlaceInstance.methods.getCollection(index + 1).call();

            const response = await fetch(`https://ipfs.infura.io/ipfs/${collection.metaURI}?clear`);
            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            const metadata = await response.json();

            const collectionItеm = {
                collectionId: collection.collectionId,
                collectionAddress: collection.collectionAddress,
                ownerAddress: collection.ownerAddress,
                metaURI: collection.metaURI,
                img: metadata.properties.image.description,
                name: metadata.properties.name.description,
                symbol: metadata.properties.symbol.description,
                description: metadata.properties.description.description
            };

            collections.push(collectionItеm);
        }

        this.state.collections = collections;
        this.setState(this.state);
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
                                    <h1 className="page-title">Collections</h1>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-12">
                                <ul className="breadcrumb-nav">
                                    <li><Link to="/">Home</Link></li>
                                    <li>Collections</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="section">
                    <div className="container">
                        {/* <div className="row">
                            <div className="col-12">
                                <div className="section-title">
                                    <h2 className="wow fadeInUp" data-wow-delay=".4s">Collections</h2>
                                    <p className="wow fadeInUp" data-wow-delay=".6s">Browse user collections.</p>
                                </div>
                            </div>
                        </div> */}

                        <div className="row">
                            <div className="col-12">
                                <div className="category-grid-list">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="tab-content" id="nav-tabContent">
                                                <div className="tab-pane fade active show" id="nav-grid" role="tabpanel" aria-labelledby="nav-grid-tab">
                                                    <div className="row">

                                                        {this.state.collections.map((ele, inx) => (
                                                            <div key={inx} className="col-lg-4 col-md-6 col-12">
                                                                <div className="single-item-grid" >
                                                                    <div className="image">
                                                                        <Link to={'/collections/' + ele.collectionAddress}>
                                                                            <img src={`https://ipfs.infura.io/ipfs/${ele.img}`} alt="#" />
                                                                        </Link>
                                                                    </div>
                                                                    <div className="content">
                                                                        <h3 className="title">
                                                                            <Link to={'/collections/' + ele.collectionAddress}>
                                                                                {ele.name}
                                                                            </Link>
                                                                        </h3>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

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
            </React.Fragment >
        );
    }
}

export default withRouter(CollectionList);