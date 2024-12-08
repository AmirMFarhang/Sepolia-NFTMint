// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTContract1 is ERC721, Ownable {
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 100;
    mapping(address => bool) public hasMinted;

    constructor() ERC721("FirstCollection", "FCOL") Ownable(msg.sender) {
        // Optionally, you can do additional setup here.
    }

    function mint() external {
        require(totalSupply < MAX_SUPPLY, "All NFTs have been minted");
        require(!hasMinted[msg.sender], "You have already minted this NFT");

        uint256 tokenId = totalSupply + 1;
        _safeMint(msg.sender, tokenId);
        hasMinted[msg.sender] = true;
        totalSupply += 1;
    }
}
