export const AuctionStatusEnum = {
    Running: 0, // in progress
    Closed: 1, // closed with no buyer, need to revert funds
    Finished: 2, // finished with buyer, need to revert funds
    Cancelled: 3 // canceled by seller, need to revert funds
}