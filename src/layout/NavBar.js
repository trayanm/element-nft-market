import React, { Component } from "react";
import { Link } from 'react-router-dom';
import AppContext from "../store/app-context";

class NavBar extends Component {
    static contextType = AppContext;

    render() {
        return (
            <React.Fragment>
                <em>conValue: {this.context.conValue}</em>
                <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
                    <ul className="navbar-nav">
                        <li className="nav-item"><Link className="nav-link small" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link small" to="/some">Some</Link></li>
                        <li className="nav-item"><Link className="nav-link small" to="/mint">Mint</Link></li>
                        <li className="nav-item"><Link className="nav-link small" to="/collections">Collections</Link></li>
                    </ul>
                </nav>
            </React.Fragment>
        );
    }
}

export default NavBar;
