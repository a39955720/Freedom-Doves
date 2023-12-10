// SPDX-License-Identifier: MIT
/**
 * @title DonationBox
 * @dev A smart contract for handling charitable donations in AVAX cryptocurrency.
 */
pragma solidity ^0.8.21;

// Importing external contracts.
import {PriceConverter} from "./PriceConverter.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Custom error messages for the DonationBox contract.
error DonationBox__NotOwner();
error DonationBox__TransferFailed();

/**
 * @notice DonationBox contract - Facilitates charitable donations in AVAX.
 */
contract DonationBox {
    // Using the PriceConverter library for uint256.
    using PriceConverter for uint256;

    // Immutable variable to store the owner's address.
    address private immutable i_owner;

    // Immutable variable to store the price feed interface contract.
    AggregatorV3Interface private immutable i_priceFeed;

    // Array to store the addresses of charities.
    address[] private s_listOfCharities;

    // Mapping to store the total donations made by each contributor.
    mapping(address => uint) private s_totalDonations;

    /**
     * @notice Constructor to initialize the DonationBox contract.
     * @param priceFeed The address of the AggregatorV3Interface contract for price feed.
     */
    constructor(address priceFeed) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(priceFeed);
    }

    /**
     * @notice Add a charity to the list of supported charities (owner-only function).
     * @param charityAddr The address of the charity to be added.
     */
    function addCharityList(address charityAddr) public {
        // Check if the caller is the owner of the contract.
        if (msg.sender != i_owner) {
            revert DonationBox__NotOwner();
        }

        // Add the charity address to the list.
        s_listOfCharities.push(charityAddr);
    }

    /**
     * @notice Make a donation to the list of charities.
     */
    function donate() public payable {
        // Calculate the amount to donate to each charity.
        uint256 perDonation = msg.value / s_listOfCharities.length;

        // Iterate through the list of charities and send donations.
        for (uint256 i = 0; i < s_listOfCharities.length; i++) {
            (bool success, ) = s_listOfCharities[i].call{value: perDonation}(
                ""
            );
            if (!success) {
                revert DonationBox__TransferFailed();
            }
        }

        // Update the total donations for the contributor in USD.
        s_totalDonations[msg.sender] += (msg.value).getAvaxToUsd(i_priceFeed);
    }

    /**
     * @notice Convert USD amount to AVAX using the current price feed.
     * @param _usdAmount The amount in USD to convert to AVAX.
     * @return The equivalent amount in AVAX.
     */
    function usdToAvax(uint256 _usdAmount) public view returns (uint256) {
        return (_usdAmount).getUsdToAvax(i_priceFeed);
    }

    /**
     * @notice Get the list of supported charities.
     * @return An array containing the addresses of supported charities.
     */
    function getListOfCharities() public view returns (address[] memory) {
        return s_listOfCharities;
    }

    /**
     * @notice Get the total donations made by a specific contributor.
     * @param msgsender The address of the contributor.
     * @return The total amount of donations made by the contributor in USD.
     */
    function getTotalDonations(
        address msgsender
    ) public view returns (uint256) {
        return s_totalDonations[msgsender];
    }
}
