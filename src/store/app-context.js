import React from 'react';

const AppContext = React.createContext({
    account: null,
    setAccount: null,

    userFunds: null,

    networkId: null,
    setNetworkId: null,
    
    etherscanUrl: null,

    conValue: ''
});

export default AppContext;