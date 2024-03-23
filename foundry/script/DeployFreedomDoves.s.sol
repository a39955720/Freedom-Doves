// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Script} from "forge-std/Script.sol";
import {AdminNFT} from "../src/AdminNFT.sol";
import {BridgeToken} from "../src/TestUsdc.sol";
import {FreedomDoves} from "../src/FreedomDoves.sol";

contract DeployFreedomDoves is Script {
    uint256 deployerKey = vm.envUint("PRIVATE_KEY");
    uint256 updateInterval = 120;

    function run() external returns (FreedomDoves, AdminNFT, BridgeToken) {
        vm.startBroadcast(deployerKey);
        AdminNFT adminNFT = new AdminNFT();
        BridgeToken bridgeToken = new BridgeToken();
        FreedomDoves freedomDoves = new FreedomDoves(
            updateInterval,
            address(bridgeToken),
            address(adminNFT)
        );
        adminNFT.setFreedomDovesAddr(address(freedomDoves));
        bridgeToken.mint(msg.sender, 100000000000000);
        bridgeToken.transfer(address(freedomDoves), 100000000000000);
        vm.stopBroadcast();
        return (freedomDoves, adminNFT, bridgeToken);
    }
}
