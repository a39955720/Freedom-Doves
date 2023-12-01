// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Script} from "forge-std/Script.sol";
import {FreedomDoves} from "../src/FreedomDoves.sol";

contract DeployFreedomDoves is Script {
    uint256 deployerKey = vm.envUint("PRIVATE_KEY");
    uint256 updateInterval = 120;
    address fusdcAddr = 0xcc51294451EEC7373000Fd7Ea0F5eBcA09Bda0EA;
    address adminNFTAddr = 0xC714490B883bd62b228439DD9C7e314Ce8504852;
    address vrfCoordinatorV2 = 0x2eD832Ba664535e5886b75D64C46EB9a228C2610;
    uint64 subscriptionId = 808;
    bytes32 gasLane =
        0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61;
    uint32 callbackGasLimit = 500000;

    function run() external returns (FreedomDoves) {
        vm.startBroadcast(deployerKey);
        FreedomDoves freedomDoves = new FreedomDoves(
            updateInterval,
            fusdcAddr,
            adminNFTAddr,
            vrfCoordinatorV2,
            subscriptionId,
            gasLane,
            callbackGasLimit
        );
        vm.stopBroadcast();
        return freedomDoves;
    }
}
