import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { formatPrice } from "../helpers/utils";
import AppContext from "../store/app-context";


class NavBar extends Component {
    static contextType = AppContext;

    connectWalletHandler = async () => {
        try {
            // Request account access
            //await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            this.context.setAccount(accounts[0]);

        } catch (error) {
            console.error(error);
        }
    };

    claimFundsHandler = async () => {

    };

    render() {
        return (
            <React.Fragment>
                <em>conValue: {this.context.conValue}</em>
                <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item"><Link className="nav-link small" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link small" to="/some">Some</Link></li>
                        <li className="nav-item"><Link className="nav-link small" to="/collections">Collections</Link></li>
                        <li className="nav-item"><Link className="nav-link small" to="/collections/new">New Collection</Link></li>
                        <li className="nav-item"><Link className="nav-link small" to="/Profile">Profile</Link></li>
                    </ul>
                    <div className="d-flex me-2">
                        {this.context.account &&
                            <a
                                className="nav-link small"
                                href={`${this.context.etherscanUrl}/address/${this.context.account}`}
                                target="blank"
                                rel="noopener noreferrer"
                            >
                                {this.context.account.substr(0,7)}...${this.context.account.substr(this.context.account.length - 7)} ({formatPrice(this.context.accountBalance)})
                            </a>}

                        {!this.context.account &&
                            <button
                                type="button"
                                className="btn btn-info text-white"
                                onClick={this.connectWalletHandler}
                            >
                                Connect
                            </button>
                        }
                        {this.context.userFunds > 0 &&
                        <button
                            type="button"
                            className="btn btn-info btn-block navbar-btn text-white"
                            onClick={this.claimFundsHandler}
                        >
                            {`Claim ${formatPrice(this.context.userFunds)} ETH`}
                        </button>
                        }
                    </div>
                </nav>
            </React.Fragment>
        );
    }
}

export default NavBar;
