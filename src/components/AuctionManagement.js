import React, { Component } from "react";
import AppContext from "../store/app-context";

class AuctionManagement extends Component {
    static contextType = AppContext;

    state = {
        token: null,
        auction: null
    };

    constructor(props) {
        super(props);
        const { token, auction } = props;

        this.state.token = token;
        this.state.auction = auction;
    }

    render() {
        if (this.state.token.owner === this.context.account) {
            if (this.state.auction) {
                return (
                    <React.Fragment>
                        <em>owner</em> | <em>auction</em>
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        <em>owner</em> | <em>no auction</em>
                    </React.Fragment>
                );
            }
        }
        else{
            if (this.state.auction) {
                return (
                    <React.Fragment>
                        <em>not owner</em> | <em>auction</em>
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        <em>not owner</em> | <em>no auction</em>
                    </React.Fragment>
                );
            }
        }
    }
}

export default AuctionManagement;
