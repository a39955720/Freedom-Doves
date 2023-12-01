// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Script} from "forge-std/Script.sol";
import {DonationBox} from "../src/DonationBox.sol";

contract DeployDonationBox is Script {
    uint256 deployerKey = vm.envUint("PRIVATE_KEY");
    address priceFeed = 0x5498BB86BC934c8D34FDA08E81D444153d0D06aD;

    function run() external returns (DonationBox) {
        vm.startBroadcast(deployerKey);
        DonationBox donationBox = new DonationBox(priceFeed);
        vm.stopBroadcast();
        return donationBox;
    }
}
