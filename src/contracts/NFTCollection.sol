// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract NFTCollection is ERC721, ERC721Enumerable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    string[] public tokenURIs;
    mapping(string => bool) _tokenURIExists;
    mapping(uint256 => string) _tokenIdToTokenURI;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');
        return _tokenIdToTokenURI[tokenId];
    }

    function safeMint(string memory _tokenURI) public {
        require(hasRole(MINTER_ROLE, _msgSender()), 'ERC721PresetMinterPauserAutoId: must have minter role to mint');
        require(!_tokenURIExists[_tokenURI], 'The token URI should be unique');
        tokenURIs.push(_tokenURI);
        uint256 _id = tokenURIs.length; // based on 1
        _tokenIdToTokenURI[_id] = _tokenURI;
        _safeMint(msg.sender, _id);
        _tokenURIExists[_tokenURI] = true;
    }
}
