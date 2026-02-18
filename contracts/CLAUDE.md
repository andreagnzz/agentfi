# AgentFi — Contracts Context (Person A — Chain Dev)

## Your Role
You own everything in `contracts/`.
You are responsible for: writing, testing, deploying, and exporting ABIs.
Person B depends on your ABIs — export them after every single deploy.

## Tech Stack
- **Foundry** (forge, cast, anvil)
- **Solidity ^0.8.24**
- **OpenZeppelin Contracts v5** (`forge install OpenZeppelin/openzeppelin-contracts`)
- **Vitest** for integration tests that import ABIs from TypeScript side

## Contract Architecture

### `contracts/src/AgentNFT.sol` — deployed on 0G Chain
ERC-7857 iNFT implementation. Each token represents one AI agent.
```solidity
struct AgentMetadata {
    string modelHash;       // IPFS hash of the AI model
    string systemPrompt;    // Encrypted system prompt
    string capabilities;    // JSON string of agent capabilities
    uint256 pricePerCall;   // Price in wei per execution
}
mapping(uint256 => AgentMetadata) public agentData;
```
Key functions: `mint()`, `updateMetadata()`, `getAgentData(uint256)`
Inherits: `ERC721`, `ERC721URIStorage`, `Ownable`

### `contracts/src/AgentMarketplace.sol` — deployed on 0G Chain
Listing and hiring logic. Calls AgentNFT to verify ownership.
```solidity
struct AgentListing {
    uint256 tokenId;
    address owner;
    uint256 pricePerHire;
    bool active;
}
```
Key functions: `listAgent()`, `hireAgent()`, `getListedAgents()`
Key events: `AgentListed`, `AgentHired`, `AgentDelisted`

### `contracts/src/AgentPayment.sol` — deployed on ADI Chain
Payment settlement with compliance whitelist.
```solidity
mapping(address => bool) public verifiedUsers; // admin-controlled KYC mock
```
Key functions: `pay()`, `addToWhitelist()`, `removeFromWhitelist()`, `isVerified()`
Key events: `PaymentSent`, `UserVerified`
Uses: `ReentrancyGuard` on `pay()`

## Foundry Commands
```bash
forge build                                          # compile all
forge test -vvv                                      # run all tests verbose
forge test --match-test testHireAgent -vvv           # single test
forge script script/Deploy0G.s.sol \
  --rpc-url $OG_RPC --broadcast --verify            # deploy to 0G
forge script script/DeployADI.s.sol \
  --rpc-url $ADI_RPC --broadcast                    # deploy to ADI
cast call $OG_NFT_ADDRESS "getAgentData(uint256)" 1 # read state
cast wallet import deployer --interactive            # import key safely
```

## Deploy Checklist (run in this exact order)
```
[ ] forge build            → zero errors
[ ] forge test -vvv        → zero failures
[ ] forge script script/Deploy0G.s.sol --rpc-url $OG_RPC --broadcast
[ ] forge script script/DeployADI.s.sol --rpc-url $ADI_RPC --broadcast
[ ] Update .env with new addresses (OG_NFT_ADDRESS, OG_MARKETPLACE_ADDRESS, ADI_PAYMENT_ADDRESS)
[ ] Export ABIs:
      cp out/AgentNFT.sol/AgentNFT.json ../frontend/src/abi/
      cp out/AgentMarketplace.sol/AgentMarketplace.json ../frontend/src/abi/
      cp out/AgentPayment.sol/AgentPayment.json ../frontend/src/abi/
[ ] git commit -m "chore: export ABIs after deploy to 0G + ADI"
[ ] Notify Person B: "ABIs updated, contracts at <address>"
```

## Solidity Rules
- All `public` and `external` functions must have NatSpec `@notice` and `@param`
- No floating pragma — always `^0.8.24`
- **Custom errors over require strings** (gas savings):
  ```solidity
  // ✅ correct
  error Unauthorized();
  if (msg.sender != owner) revert Unauthorized();

  // ❌ wrong
  require(msg.sender == owner, "Unauthorized");
  ```
- Never use `tx.origin` for auth — always `msg.sender`
- All monetary values in **wei** — no floating point anywhere
- Emit events for **every state-changing function**
- Use `ReentrancyGuard` on all `payable` functions that transfer ETH

## Test Rules
- Test file: `AgentNFT.t.sol` mirrors `AgentNFT.sol`
- Every `public`/`external` function needs at minimum:
  - 1 happy path test
  - 1 unauthorized caller test
  - 1 edge case test (zero amount, already-listed, etc.)
- Use `vm.expectRevert()` to test custom errors
- Use `vm.prank(address)` to simulate different callers

## Key Addresses (fill during hackathon)
```
OG_NFT_ADDRESS=
OG_MARKETPLACE_ADDRESS=
ADI_PAYMENT_ADDRESS=
```
