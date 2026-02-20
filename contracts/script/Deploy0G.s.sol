// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AgentNFT_v1.sol";
import "../src/AgentMarketplace_v1.sol";

contract Deploy0G is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy AgentNFT — deployer (msg.sender) becomes owner
        AgentNFT agentNFT = new AgentNFT(msg.sender);
        console.log("AgentNFT deployed at:", address(agentNFT));

        // 2. Deploy AgentMarketplace — linked to AgentNFT
        AgentMarketplace marketplace = new AgentMarketplace(address(agentNFT));
        console.log("AgentMarketplace deployed at:", address(marketplace));

        vm.stopBroadcast();
    }
}
