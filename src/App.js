import React, { Component } from "react";
import { Routes, Route } from 'react-router-dom'

import Footer from "./layout/Footer";
import NavBar from "./layout/NavBar";
import logo from './img/logo2.png'

import AppContext from "./store/app-context";
import AppProvider from "./store/app-provider";

import Home from "./pages/Home";
import Some from "./pages/Some";
import Error from "./pages/Error";

class App extends Component {

  render() {
    return (
      <AppProvider >
        <NavBar />
        <div className="container-fluid mt-2">
          <div className="row">
            <main role="main" className="col-lg-12 justify-content-center text-center">
              <div className="content mr-auto ml-auto">
                <img src={logo} alt="logo" width="500" height="140" className="mb-2" />
                <Routes>
                  <Route exact path="/" element={<Home />} />
                  <Route exact path="/some" element={<Some />} />
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
