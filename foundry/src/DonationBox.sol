// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {PriceConverter} from "./PriceConverter.sol";

error DonationBox__NotOwner();
error DonationBox__TransferFailed();

contract DonationBox {
    using PriceConverter for uint256;

    address private i_owner;
    address private i_priceFeed;
    address[] private s_listOfCharities;
    mapping(address => uint) private s_totalDonations;

    constructor(address priceFeed, address owner) {
        i_owner = owner;
        i_priceFeed = priceFeed;
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
        // s_totalDonations[msg.sender] += (msg.value).getUsdToEth(i_priceFeed);
    }
}
