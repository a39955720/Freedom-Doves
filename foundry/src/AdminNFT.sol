// SPDX-License-Identifier: MIT
/**
 * @title AdminNFT
 * @dev An ERC721 token contract with additional administrative features.
 */
pragma solidity ^0.8.21;

// Importing ERC721 and IERC721 from OpenZeppelin contracts.
import {ERC721, IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Custom error messages for the AdminNFT contract.
error AdminNFT_YouCantCallThisFunction();
error AdminNFT_YouCantTransferNFT();
error AdminNFT_NotOwner();

/**
 * @notice AdminNFT contract - Extends ERC721 token functionality.
 */
contract AdminNFT is ERC721 {
    // Private variable to store the owner's address.
    address private i_owner;

    // Private variable to store the token counter for unique token IDs.
    uint256 private s_tokenCounter;

    // Private variable to store the address of the FreedomDoves contract.
    address private s_freedomDovesAddr;

    /**
     * @notice Constructor to initialize the AdminNFT contract.
     */
    constructor() ERC721("Admin NFT", "AN") {
        // Set the contract deployer's address as the owner.
        i_owner = msg.sender;

        // Initialize the token counter.
        s_tokenCounter = 0;
    }

    /**
     * @notice Mint a new NFT and assign it to the specified receiver.
     * @param receiver The address to receive the newly minted NFT.
     */
    function mintNft(address receiver) public {
        // Check if the caller is the FreedomDoves contract.
        if (msg.sender != s_freedomDovesAddr) {
            revert AdminNFT_YouCantCallThisFunction();
        }

        // Mint a new NFT using the internal _mint function.
        _mint(receiver, s_tokenCounter);

        // Increment the token counter to ensure each NFT has a unique ID.
        s_tokenCounter = s_tokenCounter + 1;
    }

    /**
     * @notice Override transferFrom to prohibit NFT transfers.
     */
    function transferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public virtual override(ERC721) {
        // Revert with a custom error message indicating the prohibition of NFT transfers.
        revert AdminNFT_YouCantTransferNFT();
    }

    /**
     * @notice Set the address of the FreedomDoves contract (admin function).
     * @param freedomDovesAddr The new address for the FreedomDoves contract.
     */
    function setFreedomDovesAddr(address freedomDovesAddr) public {
        // Check if the caller is the contract owner.
        if (msg.sender != i_owner) {
            revert AdminNFT_NotOwner();
        }

        // Set the address of the FreedomDoves contract.
        s_freedomDovesAddr = freedomDovesAddr;
    }

    /**
     * @notice Get the total supply of NFTs minted by the contract.
     * @return The total number of NFTs minted.
     */
    function getTotalSupply() public view returns (uint256) {
        return s_tokenCounter;
    }
}
