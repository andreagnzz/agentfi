// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentNFTv2} from "../src/AgentNFTv2.sol";
import {AgentMarketplacev2} from "../src/AgentMarketplacev2.sol";

contract AgentMarketplacev2Test is Test {
    AgentNFTv2 public nft;
    AgentMarketplacev2 public marketplace;

    address deployer = address(this);
    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");
    address platformWallet = makeAddr("platformWallet");

    bytes32 constant METADATA_HASH = keccak256("encrypted-agent-intelligence");
    string constant ENCRYPTED_URI = "0g://storage/agent/0/encrypted";
    bytes constant SEALED_KEY = hex"deadbeef";

    function setUp() public {
        nft = new AgentNFTv2(deployer);
        marketplace = new AgentMarketplacev2(address(nft), platformWallet);

        // Set marketplace as authorized caller on NFT
        nft.setMarketplace(address(marketplace));

        // Mint token 0 to user1
        nft.mint(
            user1,
            "ipfs://token0",
            AgentNFTv2.AgentMetadata({
                name: "Test Agent",
                description: "A test agent",
                capabilities: '["test"]',
                pricePerCall: 0.001 ether
            }),
            METADATA_HASH,
            ENCRYPTED_URI,
            SEALED_KEY
        );
    }

    // =================================================================
    //  Listing
    // =================================================================

    function test_listAgent_success() public {
        vm.expectEmit(true, true, false, true);
        emit AgentMarketplacev2.AgentListed(0, user1, 0.01 ether);

        vm.prank(user1);
        marketplace.listAgent(0, 0.01 ether);

        AgentMarketplacev2.AgentListing memory listing = marketplace.getListing(0);
        assertEq(listing.tokenId, 0);
        assertEq(listing.owner, user1);
        assertEq(listing.pricePerHire, 0.01 ether);
        assertTrue(listing.active);
    }

    function test_listAgent_notOwner_reverts() public {
        vm.prank(user2);
        vm.expectRevert(AgentMarketplacev2.NotTokenOwner.selector);
        marketplace.listAgent(0, 0.01 ether);
    }

    function test_listAgent_alreadyListed_reverts() public {
        vm.startPrank(user1);
        marketplace.listAgent(0, 0.01 ether);

        vm.expectRevert(AgentMarketplacev2.AlreadyListed.selector);
        marketplace.listAgent(0, 0.02 ether);
        vm.stopPrank();
    }

    function test_delistAgent() public {
        vm.startPrank(user1);
        marketplace.listAgent(0, 0.01 ether);

        vm.expectEmit(true, false, false, true);
        emit AgentMarketplacev2.AgentDelisted(0);

        marketplace.delistAgent(0);
        vm.stopPrank();

        AgentMarketplacev2.AgentListing memory listing = marketplace.getListing(0);
        assertFalse(listing.active);
    }

    function test_updatePrice() public {
        vm.startPrank(user1);
        marketplace.listAgent(0, 0.01 ether);

        vm.expectEmit(true, false, false, true);
        emit AgentMarketplacev2.PriceUpdated(0, 0.01 ether, 0.05 ether);

        marketplace.updatePrice(0, 0.05 ether);
        vm.stopPrank();

        AgentMarketplacev2.AgentListing memory listing = marketplace.getListing(0);
        assertEq(listing.pricePerHire, 0.05 ether);
    }

    // =================================================================
    //  Hiring
    // =================================================================

    function test_hireAgent_success() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        vm.deal(user2, 10 ether);

        vm.prank(user2);
        marketplace.hireAgent{value: 1 ether}(0);

        // NFT stays with user1
        assertEq(nft.ownerOf(0), user1);
    }

    function test_hireAgent_platformFee() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        uint256 platformBefore = platformWallet.balance;
        vm.deal(user2, 10 ether);

        vm.prank(user2);
        marketplace.hireAgent{value: 1 ether}(0);

        // 2.5% of 1 ether = 0.025 ether
        uint256 expectedFee = (1 ether * 250) / 10000;
        assertEq(platformWallet.balance - platformBefore, expectedFee);
    }

    function test_hireAgent_ownerPayment() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        uint256 ownerBefore = user1.balance;
        vm.deal(user2, 10 ether);

        vm.prank(user2);
        marketplace.hireAgent{value: 1 ether}(0);

        // 97.5% of 1 ether = 0.975 ether
        uint256 expectedOwnerPayment = 1 ether - (1 ether * 250) / 10000;
        assertEq(user1.balance - ownerBefore, expectedOwnerPayment);
    }

    function test_hireAgent_insufficientPayment_reverts() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        vm.deal(user2, 10 ether);
        vm.prank(user2);
        vm.expectRevert(AgentMarketplacev2.InsufficientPayment.selector);
        marketplace.hireAgent{value: 0.5 ether}(0);
    }

    function test_hireAgent_notActive_reverts() public {
        vm.deal(user2, 10 ether);
        vm.prank(user2);
        vm.expectRevert(AgentMarketplacev2.ListingNotActive.selector);
        marketplace.hireAgent{value: 1 ether}(0);
    }

    function test_hireAgent_emitsEvent() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        uint256 fee = (1 ether * 250) / 10000;
        uint256 ownerPay = 1 ether - fee;

        vm.expectEmit(true, true, false, true);
        emit AgentMarketplacev2.AgentHired(0, user2, 1 ether, ownerPay, fee);

        vm.deal(user2, 10 ether);
        vm.prank(user2);
        marketplace.hireAgent{value: 1 ether}(0);
    }

    // =================================================================
    //  Owner Bypass
    // =================================================================

    function test_hireAgent_ownerFree() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        uint256 ownerBefore = user1.balance;

        // Owner calls hireAgent with 0 value — should succeed
        vm.prank(user1);
        marketplace.hireAgent{value: 0}(0);

        // No balance change
        assertEq(user1.balance, ownerBefore);
    }

    function test_hireAgent_ownerEmitsUsedByOwner() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        vm.expectEmit(true, true, false, true);
        emit AgentMarketplacev2.AgentUsedByOwner(0, user1);

        vm.prank(user1);
        marketplace.hireAgent{value: 0}(0);
    }

    // =================================================================
    //  ERC-7857 Integration
    // =================================================================

    function test_hireAgent_authorizesUser() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        // user2 is not authorized before hiring
        assertFalse(nft.isAuthorized(0, user2));

        vm.deal(user2, 10 ether);
        vm.prank(user2);
        marketplace.hireAgent{value: 1 ether}(0);

        // user2 is authorized after hiring
        assertTrue(nft.isAuthorized(0, user2));
    }

    function test_hireAgent_ownerAlwaysAuthorized() public {
        vm.prank(user1);
        marketplace.listAgent(0, 1 ether);

        // Owner is always authorized via isAuthorized (implicit)
        assertTrue(nft.isAuthorized(0, user1));
    }

    // =================================================================
    //  View Functions
    // =================================================================

    function test_getListedAgents() public {
        // Mint token 1
        nft.mint(
            user1,
            "ipfs://token1",
            AgentNFTv2.AgentMetadata({
                name: "Agent 2",
                description: "desc",
                capabilities: '["test"]',
                pricePerCall: 0.002 ether
            }),
            METADATA_HASH,
            ENCRYPTED_URI,
            SEALED_KEY
        );

        vm.startPrank(user1);
        marketplace.listAgent(0, 0.01 ether);
        marketplace.listAgent(1, 0.02 ether);
        marketplace.delistAgent(0);
        vm.stopPrank();

        AgentMarketplacev2.AgentListing[] memory active = marketplace.getListedAgents();
        assertEq(active.length, 1);
        assertEq(active[0].tokenId, 1);
    }

    function test_getPlatformStats() public {
        (uint256 fees, address wallet, uint256 bps) = marketplace.getPlatformStats();
        assertEq(fees, 0);
        assertEq(wallet, platformWallet);
        assertEq(bps, 250);
    }

    // =================================================================
    //  Admin
    // =================================================================

    function test_setPlatformWallet() public {
        address newWallet = makeAddr("newWallet");

        vm.expectEmit(true, false, false, true);
        emit AgentMarketplacev2.PlatformWalletUpdated(platformWallet, newWallet);

        marketplace.setPlatformWallet(newWallet);

        (, address wallet,) = marketplace.getPlatformStats();
        assertEq(wallet, newWallet);
    }

    function test_setPlatformWallet_zeroAddress_reverts() public {
        vm.expectRevert(AgentMarketplacev2.InvalidPlatformWallet.selector);
        marketplace.setPlatformWallet(address(0));
    }
}
