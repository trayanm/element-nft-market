import React from 'react';

const AppContext = React.createContext({
    checkStateAsync: null,

    refreshBalance: null,

    marketOwner: null,
    setMarketOwner: null,

    account: null,
    setAccount: null,

    profitAmount: null,
    setProfitAmount: null,

    userFunds: null,
    refreshUserFunds: null,

    networkId: null,
    setNetworkId: null,

    etherscanUrl: null,

    marketPlaceInstance: null,
    setMarketPlaceInstance: null,

    getNftCollectionInstance: null,

    mktIsLoading: true,
    setMktIsLoading: null
});

export default AppContext;