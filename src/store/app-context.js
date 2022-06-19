import React from 'react';

const AppContext = React.createContext({
    checkStateAsync: null,

    refreshBlance: null,

    account: null,
    setAccount: null,

    userFunds: null,

    networkId: null,
    setNetworkId: null,

    etherscanUrl: null,

    MarketPlaceInstance: null,
    setMarketPlaceInstance: null,

    getNftCollectionInstance: null,

    mktIsLoading: true,
    setMktIsLoading: null
});

export default AppContext;