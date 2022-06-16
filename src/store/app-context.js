import React from 'react';

const AppContext = React.createContext({
    checkStateAsync: null,

    account: null,
    setAccount: null,

    userFunds: null,

    networkId: null,
    setNetworkId: null,
    
    etherscanUrl: null,

    marketplaceInstance: null,
    setMarketplaceInstance: null,

    mktIsLoading: true,
    setMktIsLoading : null
});

export default AppContext;