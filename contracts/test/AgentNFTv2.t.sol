// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentNFTv2} from "../src/AgentNFTv2.sol";
import {IERC7857} from "../src/interfaces/IERC7857.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AgentNFTv2Test is Test {
    AgentNFTv2 public nft;

    address owner = address(this);
    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");
    address marketplaceAddr = makeAddr("marketplace");

    bytes32 constant METADATA_HASH = keccak256("encrypted-agent-intelligence-v1");
    string constant ENCRYPTED_URI = "0g://storage/agent/0/encrypted";
    bytes constant SEALED_KEY = hex"deadbeef01020304";

    function setUp() public {
        nft = new AgentNFTv2(owner);
        nft.setMarketplace(marketplaceAddr);
    }

    function _defaultMetadata() internal pure returns (AgentNFTv2.AgentMetadata memory) {
        return AgentNFTv2.AgentMetadata({
            name: "Portfolio Analyzer",
            description: "Analyzes DeFi portfolio allocations",
            capabilities: '["portfolio_analysis","risk_scoring"]',
            pricePerCall: 0.001 ether
        });
    }

    function _mintDefault(address to) internal returns (uint256) {
        return nft.mint(
            to,
            "ipfs://token-metadata",
            _defaultMetadata(),
            METADATA_HASH,
            ENCRYPTED_URI,
            SEALED_KEY
        );
    }

    // =================================================================
    //  Minting
    // =================================================================

    function test_mint_success() public {
        uint256 tokenId = _mintDefault(user1);

        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.tokenURI(0), "ipfs://token-metadata");

        AgentNFTv2.AgentMetadata memory data = nft.getAgentData(0);
        assertEq(data.name, "Portfolio Analyzer");
        assertEq(data.description, "Analyzes DeFi portfolio allocations");
        assertEq(data.capabilities, '["portfolio_analysis","risk_scoring"]');
        assertEq(data.pricePerCall, 0.001 ether);
    }

    function test_mint_onlyOwner() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1)
        );
        nft.mint(
            user1,
            "ipfs://token",
            _defaultMetadata(),
            METADATA_HASH,
            ENCRYPTED_URI,
            SEALED_KEY
        );
    }

    function test_mint_setsMetadataHash() public {
        _mintDefault(user1);
        assertEq(nft.getMetadataHash(0), METADATA_HASH);
    }

    function test_mint_setsEncryptedURI() public {
        _mintDefault(user1);
        assertEq(nft.getEncryptedURI(0), ENCRYPTED_URI);
    }

    function test_mint_setsSealedKey() public {
        _mintDefault(user1);
        assertEq(nft.getSealedKey(0), SEALED_KEY);
    }

    function test_mint_setsAgentData() public {
        _mintDefault(user1);
        AgentNFTv2.AgentMetadata memory data = nft.getAgentData(0);
        assertEq(data.name, "Portfolio Analyzer");
        assertEq(data.description, "Analyzes DeFi portfolio allocations");
        assertEq(data.capabilities, '["portfolio_analysis","risk_scoring"]');
        assertEq(data.pricePerCall, 0.001 ether);
    }

    // =================================================================
    //  ERC-7857: Transfer
    // =================================================================

    function test_transfer_updatesOwner() public {
        _mintDefault(user1);
        bytes memory newKey = hex"aabbccdd";

        vm.prank(user1);
        nft.transfer(user1, user2, 0, newKey, "");

        assertEq(nft.ownerOf(0), user2);
    }

    function test_transfer_updatesSealedKey() public {
        _mintDefault(user1);
        bytes memory newKey = hex"aabbccdd";

        vm.prank(user1);
        nft.transfer(user1, user2, 0, newKey, "");

        assertEq(nft.getSealedKey(0), newKey);
    }

    function test_transfer_clearsAuthorizations() public {
        _mintDefault(user1);

        // Owner authorizes user3
        vm.prank(user1);
        nft.authorizeUsage(0, user3, "");
        assertTrue(nft.isAuthorized(0, user3));

        // Transfer to user2
        vm.prank(user1);
        nft.transfer(user1, user2, 0, hex"aabb", "");

        // user3's authorization should be invalidated
        assertFalse(nft.isAuthorized(0, user3));
    }

    function test_transfer_onlyOwnerOrApproved() public {
        _mintDefault(user1);

        vm.prank(user2);
        vm.expectRevert(AgentNFTv2.NotOwnerOrApproved.selector);
        nft.transfer(user1, user2, 0, hex"aa", "");
    }

    function test_transfer_emitsEvent() public {
        _mintDefault(user1);

        vm.expectEmit(true, true, true, true);
        emit IERC7857.AgentTransferred(0, user1, user2);

        vm.prank(user1);
        nft.transfer(user1, user2, 0, hex"aa", "");
    }

    // =================================================================
    //  ERC-7857: Clone
    // =================================================================

    function test_clone_createsNewToken() public {
        _mintDefault(user1);

        vm.prank(user1);
        uint256 cloneId = nft.clone(user2, 0, hex"cc", "");

        assertEq(cloneId, 1);
        assertEq(nft.ownerOf(1), user2);
    }

    function test_clone_copiesMetadata() public {
        _mintDefault(user1);

        vm.prank(user1);
        uint256 cloneId = nft.clone(user2, 0, hex"cc", "");

        // Same metadata hash and encrypted URI
        assertEq(nft.getMetadataHash(cloneId), METADATA_HASH);
        assertEq(nft.getEncryptedURI(cloneId), ENCRYPTED_URI);

        // Same agent data
        AgentNFTv2.AgentMetadata memory orig = nft.getAgentData(0);
        AgentNFTv2.AgentMetadata memory cloned = nft.getAgentData(cloneId);
        assertEq(cloned.name, orig.name);
        assertEq(cloned.description, orig.description);
        assertEq(cloned.capabilities, orig.capabilities);
        assertEq(cloned.pricePerCall, orig.pricePerCall);
    }

    function test_clone_onlyOwner() public {
        _mintDefault(user1);

        vm.prank(user2);
        vm.expectRevert(AgentNFTv2.NotTokenOwner.selector);
        nft.clone(user2, 0, hex"cc", "");
    }

    function test_clone_independentAuthorizations() public {
        _mintDefault(user1);

        // Authorize user3 on original
        vm.prank(user1);
        nft.authorizeUsage(0, user3, "");

        // Clone to user2
        vm.prank(user1);
        uint256 cloneId = nft.clone(user2, 0, hex"cc", "");

        // user3 is authorized on original but NOT on clone
        assertTrue(nft.isAuthorized(0, user3));
        assertFalse(nft.isAuthorized(cloneId, user3));
    }

    // =================================================================
    //  ERC-7857: Authorization
    // =================================================================

    function test_authorizeUsage_byOwner() public {
        _mintDefault(user1);

        vm.prank(user1);
        nft.authorizeUsage(0, user3, "");

        assertTrue(nft.isAuthorized(0, user3));
    }

    function test_authorizeUsage_byMarketplace() public {
        _mintDefault(user1);

        vm.prank(marketplaceAddr);
        nft.authorizeUsage(0, user3, "");

        assertTrue(nft.isAuthorized(0, user3));
    }

    function test_authorizeUsage_unauthorized() public {
        _mintDefault(user1);

        vm.prank(user2);
        vm.expectRevert(AgentNFTv2.Unauthorized.selector);
        nft.authorizeUsage(0, user3, "");
    }

    function test_isAuthorized_ownerAlwaysTrue() public {
        _mintDefault(user1);
        // Owner is always authorized even without explicit grant
        assertTrue(nft.isAuthorized(0, user1));
    }

    function test_isAuthorized_afterGrant() public {
        _mintDefault(user1);

        vm.prank(user1);
        nft.authorizeUsage(0, user2, "");

        assertTrue(nft.isAuthorized(0, user2));
    }

    function test_revokeUsage() public {
        _mintDefault(user1);

        vm.prank(user1);
        nft.authorizeUsage(0, user2, "");
        assertTrue(nft.isAuthorized(0, user2));

        vm.prank(user1);
        nft.revokeUsage(0, user2);
        assertFalse(nft.isAuthorized(0, user2));
    }

    function test_transfer_invalidatesAuth() public {
        _mintDefault(user1);

        // Authorize user3
        vm.prank(user1);
        nft.authorizeUsage(0, user3, "");
        assertTrue(nft.isAuthorized(0, user3));

        // Transfer
        vm.prank(user1);
        nft.transfer(user1, user2, 0, hex"aa", "");

        // Authorization invalidated
        assertFalse(nft.isAuthorized(0, user3));
    }

    // =================================================================
    //  Metadata Management
    // =================================================================

    function test_updateMetadataHash_onlyTokenOwner() public {
        _mintDefault(user1);
        bytes32 newHash = keccak256("new-intelligence");

        vm.prank(user2);
        vm.expectRevert(AgentNFTv2.NotTokenOwner.selector);
        nft.updateMetadataHash(0, newHash);

        vm.prank(user1);
        nft.updateMetadataHash(0, newHash);
        assertEq(nft.getMetadataHash(0), newHash);
    }

    function test_updateEncryptedURI_onlyTokenOwner() public {
        _mintDefault(user1);

        vm.prank(user2);
        vm.expectRevert(AgentNFTv2.NotTokenOwner.selector);
        nft.updateEncryptedURI(0, "0g://new-uri");

        vm.prank(user1);
        nft.updateEncryptedURI(0, "0g://new-uri");
        assertEq(nft.getEncryptedURI(0), "0g://new-uri");
    }

    function test_updateAgentData_onlyTokenOwner() public {
        _mintDefault(user1);

        AgentNFTv2.AgentMetadata memory newMeta = AgentNFTv2.AgentMetadata({
            name: "Updated Agent",
            description: "New description",
            capabilities: '["new_cap"]',
            pricePerCall: 0.005 ether
        });

        vm.prank(user2);
        vm.expectRevert(AgentNFTv2.NotTokenOwner.selector);
        nft.updateAgentData(0, newMeta);

        vm.prank(user1);
        nft.updateAgentData(0, newMeta);

        AgentNFTv2.AgentMetadata memory stored = nft.getAgentData(0);
        assertEq(stored.name, "Updated Agent");
        assertEq(stored.pricePerCall, 0.005 ether);
    }

    function test_getMetadataHash() public {
        _mintDefault(user1);
        assertEq(nft.getMetadataHash(0), METADATA_HASH);
    }

    function test_getEncryptedURI() public {
        _mintDefault(user1);
        assertEq(nft.getEncryptedURI(0), ENCRYPTED_URI);
    }

    function test_getAgentData() public {
        _mintDefault(user1);
        AgentNFTv2.AgentMetadata memory data = nft.getAgentData(0);
        assertEq(data.name, "Portfolio Analyzer");
        assertEq(data.pricePerCall, 0.001 ether);
    }

    // =================================================================
    //  supportsInterface
    // =================================================================

    function test_supportsERC721() public view {
        // ERC-721 interface ID = 0x80ac58cd
        assertTrue(nft.supportsInterface(0x80ac58cd));
    }

    function test_supportsIERC7857() public view {
        assertTrue(nft.supportsInterface(type(IERC7857).interfaceId));
    }
}
