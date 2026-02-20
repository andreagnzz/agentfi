// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AgentNFTv2.sol";
import "../src/AgentMarketplacev2.sol";

contract DeployV2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AgentNFTv2
        AgentNFTv2 nft = new AgentNFTv2(deployer);
        console.log("AgentNFTv2 deployed at:", address(nft));

        // 2. Deploy AgentMarketplacev2 (platformWallet = deployer for demo)
        AgentMarketplacev2 marketplace = new AgentMarketplacev2(
            address(nft),
            deployer
        );
        console.log("AgentMarketplacev2 deployed at:", address(marketplace));

        // 3. Set marketplace on NFT (allows marketplace to call authorizeUsage)
        nft.setMarketplace(address(marketplace));
        console.log("Marketplace set on NFT contract");

        vm.stopBroadcast();
    }
}
