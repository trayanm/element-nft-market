import React, { Component } from "react";
import SimpleContract from "../abis/SimpleContract.json";
import getWeb3 from "../getWeb3";
import AppContext from "../store/app-context";

class Some extends Component {
  static contextType = AppContext;

  state = {
    someString: '',
    conValue: ''
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.SimpleContractInstance = new this.web3.eth.Contract(
        SimpleContract.abi,
        SimpleContract.networks[this.networkId] && SimpleContract.networks[this.networkId].address
      );

      // get some string
      const someString = await this.SimpleContractInstance.methods.getSomeString().call({ from: this.accounts[0] });
      console.log('someString', someString);
      this.state.someString = someString;
      this.setState(this.state);

      // context
      console.log('this.context', this.context);
      this.state.conValue = this.context.conValue;
      this.setState(this.state);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  // -- Private Methods
  // --

  // -- Handlers
  handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await this.SimpleContractInstance.methods.setSomeString(this.state.someString).send({ from: this.accounts[0] });
    } catch (error) {
      console.log(error);
    }
  };

  onChangeSomeString = async (event) => {
    this.state.someString = event.currentTarget.value;
    this.setState(this.state);
  };
  // --

  // -- Handlers Context
  handleSubmitConValue = async (event) => {
    event.preventDefault();
    //this.context.conValue = this.state.conValue;
    this.context.setConValue(this.state.conValue);
  };

  onChangeConValue = async (event) => {
    this.state.conValue = event.currentTarget.value;
    this.setState(this.state);
  };
  // --

  render() {
    return (
      <React.Fragment>
        <div>
          <form onSubmit={(e) => this.handleSubmit(e)}>
            <input type="text" value={this.state.someString} onChange={(e) => this.onChangeSomeString(e)} />
            <button type="submit">Set</button>
          </form>
          <hr />
          <form onSubmit={(e) => this.handleSubmitConValue(e)}>
            <input type="text" value={this.state.conValue} onChange={(e) => this.onChangeConValue(e)} />
            <button type="submit">Set</button>
          </form>
        </div>
      </React.Fragment>
    );
  }
}

export default Some;
