// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {PriceConverter} from "./PriceConverter.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error DonationBox__NotOwner();
error DonationBox__TransferFailed();

contract DonationBox {
    using PriceConverter for uint256;

    address private immutable i_owner;
    AggregatorV3Interface private immutable i_priceFeed;
    address[] private s_listOfCharities;
    mapping(address => uint) private s_totalDonations;

    constructor(address priceFeed) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function addCharityList(address charityAddr) public {
        if (msg.sender != i_owner) {
            revert DonationBox__NotOwner();
        }
        s_listOfCharities.push(charityAddr);
    }

    function donate() public payable {
        uint256 perDonation = msg.value / s_listOfCharities.length;
        for (uint256 i = 0; i < s_listOfCharities.length; i++) {
            (bool success, ) = s_listOfCharities[i].call{value: perDonation}(
                ""
            );
            if (!success) {
                revert DonationBox__TransferFailed();
            }
        }
        s_totalDonations[msg.sender] += (msg.value).getAvaxToUsd(i_priceFeed);
    }

    function usdToAvax(uint256 _usdAmount) public view returns (uint256) {
        return (_usdAmount).getUsdToAvax(i_priceFeed);
    }

    function getListOfCharities() public view returns (address[] memory) {
        return s_listOfCharities;
    }

    function getTotalDonations(
        address msgsender
    ) public view returns (uint256) {
        return s_totalDonations[msgsender];
    }
}
