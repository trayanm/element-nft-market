import React, { Component } from "react";
import { Routes, Route } from 'react-router-dom'

import Footer from "./layout/Footer";
import NavBar from "./layout/NavBar";

import AppContext from "./store/app-context";

import Home from "./pages/Home";
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
      // await window.ethereum.request({ method: 'eth_requestAccounts' });

      await this.context.checkStateAsync();
      await this.context.refreshBalance();

      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('accountsChanged', accounts);
        // web3Ctx.loadAccount(web3);
        // accounts[0] && MarketPlaceCtx.loadUserFunds(mktContract, accounts[0]);
        this.context.setAccount(accounts[0]);
        window.location.reload();
      });

      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      // Event subscription
      this.context.marketPlaceInstance.events.onCollectionCreated()
        .on('data', (event) => {
          // collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
          // collectionCtx.setNftIsLoading(false);
          console.log('onCollectionCreated', event);
        })
        .on('error', (error) => {
          console.log(error);
        });

      this.context.marketPlaceInstance.events.onAuctionFinished()
        .on('data', async (event) => {
          // collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
          // collectionCtx.setNftIsLoading(false);
          //console.log('onCollectionCreated', event);
          await this.context.refreshBalance();
          await this.context.refreshUserFunds();
        })
        .on('error', (error) => {
          console.log(error);
        });

      this.context.marketPlaceInstance.events.onAuctionBid()
        .on('data', async (event) => {
          // collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
          // collectionCtx.setNftIsLoading(false);
          //console.log('onCollectionCreated', event);
          await this.context.refreshBalance();
        })
        .on('error', (error) => {
          console.log(error);
        });

      this.context.marketPlaceInstance.events.onAuctionCancelled()
        .on('data', async (event) => {
          // collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
          // collectionCtx.setNftIsLoading(false);
          //console.log('onCollectionCreated', event);
          await this.context.refreshBalance();
        })
        .on('error', (error) => {
          console.log(error);
        });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `App : Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    return (
      <div>
        <NavBar />
        <Routes >
          <Route exact path="/" element={<Home />} />
          <Route path="/collections/:collectionAddress" element={<CollectionDetail />} />
          <Route path="/collections/:collectionAddress/new" element={<NewCollectionToken />} />
          <Route path="/collections/:collectionAddress/:tokenId" element={<CollectionTokenDetail />} />
          <Route path="/collections/new" element={<NewCollection />} />
          <Route path="/collections" element={<CollectionList />} />
          <Route path="*" element={<Error />} />
        </Routes>

        <Footer />
        {/* scroll-top  */}
        <a href="#!" className="scroll-top btn-hover">
          <i className="lni lni-chevron-up"></i>
        </a>
      </div>
    );
  }
}

export default App;
