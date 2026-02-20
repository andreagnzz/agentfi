// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AgentNFTv2.sol";
import "../src/AgentMarketplacev2.sol";

contract SeedV2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address nftAddr = vm.envAddress("AGENT_NFT_V2");
        address marketAddr = vm.envAddress("AGENT_MARKETPLACE_V2");

        AgentNFTv2 nft = AgentNFTv2(nftAddr);
        AgentMarketplacev2 marketplace = AgentMarketplacev2(marketAddr);

        vm.startBroadcast(deployerPrivateKey);

        // === Agent 0: Portfolio Analyzer ===
        string memory uri0 = vm.envOr(
            "AGENT_0_URI",
            string("https://indexer-storage-testnet-turbo.0g.ai/file/PLACEHOLDER_0")
        );

        nft.mint(
            deployer,
            uri0,
            AgentNFTv2.AgentMetadata({
                name: "AgentFi Portfolio Analyzer",
                description: "Autonomous DeFi portfolio analysis with real-time CoinGecko data",
                capabilities: '["portfolio_analysis","token_tracking","allocation_report","real_time_prices","wallet_balance"]',
                pricePerCall: 0.001 ether
            }),
            keccak256("portfolio-analyzer-v2-encrypted-intelligence"),
            vm.envOr("AGENT_0_ENCRYPTED_URI", string("0g://encrypted/portfolio-analyzer-v2")),
            bytes("sealed-key-portfolio-v2")
        );
        console.log("Minted Agent 0: Portfolio Analyzer");

        // === Agent 1: Yield Optimizer ===
        string memory uri1 = vm.envOr(
            "AGENT_1_URI",
            string("https://indexer-storage-testnet-turbo.0g.ai/file/PLACEHOLDER_1")
        );

        nft.mint(
            deployer,
            uri1,
            AgentNFTv2.AgentMetadata({
                name: "AgentFi Yield Optimizer",
                description: "Multi-protocol yield optimization - SaucerSwap, Bonzo Finance, DeFi Llama",
                capabilities: '["yield_optimization","defi_yields","saucerswap","bonzo_finance","strategy_recommendation"]',
                pricePerCall: 0.001 ether
            }),
            keccak256("yield-optimizer-v2-encrypted-intelligence"),
            vm.envOr("AGENT_1_ENCRYPTED_URI", string("0g://encrypted/yield-optimizer-v2")),
            bytes("sealed-key-yield-v2")
        );
        console.log("Minted Agent 1: Yield Optimizer");

        // === Agent 2: Risk Scorer ===
        string memory uri2 = vm.envOr(
            "AGENT_2_URI",
            string("https://indexer-storage-testnet-turbo.0g.ai/file/PLACEHOLDER_2")
        );

        nft.mint(
            deployer,
            uri2,
            AgentNFTv2.AgentMetadata({
                name: "AgentFi Risk Scorer",
                description: "Deterministic portfolio risk scoring - volatility, concentration, stablecoin analysis",
                capabilities: '["risk_scoring","volatility_analysis","deterministic_scoring","portfolio_assessment"]',
                pricePerCall: 0.0005 ether
            }),
            keccak256("risk-scorer-v2-encrypted-intelligence"),
            vm.envOr("AGENT_2_ENCRYPTED_URI", string("0g://encrypted/risk-scorer-v2")),
            bytes("sealed-key-risk-v2")
        );
        console.log("Minted Agent 2: Risk Scorer");

        // === List all 3 on marketplace ===
        marketplace.listAgent(0, 0.001 ether);
        marketplace.listAgent(1, 0.001 ether);
        marketplace.listAgent(2, 0.0005 ether);

        console.log("All 3 agents listed on marketplace");

        vm.stopBroadcast();
    }
}
