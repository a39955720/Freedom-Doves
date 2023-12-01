// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Script} from "forge-std/Script.sol";
import {AdminNFT} from "../src/AdminNFT.sol";

contract DeployAdminNFT is Script {
    uint256 deployerKey = vm.envUint("PRIVATE_KEY");

    function run() external returns (AdminNFT) {
        vm.startBroadcast(deployerKey);
        AdminNFT adminNFT = new AdminNFT();
        vm.stopBroadcast();
        return adminNFT;
    }
}
