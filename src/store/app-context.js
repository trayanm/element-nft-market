import React from 'react';

const AppContext = React.createContext({
    account: null,
    setAccount: null,

    userFunds: null,

    networkId: null,
    setNetworkId: null,
    
    etherscanUrl: null,

    marketplaceInstance: null,
    setMarketplaceInstance: null,

    mktIsLoading: false,
    setMktIsLoading : null,

    conValue: ''
});

export default AppContext;