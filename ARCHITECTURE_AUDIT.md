# AgentFi Architecture Audit Report

> Audit date: 2026-02-19 | Audited by: Claude (code-level inspection, not aspirational)

---

## Q1: What does owning an iNFT mean?

### On-chain reality

The `AgentNFT` contract ([contracts/src/AgentNFT.sol](contracts/src/AgentNFT.sol)) is a standard ERC-721 (`ERC721 + ERC721URIStorage + Ownable`) with an extra on-chain struct per token:

```solidity
struct AgentMetadata {
    string modelHash;      // e.g. "claude-3-haiku"
    string systemPrompt;   // stored on-chain (!)
    string capabilities;   // JSON string: '["portfolio","defi"]'
    uint256 pricePerCall;  // in wei
}
```

**Minting is restricted to the contract owner** (`onlyOwner` on `mint()` at line 82). Only the deployer wallet can create new agents. The mint function accepts a `to` address, a `uri` string, and the metadata struct.

**Ownership gives two concrete rights:**

1. **Update metadata** — `updateMetadata()` (line 94) checks `ownerOf(tokenId) == msg.sender`. Only the NFT holder can change model hash, prompt, capabilities, or price.
2. **List on marketplace** — `AgentMarketplace.listAgent()` checks `agentNFT.ownerOf(tokenId) != msg.sender` and reverts with `NotTokenOwner()` if you don't own it.

**Ownership does NOT gate execution.** Anyone can call the backend API at `/agents/{agent_id}/execute` — there is zero ownership verification before the agent runs. The backend has no concept of token ownership.

### What tokenId 0 gives you today

- The right to list/delist it on the marketplace
- The right to update its on-chain metadata
- The right to receive ETH payments when someone hires it via the marketplace
- **It does NOT prevent others from using the agent directly via the API**

---

## Q2: How does hiring work?

### Step-by-step flow (from user's perspective)

1. User visits `/agent/[id]` in the frontend
2. Frontend reads `AgentMetadata` from `AgentNFT.getAgentData(tokenId)` via wagmi ([frontend/src/hooks/useAgentData.ts](frontend/src/hooks/useAgentData.ts))
3. Frontend reads `AgentListing` from `AgentMarketplace.getListing(tokenId)` to get the owner address
4. User types a query and clicks **"Hire & Execute"**
5. Frontend calls `AgentMarketplace.hireAgent(tokenId)` with `msg.value = listing.pricePerHire` ([frontend/src/hooks/useHireAgent.ts](frontend/src/hooks/useHireAgent.ts))
6. **On-chain:** Contract checks listing is active, payment >= price, then **sends all ETH directly to `listing.owner`** via low-level `.call{value: msg.value}("")` ([AgentMarketplace.sol:128](contracts/src/AgentMarketplace.sol#L128))
7. The NFT **does NOT transfer**. `hireAgent()` emits `AgentHired(tokenId, hirer, price)` and that's it.
8. After on-chain tx confirms (`txSuccess` state), the frontend calls the backend API: `POST /agents/{agent_id}/execute` with the query ([frontend/src/app/agent/[id]/page.tsx:87-90](frontend/src/app/agent/%5Bid%5D/page.tsx#L87))
9. Backend runs the LangChain agent, optionally submits Hedera attestation, returns result
10. Frontend displays markdown result + Hedera proof links

### Key findings

| Question | Answer |
|---|---|
| Does the NFT transfer? | **No.** Owner keeps it. This is pay-per-use, not a purchase. |
| Does user B pay ETH? | **Yes.** The listing's `pricePerHire` in OG (0G native token). |
| Where does payment go? | **100% to `listing.owner`.** No platform fee, no contract escrow. |
| Pay-per-use or unlimited? | **Pay-per-use.** Each "Hire & Execute" is a separate on-chain tx. |
| Event emitted? | `AgentHired(tokenId, hirer, price)` |
| Is hiring required for execution? | **Only in the frontend flow.** The API has no payment gate. |

---

## Q3: Money flow

### Primary flow (0G Chain — what actually runs today)

```
User clicks "Hire & Execute"
    │
    ▼
AgentMarketplace.hireAgent(tokenId)    ← msg.value = pricePerHire
    │
    ▼
listing.owner.call{value: msg.value}   ← 100% to owner, 0% platform fee
    │
    ▼
Event: AgentHired(tokenId, hirer, price)
    │
    ▼
Frontend detects tx success → calls backend API
    │
    ▼
Backend executes agent (NO payment verification)
```

**There is no platform fee.** The `AgentMarketplace` contract takes 0% — everything goes to the listing owner. There is no fee variable, no admin withdrawal, no split logic.

**Payment is NOT verified before execution.** The backend API at `/agents/{agent_id}/execute` ([agents/api.py:90-117](agents/api.py#L90)) accepts any POST request with a `query` field. It does not check:
- Whether a `hireAgent` tx exists
- Whether the caller paid
- Whether the caller is authenticated at all

The payment enforcement is **frontend-only**: the React code won't call the API until `txSuccess` is true. But anyone with `curl` can skip this.

### AgentPayment contract (ADI Chain — separate flow)

The `AgentPayment` contract ([contracts/src/AgentPayment.sol](contracts/src/AgentPayment.sol)) is deployed on ADI Chain (chain ID 99999) and implements a **compliance-gated payment** system:

- Admin-controlled whitelist (`verifiedUsers` mapping)
- Both sender and recipient must be whitelisted to call `pay()`
- Forwards ETH from sender to recipient with an `agentTokenId` reference
- Tracks `totalPaymentsProcessed` counter
- Emits `PaymentSent(sender, recipient, amount, agentTokenId)`

**This contract is NOT connected to the marketplace or backend in any way.** It exists as a standalone compliance demo for the ADI bounty. The frontend imports its address from `deployments.json` but never calls it in the current hire flow.

### MockPaymentProvider (backend)

The orchestrator uses `MockPaymentProvider` ([agents/agents/orchestrator.py:50](agents/agents/orchestrator.py#L50)) which **logs payment events but does not execute real transactions**. Payment is non-blocking — if it fails, the agent still runs (line 99-100).

---

## Q4: Metadata & visuals

### On-chain metadata (per token)

Stored in `AgentNFT.agentData[tokenId]`:

| Field | Type | Example value |
|---|---|---|
| `modelHash` | string | `"claude-3-haiku"` |
| `systemPrompt` | string | Full system prompt text (stored on-chain!) |
| `capabilities` | string | `'["portfolio analysis","risk scoring"]'` (JSON string) |
| `pricePerCall` | uint256 | Wei value (e.g. `100000000000000` = 0.0001 OG) |

### tokenURI

The `tokenURI()` function (line 118) delegates to OpenZeppelin's `ERC721URIStorage`. The URI is set at mint time via the `uri` parameter. **We don't know what URI was passed during deployment** without checking the seed script, but the function is standard — it could point to IPFS, 0G Storage, or a regular URL.

### No image field

There is **no image field** anywhere in the on-chain metadata struct. The `AgentMetadata` struct has `modelHash`, `systemPrompt`, `capabilities`, and `pricePerCall` — no `image`, `avatar`, or `thumbnail`.

### What the frontend displays

- **Agent detail page** ([frontend/src/app/agent/[id]/page.tsx](frontend/src/app/agent/%5Bid%5D/page.tsx)): Shows hardcoded `AGENT_NAMES` (line 20-24), category badge, model hash, price, capabilities parsed from JSON, and owner address. **No image/avatar is rendered.**
- **AgentCard component** ([frontend/src/components/AgentCard.tsx](frontend/src/components/AgentCard.tsx)): Shows name, description, category badge, capabilities tags, and price. **No image element.**
- Agent names are **hardcoded** in the frontend: `{0: "Portfolio Analyzer", 1: "Yield Optimizer", 2: "Risk Scorer"}`. They don't come from the contract.

### ERC-7857 compliance

The contract declares itself as "ERC-7857 iNFT" in the NatSpec comment (line 9), but it **does not implement any ERC-7857 specific interface**. It's a standard ERC-721 + custom struct. There is no `supportsInterface` override for an ERC-7857 interface ID, no encrypted data field, no intelligent behavior on-chain. The "iNFT" designation is aspirational.

---

## Q5: Hedera's role

### 1. Agent Identity — HCS-10 Registration

Each agent has a registered Hedera identity from [scripts/hedera/registration-results.json](scripts/hedera/registration-results.json):

| Agent | Account ID | Inbound Topic | Outbound Topic | Profile Topic |
|---|---|---|---|---|
| Portfolio Analyzer | 0.0.7977799 | 0.0.7977803 | 0.0.7977802 | 0.0.7977808 |
| Yield Optimizer | 0.0.7977811 | 0.0.7977813 | 0.0.7977812 | 0.0.7977817 |
| Risk Scorer | 0.0.7977819 | 0.0.7977822 | 0.0.7977821 | 0.0.7977825 |

These are real Hedera testnet accounts with HCS topics, registered via the OpenClaw HCS-10 protocol.

### 2. Attestation Layer — Proof of Execution

After each agent execution, the backend submits an attestation to Hedera ([agents/hedera/attestation.py](agents/hedera/attestation.py)):

```python
result_hash = hashlib.sha256(result.encode()).hexdigest()
attestation_data = f"execution_proof|agent={agent_name}|hash={result_hash}"
hcs.submit_message(inbound_topic, agent_name, attestation_data)
```

Messages follow the HCS-10 protocol format ([agents/hedera/hcs_messaging.py](agents/hedera/hcs_messaging.py)):
```json
{"p": "hcs-10", "op": "message", "data": "...", "operator_id": "...", "m": "AgentFi:..."}
```

This is **non-blocking** — if it fails, the agent result is still returned. The tx ID is sent back to the frontend and displayed as a clickable Hashscan link.

### 3. Hedera Agent Kit — LangChain Tools

The `agent_factory.py` ([agents/agent_factory.py](agents/agent_factory.py)) loads Hedera Agent Kit tools (filtered to 11 relevant ones like `get_hbar_balance_query_tool`, `transfer_hbar_tool`, `submit_topic_message_tool`, etc.) and gives them to the LangGraph ReAct agent alongside custom DeFi tools. This means the AI agent can **read Hedera balances, query topics, and transfer HBAR** autonomously.

### 4. HTS Token Service (AFC Token)

Real and mock implementations exist for creating/transferring HTS fungible tokens ([agents/hedera/hts_service.py](agents/hedera/hts_service.py)). The token is called "AgentFi Credits" (AFC). **This is not actively used in the current flow** — the `service_factory.py` exposes it but no endpoint calls it.

### 5. Mock Fallback

When `HEDERA_ENABLED=false`, all Hedera services fall back to mock implementations ([agents/hedera/mock_hedera.py](agents/hedera/mock_hedera.py)) that log actions and return fake transaction IDs.

### What breaks if Hedera is removed?

- Attestation proofs disappear (no more HCS tx links in the frontend)
- Hedera Agent Kit tools are removed from the LangGraph agent (no HBAR balance queries, no HCS operations)
- `/hedera/status`, `/hedera/agents/{id}/topics`, `/hedera/registration` endpoints return errors
- Core agent execution still works — Hedera is always non-blocking

---

## Q6: Real vs stub

### Working end-to-end

| Feature | Status | Details |
|---|---|---|
| AgentNFT (0G Chain) | **REAL** | Deployed at `0x10e3...e882` on chain 16602. Metadata readable from frontend. |
| AgentMarketplace (0G Chain) | **REAL** | Deployed at `0x1a9e...4246`. Hire tx sends real OG tokens to owner. |
| Frontend hire flow | **REAL** | Wallet signs tx, pays OG, waits for confirmation, then calls API. |
| Agent execution (backend) | **REAL** | LangGraph ReAct agent with Claude Haiku + real tools (CoinGecko, DeFi Llama, SaucerSwap, Bonzo, Hedera Mirror Node). |
| Hedera attestation (HCS) | **REAL** (when enabled) | Submits real HCS-10 messages to testnet topics. |
| Hedera agent registration | **REAL** | 3 agents registered with accounts + topics on testnet. |
| DeFi data tools | **REAL** | Live API calls to CoinGecko, DeFi Llama, SaucerSwap, Hedera Mirror Node. All have hardcoded fallbacks. |

### Stubs / Mocks

| Feature | Status | Details |
|---|---|---|
| Payment verification | **STUB** | Backend does not verify on-chain payment before executing agent. Anyone can call API directly. |
| MockPaymentProvider | **STUB** | Orchestrator logs payments, never charges. Non-blocking. |
| AgentPayment (ADI Chain) | **DEPLOYED BUT UNUSED** | Contract exists on chain 99999 but nothing in frontend or backend calls it. |
| Platform fee | **MISSING** | No fee mechanism exists. 100% goes to owner. |
| ERC-7857 iNFT | **LABEL ONLY** | Standard ERC-721 with custom struct. No ERC-7857 interface. |
| NFT images/visuals | **MISSING** | No image field on-chain, no visual rendering in frontend. Agent names are hardcoded. |
| AFC token (HTS) | **CODE EXISTS, UNUSED** | Token creation and transfer code works but nothing triggers it. |
| Auth/API keys | **MISSING** | Backend API is completely open — no auth, no rate limiting, no API keys. |

### Can someone use agents without paying?

**Yes.** Three ways:

1. **Direct API call:** `curl -X POST http://localhost:8000/agents/portfolio_analyzer/execute -d '{"query":"analyze my portfolio"}'` — works with no wallet, no payment, nothing.
2. **Orchestrate endpoint:** `POST /orchestrate` chains all 3 agents — also no payment check.
3. **Skip frontend:** The frontend is the only thing that enforces the hire-then-execute flow.

---

## Architecture Diagram (ASCII)

```
                            AgentFi Architecture — Actual State
                            ====================================

USER (Browser + Wallet)
  │
  ├── 1. Connect wallet (RainbowKit / wagmi)
  │
  ├── 2. Browse marketplace → reads AgentNFT.getAgentData() + Marketplace.getListing()
  │       │                        │
  │       │                    0G Chain (16602)
  │       │                    ┌──────────────────────────────────────┐
  │       │                    │  AgentNFT (0x10e3...e882)            │
  │       │                    │    - ERC-721 + AgentMetadata struct  │
  │       │                    │    - mint() [onlyOwner]              │
  │       │                    │    - updateMetadata() [ownerOnly]    │
  │       │                    │                                      │
  │       │                    │  AgentMarketplace (0x1a9e...4246)    │
  │       │                    │    - listAgent() [NFT owner only]    │
  │       │                    │    - hireAgent() [anyone, pays ETH]  │
  │       │                    │    - 100% payment → listing.owner    │
  │       │                    │    - NO platform fee                 │
  │       │                    │    - NFT does NOT transfer           │
  │       │                    └──────────────────────────────────────┘
  │
  ├── 3. "Hire & Execute" button
  │       │
  │       ├── 3a. hireAgent(tokenId) tx → OG tokens to owner
  │       │
  │       └── 3b. After tx confirms → POST /agents/{id}/execute
  │                   │
  │                   ▼
  │           ┌──────────────────────────────────────────────┐
  │           │  Python Backend (FastAPI :8000)               │
  │           │                                               │
  │           │  /agents/{id}/execute                         │
  │           │    ├── NO payment verification ⚠️              │
  │           │    ├── NO auth / API key ⚠️                    │
  │           │    │                                           │
  │           │    ├── LangGraph ReAct Agent (Claude Haiku)   │
  │           │    │   ├── Custom DeFi Tools:                 │
  │           │    │   │   ├── get_token_prices (CoinGecko)   │
  │           │    │   │   ├── get_wallet_balance (0G RPC)    │
  │           │    │   │   ├── get_hedera_account_balance     │
  │           │    │   │   ├── get_defi_yields (DeFi Llama)   │
  │           │    │   │   ├── get_saucerswap_pools           │
  │           │    │   │   ├── get_bonzo_finance_markets      │
  │           │    │   │   └── compute_portfolio_risk_score   │
  │           │    │   │                                       │
  │           │    │   └── Hedera Agent Kit Tools (filtered):  │
  │           │    │       ├── get_hbar_balance_query_tool     │
  │           │    │       ├── transfer_hbar_tool              │
  │           │    │       ├── submit_topic_message_tool       │
  │           │    │       └── ... (11 tools total)            │
  │           │    │                                           │
  │           │    └── Hedera Attestation (non-blocking):      │
  │           │        ├── SHA256(result) → HCS-10 message     │
  │           │        └── Submit to agent's inbound topic     │
  │           └──────────────────────────────────────────────┘
  │                                    │
  │                                    ▼
  │                    ┌──────────────────────────────┐
  │                    │  Hedera Testnet               │
  │                    │                               │
  │                    │  3 Registered Agents:          │
  │                    │  ├── Portfolio Analyzer        │
  │                    │  │   (0.0.7977799)             │
  │                    │  ├── Yield Optimizer           │
  │                    │  │   (0.0.7977811)             │
  │                    │  └── Risk Scorer               │
  │                    │      (0.0.7977819)             │
  │                    │                               │
  │                    │  Each has:                     │
  │                    │  ├── Inbound topic (open)      │
  │                    │  ├── Outbound topic (keyed)    │
  │                    │  └── Profile topic             │
  │                    │                               │
  │                    │  AFC Token (HTS) — exists      │
  │                    │  but unused in flows           │
  │                    └──────────────────────────────┘
  │
  └── 4. Display result (markdown) + Hedera proof link (Hashscan)


ADI Chain (99999) — ISOLATED, NOT CONNECTED TO ABOVE
┌──────────────────────────────────────┐
│  AgentPayment (0x10e3...e882)        │
│    - Compliance whitelist (mock KYC) │
│    - pay(recipient, agentTokenId)    │
│    - Both parties must be verified   │
│    - NOT called by frontend/backend  │
└──────────────────────────────────────┘


MONEY FLOW:
  User ──[OG tokens]──▶ AgentMarketplace.hireAgent()
                              │
                              └──[100% via .call{value}]──▶ listing.owner
                                    (no platform fee, no escrow)


DATA FLOW:
  CoinGecko ──▶ Agent Tools ──▶ Claude Haiku ──▶ Markdown Result ──▶ Frontend
  DeFi Llama ─┘                                        │
  SaucerSwap ─┘                                        ▼
  Bonzo Finance ┘                              Hedera HCS (attestation)
  Hedera Mirror ┘
```

---

## Summary of Critical Gaps

1. **No payment gate on API** — anyone can execute agents for free by hitting the backend directly
2. **No ERC-7857 implementation** — it's a standard ERC-721 labeled as iNFT
3. **No agent visuals** — no images, avatars, or generated art for agent NFTs
4. **AgentPayment on ADI is orphaned** — deployed but never integrated into any flow
5. **No platform fee** — the marketplace takes 0%, making the business model owner-only
6. **AFC token infrastructure exists but is dormant** — HTS create/transfer code works, nothing uses it
7. **Agent names hardcoded in frontend** — not read from contract metadata
