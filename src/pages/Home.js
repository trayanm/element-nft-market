import React, { Component } from "react";
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";

class Home extends Component {
    static contextType = AppContext;

    render() {

        return (
            <React.Fragment>
                <div>
                    <h1>Home</h1>
                    <em>conValue: {this.context.conValue}</em>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(Home);
