import React, { Component } from "react";
import AppContext from "../store/app-context";
import web3 from "../connection/web3";
import { formatAddress, formatPrice } from "../helpers/utils";

class AuctionPrice extends Component {
    static contextType = AppContext;

    state = {
        nft: null,
        auction: null
    };

    constructor(props) {
        super(props);
        const { nft, auction } = props;

        this.state.nft = nft;
        this.state.auction = auction;
    }

    render() {
        return (
            <React.Fragment>
                <ul className="info">
                    {this.state.auction && this.state.auction.initialPrice > 0 &&
                        <li className="price"><span>Initial</span><br />{formatPrice(this.state.auction.initialPrice)} ETH</li>
                    }
                    {this.state.auction && this.state.auction.highestBid > 0 &&

                        <>
                            {this.state.auction.highestBidderAddress == this.context.account &&
                                <li className="price"><span>High</span><br />{formatPrice(this.state.auction.highestBid)} ETH by <strong>You</strong></li>
                            }

                            {this.state.auction.highestBidderAddress != this.context.account &&
                                <li className="price"><span>High</span><br />{formatPrice(this.state.auction.highestBid)} ETH</li>
                            }
                        </>
                    }
                    {this.state.auction && this.state.auction.buyItNowPrice > 0 &&
                        <li className="price"><span>Buy now</span><br />{formatPrice(this.state.auction.buyItNowPrice)} ETH</li>
                    }

                    {this.state.auction &&
                        <li><em>{this.state.auction.ended}</em></li>
                    }
                </ul>
            </React.Fragment >
        );
    }
}

export default AuctionPrice;
