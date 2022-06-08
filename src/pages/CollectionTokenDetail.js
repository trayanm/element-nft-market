import React, { Component } from "react";
import { Navigate } from 'react-router-dom'
import { withRouter } from "../hooksHandler";

class CollectionTokenDetail extends Component {
    state = {
        collectionAddress: null,
        tokenId: null
    };

    constructor(props) {
        super(props);

        this.state.collectionAddress = props.params.collectionAddress;
        this.state.tokenId = props.params.tokenId;
    }

    componentDidMount = async () => {

    };

    render() {
        if (this.state.tokenId === 'zulu') return <Navigate to="/error" />
        return (
            <React.Fragment>
                <div>
                    <h1>CollectionDetail: {this.state.collectionAddress}</h1>
                    <h1>tokenId: {this.state.tokenId}</h1>
                </div>
            </React.Fragment>
        );
    }
}
export default withRouter(CollectionTokenDetail);
