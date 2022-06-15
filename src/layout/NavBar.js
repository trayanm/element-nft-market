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
                {/* Start Header Area */}
                <header className="header navbar-area">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-12">
                                <div className="nav-inner">
                                    <nav className="navbar navbar-expand-lg">
                                        <a className="navbar-brand" href="index.html">
                                            <img src="/assets/images/logo/logo.svg" alt="Logo" />
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
                                                <li className="nav-item"><Link to="/some">Some</Link></li>
                                                <li className="nav-item"><Link to="/collections">Collections</Link></li>
                                                <li className="nav-item"><Link to="/collections/new">New Collection</Link></li>
                                                <li className="nav-item"><Link to="/Profile">Profile</Link></li>
                                            </ul>
                                        </div>
                                        {/* navbar collapse */}
                                        <div className="login-button">
                                            <ul>
                                                <li>
                                                    {this.context.account &&
                                                        <a
                                                            href={`${this.context.etherscanUrl}/address/${this.context.account}`}
                                                            target="blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {formatAddress(this.context.account)} ({ formatPrice(this.context.accountBalance)})
                                                        </a>}
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="button header-button">
                                            {!this.context.account &&
                                                <button
                                                    type="button"
                                                    className="btn"
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
                                    {/* navbar */}
                                </div>
                            </div>
                        </div>
                        {/* row */}
                    </div>
                    {/* container */}
                </header>
                {/* End Header Area */}
            </React.Fragment>
        );
    }
}

export default NavBar;
