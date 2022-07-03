import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { formatAddress, formatPrice } from "../helpers/utils";
import AppContext from "../store/app-context";
import web3 from '../connection/web3'

class NavBar extends Component {
    static contextType = AppContext;

    connectWalletHandler = async () => {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            this.context.setAccount(accounts[0]);

        } catch (error) {
            console.error(error);
        }
    };

    claimFundsHandler = async () => {
        try {
            await this.context.marketPlaceInstance.methods.claimFunds().send({ from: this.context.account });
            await this.context.refreshBlance();
            await this.context.refreshUserFunds();
        } catch (error) {
            console.log(error);
        }
    };

    claimProfitAmount = async () => {
        try {
            await this.context.marketPlaceInstance.methods.withdrawProfit().send({ from: this.context.account });
            await this.context.refreshBlance();
            await this.context.refreshProfitAmount();
        } catch (error) {
            console.log(error);
        }
    };

    render() {
        return (
            <React.Fragment>
                <header className="header navbar-area">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-12">
                                <div className="nav-inner">
                                    <nav className="navbar navbar-expand-lg">
                                        <a className="navbar-brand" href="/">
                                            <img src="/assets/images/logo2.png" alt="Logo" />
                                        </a>
                                        <button className="navbar-toggler mobile-menu-btn" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                            aria-expanded="false" aria-label="Toggle navigation">
                                            <span className="toggler-icon"></span>
                                            <span className="toggler-icon"></span>
                                            <span className="toggler-icon"></span>
                                        </button>
                                        <div className="collapse navbar-collapse sub-menu-bar" id="navbarSupportedContent">
                                            <ul id="nav" className="navbar-nav ms-auto">
                                                <li className="nav-item"><Link to="/">Home</Link></li>
                                                {/* <li className="nav-item"><Link to="/some">Some</Link></li> */}
                                                <li className="nav-item"><Link to="/collections">Collections</Link></li>
                                                <li className="nav-item"><Link to="/collections/new">New collection</Link></li>
                                                {/* <li className="nav-item"><Link to="/Profile">Profile</Link></li> */}
                                            </ul>
                                        </div>
                                        <div className="login-button">
                                            <ul>
                                                <li>
                                                    {this.context.account &&
                                                        <a
                                                            href={`${this.context.etherscanUrl}/address/${this.context.account}`}
                                                            target="blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <i className="lni lni-user"></i>&nbsp;
                                                            {formatAddress(this.context.account)} ({formatPrice(this.context.accountBalance)})
                                                        </a>
                                                    }
                                                </li>
                                            </ul>
                                        </div>
                                        {!this.context.account &&
                                            <div className="button header-button">
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    onClick={this.connectWalletHandler}
                                                >
                                                    Connect
                                                </button>
                                            </div>
                                        }
                                        {this.context.userFunds > 0 &&
                                            <div className="button header-button">
                                                <button
                                                    type="button"
                                                    className="btn btn-info btn-block navbar-btn text-white"
                                                    onClick={this.claimFundsHandler}
                                                >
                                                    {`Claim ${formatPrice(this.context.userFunds)} ETH`}
                                                </button>
                                            </div>
                                        }

                                        {this.context.marketOwner == this.context.account && this.context.profitAmount > 0 &&
                                            <div className="button header-button">
                                                <button
                                                    type="button"
                                                    className="btn btn-block navbar-btn text-white"
                                                    onClick={this.claimProfitAmount}
                                                >
                                                    {`Profit ${formatPrice(this.context.profitAmount)} ETH`}
                                                </button>
                                            </div>
                                        }
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </React.Fragment>
        );
    }
}

export default NavBar;
