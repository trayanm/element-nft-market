import React, { Component } from "react";
import AppContext from "../store/app-context";

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
                        <li className="price"><span>Initial</span><br />{this.state.auction.initialPrice}</li>
                    }
                    {this.state.auction && this.state.auction.highestBid > 0 &&
                        <li className="price"><span>High</span><br />{this.state.auction.highestBid}</li>
                    }
                    {this.state.auction && this.state.auction.buyItNowPrice > 0 &&
                        <li className="price"><span>Buy now</span><br />{this.state.auction.buyItNowPrice}</li>
                    }
                </ul>
            </React.Fragment>
        );
    }
}

export default AuctionPrice;
