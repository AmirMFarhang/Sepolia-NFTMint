// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

contract NFTContract2 is ERC721, Ownable {
    IERC721 public nftContract1;
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 40;

    uint256 public constant EARLY_PRICE = 50 wei;
    uint256 public constant REGULAR_PRICE = 600000000000000 wei;
    uint256 public constant NAME_CHANGE_FEE = 400000000000000 wei;
    uint256 public constant EARLY_BATCH = 15;

    mapping(uint256 => string) public tokenNames;
    mapping(uint256 => bool) public hasCustomName;

    event TokenNameSet(uint256 tokenId, string newName);

    constructor(address _nftContract1) ERC721("SecondCollection", "SCOL") Ownable(msg.sender) {
        nftContract1 = IERC721(_nftContract1);
    }

    function mint(uint256 quantity, string[] calldata names) external payable {
        require(quantity > 0 && quantity <= 5, "Invalid quantity");
        require(totalSupply + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(nftContract1.balanceOf(msg.sender) > 0, "You must own an NFT from Contract 1");

        uint256 price = 0;
        uint256 startId = totalSupply + 1;

        for (uint256 i = 0; i < quantity; i++) {
            uint256 currentId = startId + i;
            if (currentId <= EARLY_BATCH) {
                price += EARLY_PRICE;
            } else {
                price += REGULAR_PRICE;
            }
        }

        require(names.length == quantity, "Names array size must match quantity");
        for (uint256 i = 0; i < quantity; i++) {
            if (bytes(names[i]).length > 0) {
                price += NAME_CHANGE_FEE;
            }
        }

        require(msg.value >= price, "Not enough ETH sent");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply + 1;
            _safeMint(msg.sender, tokenId);

            if (bytes(names[i]).length > 0) {
                tokenNames[tokenId] = names[i];
                hasCustomName[tokenId] = true;
                emit TokenNameSet(tokenId, names[i]);
            }

            totalSupply++;
        }

        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmBaseURIFromPinata/";
    }
}
