// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Script} from "forge-std/Script.sol";
import {BridgeToken} from "../src/FakeUsdc.sol";

contract DeployFakeUsdc is Script {
    uint256 deployerKey = vm.envUint("PRIVATE_KEY");

    function run() external returns (BridgeToken) {
        vm.startBroadcast(deployerKey);
        BridgeToken bridgeToken = new BridgeToken();
        vm.stopBroadcast();
        return bridgeToken;
    }
}
