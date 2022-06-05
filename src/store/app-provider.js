import React from "react";
import AppContext from "./app-context";

class AppProvider extends React.Component {
    state = {
        conValue: null
    };

    setConValue = async (conValue) => {
        this.state.conValue = conValue;
        this.setState((prevState) => this.state);
    };

    componentDidMount = async () => {
        this.state.conValue = 'set from provider';
        this.setState(this.state);
    };

    render() {
        const { children } = this.props;
        const { conValue } = this.state;

        return (
            <AppContext.Provider
                value={{
                    conValue: this.state.conValue,
                    setConValue: this.setConValue,
                }}>
                {children}
            </AppContext.Provider>
        )
    };
}

export default AppProvider;