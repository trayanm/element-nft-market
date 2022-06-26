export const AuctionStatusEnum = {
    Running: 0, // in progress
    Closed: 1, // closed with no buyer, need to revert funds
    Finished: 2, // finished with buyer, need to revert funds
    Canceled: 3 // canceled by seller, need to revert funds
}

export const DirectOfferStatus = {
    Open: 0, // 0: open for acceptance
    Accepted: 1, // 1: accepted by token owner
    Finished: 2, // 2: finished with buyer
    Canceled: 3 // 3: canceled by seller
}