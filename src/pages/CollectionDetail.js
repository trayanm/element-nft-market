import React, { Component } from "react";
import NFTCollection from "../abis/NFTCollection.json";
import getWeb3 from "../getWeb3";
import { withRouter } from "../hooksHandler";

class CollectionDetail extends Component {
    state = {
        collectionAddress: null,
        etherscanUrl: '',
        tokens: []
    };

    constructor(props) {
        super(props);
        this.state.collectionAddress = props.params.collectionAddress;
    }

    componentDidMount = async () => {
        try {

            // Get network provider and web3 instance.
            this.web3 = await getWeb3();

            // Get the contract instance.
            this.networkId = await this.web3.eth.net.getId();

            // Use web3 to get the user's accounts.
            this.accounts = await this.web3.eth.getAccounts();

            // Get the contract instance.
            this.networkId = await this.web3.eth.net.getId();

            this.NFTCollectionInstance = new this.web3.eth.Contract(
                NFTCollection.abi,
                this.state.collectionAddress
            );

            if (this.networkId === 3) {
                this.state.etherscanUrl = 'https://ropsten.etherscan.io'
            } else if (this.networkId === 4) {
                this.state.etherscanUrl = 'https://rinkeby.etherscan.io'
            } else if (this.networkId === 5) {
                this.state.etherscanUrl = 'https://goerli.etherscan.io'
            } else {
                this.state.etherscanUrl = 'https://etherscan.io'
            }

            await this.loadTokens();
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    loadTokens = async () => {
        const totalSupply = await this.NFTCollectionInstance.methods.totalSupply().call();

        let tokens = [];

        for (let i = 0; i < totalSupply; i++) {
            const hash = await this.NFTCollectionInstance.methods.tokenURIs(i).call();
            try {
                const response = await fetch(`https://ipfs.infura.io/ipfs/${hash}?clear`);
                if (!response.ok) {
                    throw new Error('Something went wrong');
                }

                const metadata = await response.json();

                console.log('metadata', metadata);
                const owner = await this.NFTCollectionInstance.methods.ownerOf(i + 1).call();

                tokens = [{
                    id: i + 1,
                    title: metadata.properties.name.description,
                    img: metadata.properties.image.description,
                    owner: owner
                }, ...tokens];
            } catch {
                console.error('Something went wrong');
            }
        }

        console.log(this.state);
        this.state.tokens = tokens;
        this.setState(this.state);
        console.log(this.state);
    };

    render() {
        console.log('render',this.state);
        return (
            <React.Fragment>
                <div>
                    <h1>CollectionDetail: {this.state.collectionAddress}</h1>
                </div>
                <div className="row text-center">
                    {this.state.tokens.map((ele, inx) => (
                        <div key={inx} className="col-md-2 m-3 pb-3 card border-info">
                            <div className={"card-body"}>
                                <h5 className="card-title">{ele.title} (ID:{ele.id})</h5>
                            </div>
                            <img src={`https://ipfs.infura.io/ipfs/${ele.img}`} className="card-img-bottom" alt={`NFT ${inx}`} />
                        </div>
                    ))}
                </div>
            </React.Fragment>
        );
    }
}
export default withRouter(CollectionDetail);
