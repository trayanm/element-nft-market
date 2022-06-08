import React, { Component } from "react";
import { Routes, Route } from 'react-router-dom'

import Footer from "./layout/Footer";
import NavBar from "./layout/NavBar";
import logo from './img/logo2.png'

import getWeb3 from "./getWeb3";
import Marketplace from "./abis/Marketplace.json";

import AppContext from "./store/app-context";
import AppProvider from "./store/app-provider";

import Home from "./pages/Home";
import Some from "./pages/Some";
import Error from "./pages/Error";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import CollectionTokenDetail from "./pages/CollectionTokenDetail";
import NewCollection from "./pages/NewCollection";
import NewCollectionToken from "./pages/NewCollectionToken";

class App extends Component {

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.MarketplaceInstance = new this.web3.eth.Contract(
        Marketplace.abi,
        Marketplace.networks[this.networkId] && Marketplace.networks[this.networkId].address
      );

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
      <AppProvider >
        <NavBar />
        <div className="container-fluid mt-2">
          <div className="row">
            <main role="main" className="col-lg-12 justify-content-center text-center">
              <div className="content mr-auto ml-auto">
                <img src={logo} alt="logo" width="500" height="140" className="mb-2" />
                <Routes >
                  <Route exact path="/" element={<Home />} />
                  <Route path="/some" element={<Some />} />
                  <Route path="/collections/:collectionAddress" element={<CollectionDetail />} />
                  <Route path="/collections/:collectionAddress/new" element={<NewCollectionToken />} />
                  <Route path="/collections/:collectionAddress/:tokenId" element={<CollectionTokenDetail />} />
                  <Route path="/collections/new" element={<NewCollection />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="*" element={<Error />} />
                </Routes>
              </div>
            </main>
          </div>
          <hr />
        </div>
        <Footer />
      </AppProvider >
    );
  }
}

export default App;
