// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AgentNFTv2} from "./AgentNFTv2.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AgentMarketplacev2
/// @notice Marketplace for listing and hiring ERC-7857 AI agents on 0G Chain.
///         Features: 2.5% platform fee, owner bypass, ERC-7857 usage authorization.
contract AgentMarketplacev2 is Ownable, ReentrancyGuard {
    // ---------------------------------------------------------------
    //  State
    // ---------------------------------------------------------------

    AgentNFTv2 public agentNFT;

    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant BPS_DENOMINATOR = 10000;
    address public platformWallet;
    uint256 public totalFeesCollected;

    struct AgentListing {
        uint256 tokenId;
        address owner;
        uint256 pricePerHire;
        bool active;
    }

    mapping(uint256 => AgentListing) public listings;
    uint256[] public listedTokenIds;

    // ---------------------------------------------------------------
    //  Events
    // ---------------------------------------------------------------

    event AgentListed(uint256 indexed tokenId, address indexed owner, uint256 pricePerHire);
    event AgentDelisted(uint256 indexed tokenId);
    event AgentHired(
        uint256 indexed tokenId,
        address indexed hirer,
        uint256 totalPaid,
        uint256 ownerPayment,
        uint256 platformFee
    );
    event AgentUsedByOwner(uint256 indexed tokenId, address indexed owner);
    event PlatformWalletUpdated(address oldWallet, address newWallet);
    event PriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);

    // ---------------------------------------------------------------
    //  Errors
    // ---------------------------------------------------------------

    error NotTokenOwner();
    error ListingNotActive();
    error InsufficientPayment();
    error TransferFailed();
    error AlreadyListed();
    error NotListed();
    error InvalidPlatformWallet();

    // ---------------------------------------------------------------
    //  Constructor
    // ---------------------------------------------------------------

    constructor(address _agentNFT, address _platformWallet) Ownable(msg.sender) {
        agentNFT = AgentNFTv2(_agentNFT);
        platformWallet = _platformWallet;
    }

    // ---------------------------------------------------------------
    //  Listing Functions
    // ---------------------------------------------------------------

    function listAgent(uint256 tokenId, uint256 pricePerHire) external {
        if (agentNFT.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (listings[tokenId].active) revert AlreadyListed();

        listings[tokenId] = AgentListing({
            tokenId: tokenId,
            owner: msg.sender,
            pricePerHire: pricePerHire,
            active: true
        });
        listedTokenIds.push(tokenId);

        emit AgentListed(tokenId, msg.sender, pricePerHire);
    }

    function delistAgent(uint256 tokenId) external {
        if (agentNFT.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (!listings[tokenId].active) revert NotListed();

        listings[tokenId].active = false;
        emit AgentDelisted(tokenId);
    }

    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        if (agentNFT.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (!listings[tokenId].active) revert NotListed();

        uint256 oldPrice = listings[tokenId].pricePerHire;
        listings[tokenId].pricePerHire = newPrice;
        emit PriceUpdated(tokenId, oldPrice, newPrice);
    }

    // ---------------------------------------------------------------
    //  Hire Function
    // ---------------------------------------------------------------

    function hireAgent(uint256 tokenId) external payable nonReentrant {
        AgentListing storage listing = listings[tokenId];
        if (!listing.active) revert ListingNotActive();

        address currentOwner = agentNFT.ownerOf(tokenId);

        // === OWNER BYPASS: Owner uses their own agent for free ===
        if (msg.sender == currentOwner) {
            emit AgentUsedByOwner(tokenId, currentOwner);
            return;
        }

        // === PAYMENT FLOW ===
        if (msg.value < listing.pricePerHire) revert InsufficientPayment();

        uint256 platformFee = (msg.value * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 ownerPayment = msg.value - platformFee;

        (bool ownerSuccess,) = payable(currentOwner).call{value: ownerPayment}("");
        if (!ownerSuccess) revert TransferFailed();

        if (platformFee > 0) {
            (bool feeSuccess,) = payable(platformWallet).call{value: platformFee}("");
            if (!feeSuccess) revert TransferFailed();
        }

        totalFeesCollected += platformFee;

        // === ERC-7857: Authorize the hirer ===
        bytes memory permissions = abi.encode(block.timestamp, uint256(1));
        agentNFT.authorizeUsage(tokenId, msg.sender, permissions);

        emit AgentHired(tokenId, msg.sender, msg.value, ownerPayment, platformFee);
    }

    // ---------------------------------------------------------------
    //  View Functions
    // ---------------------------------------------------------------

    function getListing(uint256 tokenId) external view returns (AgentListing memory) {
        return listings[tokenId];
    }

    function getListedAgents() external view returns (AgentListing[] memory) {
        uint256 activeCount;
        for (uint256 i; i < listedTokenIds.length; ++i) {
            if (listings[listedTokenIds[i]].active) ++activeCount;
        }

        AgentListing[] memory result = new AgentListing[](activeCount);
        uint256 idx;
        for (uint256 i; i < listedTokenIds.length; ++i) {
            if (listings[listedTokenIds[i]].active) {
                result[idx++] = listings[listedTokenIds[i]];
            }
        }
        return result;
    }

    function getPlatformStats()
        external
        view
        returns (uint256 _totalFeesCollected, address _platformWallet, uint256 _feePercentageBPS)
    {
        return (totalFeesCollected, platformWallet, PLATFORM_FEE_BPS);
    }

    // ---------------------------------------------------------------
    //  Admin
    // ---------------------------------------------------------------

    function setPlatformWallet(address _newWallet) external onlyOwner {
        if (_newWallet == address(0)) revert InvalidPlatformWallet();
        address old = platformWallet;
        platformWallet = _newWallet;
        emit PlatformWalletUpdated(old, _newWallet);
    }
}
