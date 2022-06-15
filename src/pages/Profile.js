import React, { Component } from "react";
import { withRouter } from "../hooksHandler";

class Profile extends Component {
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
