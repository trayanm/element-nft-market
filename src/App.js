import React, { Component } from "react";
import { Routes, Route } from 'react-router-dom'

import Footer from "./layout/Footer";
import NavBar from "./layout/NavBar";

//import getWeb3 from "./getWeb3";
import web3 from './connection/web3'
import Marketplace from "./abis/Marketplace.json";

import AppContext from "./store/app-context";
import AppProvider from "./store/app-provider";

import Home from "./pages/Home";
import Some from "./pages/Some";
import Error from "./pages/Error";
import CollectionList from "./pages/CollectionList";
import CollectionDetail from "./pages/CollectionDetail";
import CollectionTokenDetail from "./pages/CollectionTokenDetail";
import NewCollection from "./pages/NewCollection";
import NewCollectionToken from "./pages/NewCollectionToken";

class App extends Component {
  static contextType = AppContext;

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      //this.web3 = await getWeb3();

      // Get the contract instance.
      this.networkId = await web3.eth.net.getId();
      this.context.setNetworkId(this.networkId);

      // Use web3 to get the user's accounts.
      this.accounts = await web3.eth.getAccounts();
      this.context.setAccount(this.accounts[0]);

      this.accoutnBalance = await web3.eth.getBalance(this.accounts[0]);
      this.context.setAccountBalance(this.accoutnBalance);

      this.MarketplaceInstance = new web3.eth.Contract(
        Marketplace.abi,
        Marketplace.networks[this.networkId] && Marketplace.networks[this.networkId].address
      );

      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('accountsChanged', accounts);
        // web3Ctx.loadAccount(web3);
        // accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0]);
        this.context.setAccount(accounts[0]);
      });

      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      // Event subscription
      this.MarketplaceInstance.events.onCollectionCreated()
        .on('data', (event) => {
          // collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
          // collectionCtx.setNftIsLoading(false);
          console.log('onCollectionCreated', event);
        })
        .on('error', (error) => {
          console.log(error);
        });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    return (
      <div>
        <NavBar />
        {/* Start Pricing Table Area */}
        <section className="pricing-table section">
          <div className="container">
            <Routes >
              <Route exact path="/" element={<Home />} />
              <Route path="/some" element={<Some />} />
              <Route path="/collections/:collectionAddress" element={<CollectionDetail />} />
              <Route path="/collections/:collectionAddress/new" element={<NewCollectionToken />} />
              <Route path="/collections/:collectionAddress/:tokenId" element={<CollectionTokenDetail />} />
              <Route path="/collections/new" element={<NewCollection />} />
              <Route path="/collections" element={<CollectionList />} />
              <Route path="*" element={<Error />} />
            </Routes>

          </div>
        </section>
        {/*/ End Pricing Table Area */}
        <Footer />
        {/* scroll-top  */}
        <a href="#" className="scroll-top btn-hover">
          <i className="lni lni-chevron-up"></i>
        </a>
      </div>
    );
  }
}

export default App;
