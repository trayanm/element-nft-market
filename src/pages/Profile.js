import React, { Component } from "react";
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";

class Profile extends Component {
    static contextType = AppContext;

    componentDidMount = async () => {
        await this.context.checkStateAsync();
    };

    render() {
        return (
            <React.Fragment>
                <div>
                    <h1>Profile</h1>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(Profile);
