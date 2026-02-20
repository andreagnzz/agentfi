// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IERC7857 - Intelligent NFT Standard for AI Agents
 * @notice Standard interface for NFTs representing AI agents with private metadata
 * @dev Designed to be used alongside ERC-721 for encrypted metadata and usage authorization
 * See: https://eips.ethereum.org/EIPS/eip-7857
 */
interface IERC7857 {
    /// @notice Emitted when agent metadata hash is updated
    event MetadataUpdated(uint256 indexed tokenId, bytes32 newHash);

    /// @notice Emitted when an address is authorized to use an agent
    event UsageAuthorized(uint256 indexed tokenId, address indexed executor);

    /// @notice Emitted when usage authorization is revoked
    event UsageRevoked(uint256 indexed tokenId, address indexed executor);

    /// @notice Emitted when agent is transferred with metadata re-encryption
    event AgentTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    /// @notice Emitted when agent is cloned
    event AgentCloned(uint256 indexed tokenId, uint256 newTokenId, address indexed to);

    /// @notice Transfer agent with metadata re-encryption
    /// @param from Current owner
    /// @param to New owner
    /// @param tokenId Agent token ID
    /// @param sealedKey Encrypted decryption key for new owner
    /// @param proof Proof of valid re-encryption (simplified for hackathon)
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external;

    /// @notice Clone agent to create a copy with same intelligence
    /// @param to Recipient of the cloned agent
    /// @param tokenId Original agent to clone
    /// @param sealedKey Encrypted key for clone recipient
    /// @param proof Proof of valid cloning authorization
    /// @return newTokenId The token ID of the cloned agent
    function clone(
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external returns (uint256 newTokenId);

    /// @notice Authorize an address to use (execute) an agent without revealing its data
    /// @param tokenId Agent token ID
    /// @param executor Address to authorize
    /// @param permissions Encoded permissions (e.g., number of uses, expiry)
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    ) external;

    /// @notice Revoke usage authorization
    /// @param tokenId Agent token ID
    /// @param executor Address to revoke
    function revokeUsage(uint256 tokenId, address executor) external;

    /// @notice Check if an address is authorized to use an agent
    /// @param tokenId Agent token ID
    /// @param executor Address to check
    /// @return True if authorized
    function isAuthorized(uint256 tokenId, address executor) external view returns (bool);

    /// @notice Get the metadata hash for an agent
    /// @param tokenId Agent token ID
    /// @return The SHA256 hash of the agent's encrypted metadata
    function getMetadataHash(uint256 tokenId) external view returns (bytes32);

    /// @notice Get the encrypted metadata URI (pointer to 0G Storage)
    /// @param tokenId Agent token ID
    /// @return The URI pointing to encrypted metadata
    function getEncryptedURI(uint256 tokenId) external view returns (string memory);
}
