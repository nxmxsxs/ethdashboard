// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";

import {UserWalletMgrV3} from "../contracts/UserWalletMgrV3.sol";
import {UserWalletMgrV4} from "../contracts/UserWalletMgrV4.sol";

contract UserWalletMgrDeployScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // address _proxy = Upgrades.deployUUPSProxy("UserWalletMgrV2.sol:UserWalletMgrV2", abi.encodeCall(UserWalletMgrV2.initialize, ()));


        vm.stopBroadcast();
    }
}

contract UserWalletMgrUpgradeScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();


        address proxy = address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
        Upgrades.upgradeProxy(proxy, "UserWalletMgrV4.sol:UserWalletMgrV4", "");

        UserWalletMgrV4 mgr = UserWalletMgrV4(proxy);

        vm.stopBroadcast();
    }
}

