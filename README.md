# AgentFi

**The banking system for autonomous AI agents.**

A multi-chain marketplace where AI agents are minted as iNFTs (ERC-7857), hire each other autonomously via x402, and earn reputation through on-chain execution proofs on Hedera.

---

## Architecture

```
agentfi/
├── contracts/        Foundry — Solidity contracts (0G Chain, ADI Chain, KiteAI)
├── contracts-adi/    Hardhat — ADI compliance contracts (zkSync-compatible)
├── frontend/         Next.js 14 — marketplace UI + agent interaction
├── agents/           Python FastAPI — AI agent backend + Hedera integration
├── scripts/          Deployment & utility scripts
└── docs/             Documentation
```

### Chain Overview

| Chain | Role | Chain ID | RPC |
|-------|------|----------|-----|
| 0G Galileo | iNFT marketplace + DeFAI | 16602 | `https://evmrpc-testnet.0g.ai` |
| ADI Testnet | Compliance payments | 99999 | `https://rpc.ab.testnet.adifoundation.ai/` |
| KiteAI | x402 agent services | 2368 | KiteAI testnet |
| Hedera Testnet | Agent orchestration + AFC token | — | Mirror Node API |

### Deployed Contracts

| Contract | Chain | Address |
|----------|-------|---------|
| AgentNFTv2 (ERC-7857) | 0G Galileo | `0xDCD2e9B068913fcF0C80ff5DA070B243Df091EFE` |
| AgentMarketplacev2 | 0G Galileo | `0x0eC3981a544C3dC6983C523860E13c2B7a66cd6e` |
| AgentRegistry | 0G Galileo | `0xa259E6D0a4F740AD8879EA433Ba56B1C5A9e1a5B` |
| ADIAgentPayments | ADI Testnet | `0x56FEa0d531faC7a870F0cdC5dBFB57a6C6182cDd` |
| AgentFiPaymaster | ADI Testnet | `0xBeD159217F43711c32fB6D57e4b203aEbC46B74A` |
| KiteAgentFiService | KiteAI | `0x10E3399025E930da7B4d4bE71181157CCee4E882` |

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **pnpm** (`npm install -g pnpm`)
- **Python** >= 3.11
- **Foundry** (optional, only for contract development)
- **MetaMask** or compatible wallet

### 1. Clone & Install

```bash
git clone https://github.com/andreagnzz/agentfi.git
cd agentfi

# Frontend dependencies
cd frontend && pnpm install && cd ..

# Backend dependencies
cd agents && pip install -r requirements.txt && cd ..
```

### 2. Configure Environment

```bash
cp agents/.env.example agents/.env
```

Open `agents/.env` and fill in the two secrets:

```env
ANTHROPIC_API_KEY=sk-ant-...       # Get from https://console.anthropic.com
HEDERA_PRIVATE_KEY=302e0201...     # Ask the team for the shared key
```

Everything else is pre-filled with the correct values (contract addresses, Hedera accounts, topic IDs).

> **Note:** The root `.env` is only needed for contract deployment (Foundry). The frontend works without any `.env` — all values have hardcoded fallbacks.

### 3. Start the Backend

```bash
cd agents
python -m uvicorn api:app --reload --port 8000
```

Verify it's running:
```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

### 4. Start the Frontend

```bash
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Connect Wallet

1. Open the app, select **Permissionless** mode
2. Connect MetaMask
3. Add 0G Galileo testnet (Chain ID 16602, RPC `https://evmrpc-testnet.0g.ai`)
4. Get testnet OG from the faucet if needed

---

## Backend API

The FastAPI backend runs on port 8000. Key endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/agents` | List all registered agents |
| `POST` | `/agents/{agent_id}/execute` | Execute a single agent |
| `POST` | `/orchestrate` | Chain all 3 agents on one query |
| `POST` | `/agents/register` | Register a new dynamic agent |
| `GET` | `/agents/token-map` | Token ID to agent ID mapping |
| `GET` | `/hedera/status` | Hedera integration status |
| `GET` | `/hedera/accounts` | Agent Hedera account mapping |
| `GET` | `/hedera/afc-balances` | AFC token balances (dynamic agents) |

### Static Agents (pre-registered)

| Token ID | Agent | Specialty |
|----------|-------|-----------|
| 0 | Portfolio Analyzer | DeFi portfolio analysis, allocation, concentration risk |
| 1 | Yield Optimizer | Yield farming opportunities, APY comparison |
| 2 | Risk Scorer | Risk assessment across volatility, IL, smart contract risk |

### Dynamic Agents (user-created)

Token IDs 3+ are created via the frontend dashboard. They:
- Get minted as ERC-7857 iNFTs on 0G Chain
- Auto-register on the backend via `POST /agents/register`
- Use a custom system prompt defined at creation
- Persist across restarts in `agents/dynamic_agents.json`

---

## Hedera Integration

Each agent has its own Hedera account and HCS-10 topics:

| Agent | Account (AFC) | Inbound Topic | Outbound Topic |
|-------|---------------|---------------|----------------|
| Portfolio Analyzer | `0.0.7997780` | `0.0.7977803` | `0.0.7977802` |
| Yield Optimizer | `0.0.7997785` | `0.0.7977813` | `0.0.7977812` |
| Risk Scorer | `0.0.7997786` | `0.0.7977822` | `0.0.7977821` |

### AFC Token (AgentFi Credits)

- Token ID: `0.0.7977623`
- Decimals: 2
- [View on HashScan](https://hashscan.io/testnet/token/0.0.7977623)

Agents earn 1.00 AFC per execution. Cross-agent collaboration splits payments 70/20/10 (owner/agent/platform).

---

## Quick Smoke Test

```bash
# 1. Backend running?
curl http://localhost:8000/health

# 2. Hedera enabled?
curl http://localhost:8000/hedera/status

# 3. Agents registered?
curl http://localhost:8000/agents

# 4. Open browser
open http://localhost:3000
```

---

## Project Structure Details

### Frontend (`frontend/`)

```
src/
├── app/
│   ├── page.tsx                 Mode selector (Permissionless / Compliant)
│   ├── marketplace/page.tsx     Agent marketplace grid
│   ├── agent/[id]/page.tsx      Agent detail + hire + execute
│   ├── dashboard/page.tsx       Owner dashboard (earnings, activity)
│   ├── dashboard/create/        Mint new agent (ERC-7857 iNFT)
│   └── my-agents/page.tsx       Owned iNFTs viewer
├── hooks/
│   ├── useHireAgent.ts          On-chain hire transaction
│   ├── useExecuteAgent.ts       Backend execution call
│   ├── useAgentReputation.ts    AFC balance from Hedera Mirror Node
│   ├── useMintAgent.ts          Mint new agent iNFT
│   ├── useLiveActivity.ts       Real on-chain event feed
│   └── useEarnings.ts           Owner earnings from marketplace
├── context/
│   └── AppModeContext.tsx       Permissionless vs Compliant mode
└── config/
    ├── chains.ts                0G + ADI chain definitions
    └── contracts.ts             Contract addresses
```

### Agents (`agents/`)

```
agents/
├── api.py                       FastAPI server (port 8000)
├── agent_factory.py             LangChain agent factory
├── dynamic_registry.py          Dynamic agent persistence
├── agents/
│   ├── orchestrator.py          Multi-agent orchestration
│   ├── portfolio_analyzer.py    Static agent: portfolio analysis
│   ├── yield_optimizer.py       Static agent: yield optimization
│   ├── risk_scorer.py           Static agent: risk scoring
│   └── dynamic_agent.py         User-created agents (Anthropic direct)
├── hedera/
│   ├── attestation.py           HCS-10 execution attestation
│   ├── afc_rewards.py           AFC token reward transfers
│   ├── hts_service.py           Hedera Token Service
│   ├── hcs_messaging.py         Hedera Consensus Service
│   ├── init_afc_token.py        One-time: create accounts + fund AFC
│   └── config.py                Hedera client singleton
├── x402/
│   ├── cross_agent_service.py   Agent-to-agent collaboration
│   └── afc_payment_service.py   AFC payment splits
└── tools/
    └── defi_tools.py            Live DeFi data tools (CoinGecko, etc.)
```

### Contracts (`contracts/`)

```
src/
├── AgentNFTv2.sol               ERC-7857 iNFT with intelligence hashing
├── AgentMarketplacev2.sol       Marketplace with 2.5% platform fee
├── AgentRegistry.sol            On-chain agent registry
└── KiteAgentFiService.sol       x402 service contract
```

---

## Troubleshooting

### `web3` import hangs (Windows/MINGW)

The `web3` Python library can hang on import in MINGW environments. The backend probes it with a timeout and falls back gracefully. If you see the backend hanging at startup, wait ~8 seconds for the probe to timeout.

**On Mac this is not an issue.**

### Backend can't connect to Hedera

Check `HEDERA_ENABLED=true` in `agents/.env`. If Hedera is down, the backend falls back to mock services — the app still works, proofs just show `mock-xxx`.

### Frontend shows 0 agents

Make sure the backend is running on port 8000. The frontend fetches agent data from `http://localhost:8000`.

### MetaMask wrong chain

The app needs 0G Galileo (Chain ID 16602). Add it manually:
- Network Name: 0G Galileo Testnet
- RPC URL: `https://evmrpc-testnet.0g.ai`
- Chain ID: `16602`
- Currency Symbol: OG

---

## License

MIT — see [LICENSE](LICENSE).
