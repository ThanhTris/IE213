// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EWarranty is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct WarrantyData {
        bytes32 serialHash;
        uint256 expiryDate;
        bool isActive;
    }

    mapping(uint256 => WarrantyData) public warranties;

    constructor() ERC721("Electronic Warranty", "EWAR") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    function mintWarranty(address to, string memory uri, bytes32 _serialHash, uint256 _expiryDate) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        warranties[tokenId] = WarrantyData({
            serialHash: _serialHash,
            expiryDate: _expiryDate,
            isActive: true
        });
    }
}
