// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface INftCollection is IERC721 {
    function diamondMint(address owner, string memory _tokenURI) external returns (uint256);
}
