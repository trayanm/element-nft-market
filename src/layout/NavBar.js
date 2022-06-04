import React, { Component } from "react";

class NavBar extends Component {
    render() {
        return (
            <React.Fragment>
                <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
                    <ul className="navbar-nav">
                        <li className="nav-item"><a className="nav-link small" href="/">Home</a></li>
                        <li className="nav-item"><a className="nav-link small" href="/some">Some</a></li>
                        <li className="nav-item"><a className="nav-link small" href="/mint">Mint</a></li>
                        <li className="nav-item"><a className="nav-link small" href="/collection">Collection</a></li>
                    </ul>
                </nav>
            </React.Fragment>
        );
    }
}

export default NavBar;
