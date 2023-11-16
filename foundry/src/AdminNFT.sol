// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {ERC721, IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error AdminNFT_YouCantCallThisFunction();
error AdminNFT_YouCantTransferNFT();
error AdminNFT_NotOwner();

contract AdminNFT is ERC721 {
    address private i_owner;

    uint256 private s_tokenCounter;
    address private s_freedomDovesAddr;

    constructor() ERC721("Admin NFT", "AN") {
        i_owner = msg.sender;
        s_tokenCounter = 0;
    }

    function mintNft(address receiver) public {
        if (msg.sender != s_freedomDovesAddr) {
            revert AdminNFT_YouCantCallThisFunction();
        }
        _mint(receiver, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }

    function transferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public virtual override(ERC721) {
        revert AdminNFT_YouCantTransferNFT();
    }

    function setFreedomDovesAddr(address freedomDovesAddr) public {
        if (msg.sender != i_owner) {
            revert AdminNFT_NotOwner();
        }
        s_freedomDovesAddr = freedomDovesAddr;
    }
}
