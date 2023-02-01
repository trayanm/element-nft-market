export const AuctionStatusEnum = {
    Running: 0, // in progress
    Closed: 1, // closed with no buyer, need to revert funds
    Finished: 2, // finished with buyer, need to revert funds
    Canceled: 3 // canceled by seller, need to revert funds
}

export const DirectOfferStatusEnum = {
    Open: 0, // 0: open for acceptance
    Accepted: 1, // 1: accepted by token owner
    Finished: 2, // 2: finished with buyer
    Canceled: 3 // 3: canceled by seller
}

export function getAuctionStatusTitle(auctionStatus) {
    let result = '';

    switch (parseInt(auctionStatus)) {
        case AuctionStatusEnum.Running: result = 'Running'; break;
        case AuctionStatusEnum.Closed: result = 'Closed'; break;
        case AuctionStatusEnum.Finished: result = 'Finished'; break;
        case AuctionStatusEnum.Canceled: result = 'Canceled'; break;
        default:
            break;
    }

    return result;
}

export function getDirectOfferStatusTitle(directOfferStatus) {
    let result = '';

    switch (parseInt(directOfferStatus)) {
        case DirectOfferStatusEnum.Open: result = 'Open'; console.log('Open'); break;
        case DirectOfferStatusEnum.Accepted: result = 'Accepted'; break;
        case DirectOfferStatusEnum.Finished: result = 'Finished'; break;
        case DirectOfferStatusEnum.Canceled: result = 'Canceled'; break;
        default:
            break;
    }

    return result;
}