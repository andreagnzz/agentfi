# AgentFi — Product Requirements Document
ETHDenver 2026 | Feb 18–21 | Team: 2 devs | Target: $48,000

---

## Executive Summary
AgentFi is a multi-chain marketplace where autonomous AI agents can be discovered, owned, hired, and paid. Each agent is an iNFT (ERC-7857) on 0G Chain encapsulating its AI model hash, system prompt, and capabilities. Payments settle on ADI Chain with compliance-native rails. Agent orchestration runs on Hedera via Hedera Agent Kit.

**One-line pitch:** "The banking system for autonomous AI agents."

---

## Problem Statement
AI agents are increasingly capable but lack economic infrastructure to interact autonomously:
- No standard way to represent ownership of an AI agent on-chain
- No compliant way to pay an agent for a specific service cross-border
- No mechanism to transfer an AI agent (model + logic) to a new owner
- No trustless marketplace to discover agents and their pricing

---

## Target Bounties

| Bounty                       | Prize    | Chain      | Key Integration                          |
|------------------------------|----------|------------|------------------------------------------|
| ADI Open Project             | $19,000  | ADI Chain  | Cross-border payments + compliance layer |
| Hedera Killer App (OpenClaw) | $10,000  | Hedera     | Agent orchestration via Agent Kit        |
| 0G Best DeFAI                | $7,000   | 0G Chain   | AI-powered yield optimizer + analyzer    |
| 0G Best iNFT (ERC-7857)      | $7,000   | 0G Chain   | Agents as transferable iNFTs             |
| ETHDenver FUTURLLAMA         | $2,000   | Multi      | AI + frontier tech bonus submission      |
| **TOTAL**                    | **$45,000** |         |                                          |

---

## User Stories

### As a user (agent buyer)
1. I can browse the marketplace and see available AI agents with capabilities and prices.
2. I can connect my wallet, pay in tokens on ADI Chain, and get a result from the hired agent.
3. I can view my hired agent as an iNFT in my wallet and transfer it to another address.

### As a developer (agent creator)
1. I can mint my AI agent as an iNFT with model hash, system prompt, and capabilities on IPFS.
2. I can list my agent on the marketplace with a price-per-hire.
3. I can receive payments automatically when my agent is hired.

---

## Core Demo Flow (what judges will see — 3 min)

```
Step 1  Connect wallet (MetaMask on ADI testnet)
Step 2  Browse marketplace → 3 specialized agents with price + description
Step 3  Click "Hire Agent" → confirm ADI Chain transaction
Step 4  Agent executes (Hedera Agent Kit) → result displayed within 10s
Step 5  Navigate to "My Agents" → see owned iNFT on 0G Chain with metadata
```

---

## Technical Architecture

### Monorepo Structure
```
agentfi/
├── contracts/                        # Person A — Foundry
│   ├── src/
│   │   ├── AgentNFT.sol              # ERC-7857 iNFT on 0G Chain
│   │   ├── AgentMarketplace.sol      # Listing + hire on 0G Chain
│   │   └── AgentPayment.sol          # Payments + compliance on ADI Chain
│   ├── test/
│   ├── script/
│   │   ├── Deploy0G.s.sol
│   │   ├── DeployADI.s.sol
│   │   └── ExportDeployments.s.sol   # generates deployments.json ← SCALABILITY
│   └── foundry.toml
├── frontend/                         # Person B — Next.js 14
│   ├── src/
│   │   ├── app/                      # App Router pages
│   │   ├── components/
│   │   ├── hooks/                    # wagmi hooks
│   │   ├── config/
│   │   │   ├── chains.ts             # chain definitions
│   │   │   └── contracts.ts          # reads from deployments.json ← SCALABILITY
│   │   └── abi/                      # auto-synced by sync-abis.sh ← SCALABILITY
│   └── package.json
├── agents/                           # Person B — Python FastAPI
│   ├── agents/
│   │   ├── base_agent.py             # abstract base class
│   │   ├── portfolio_analyzer.py
│   │   ├── yield_optimizer.py
│   │   ├── risk_scorer.py
│   │   └── orchestrator.py           # composable agent router ← SCALABILITY
│   ├── api.py
│   └── requirements.txt
├── scripts/
│   └── sync-abis.sh                  # ABI auto-sync script ← SCALABILITY
├── deployments.json                  # single source of truth for addresses ← SCALABILITY
├── CLAUDE.md
├── PRD.md
├── .env.example
├── .gitignore
└── pnpm-workspace.yaml
```

### Contract Summary
| Contract              | Chain     | Responsibility                            |
|-----------------------|-----------|-------------------------------------------|
| `AgentNFT.sol`        | 0G Chain  | ERC-7857 iNFT mint, metadata, transfer    |
| `AgentMarketplace.sol`| 0G Chain  | List agents, hire agents, manage listings |
| `AgentPayment.sol`    | ADI Chain | Payment settlement + compliance whitelist |

### Tech Stack
| Layer           | Technology                                      |
|-----------------|-------------------------------------------------|
| Smart Contracts | Foundry, Solidity ^0.8.24, OpenZeppelin v5      |
| Frontend        | Next.js 14 (App Router), TailwindCSS, shadcn/ui |
| Web3 Client     | wagmi v2, viem, RainbowKit                      |
| AI Agents       | Hedera Agent Kit v3, OpenAI API (gpt-4o-mini)  |
| Agent Routing   | Composable orchestrator (LangGraph-style)        |
| Backend API     | FastAPI, Python 3.11+, uvicorn                  |
| Storage         | IPFS via Pinata (agent metadata + model hashes) |
| Package Manager | pnpm                                            |

---

## MVP Success Criteria (Definition of Done)

- [ ] `AgentNFT.sol` deployed on 0G testnet — mint + transfer working
- [ ] `AgentMarketplace.sol` deployed on 0G testnet — list + hire working
- [ ] `AgentPayment.sol` deployed on ADI testnet — payment event firing
- [ ] 3 AI agents running: portfolio_analyzer, yield_optimizer, risk_scorer
- [ ] Composable orchestrator routing queries to the correct agent(s)
- [ ] `sync-abis.sh` running without errors after each deploy
- [ ] `deployments.json` updated and committed after each deploy
- [ ] End-to-end flow: connect wallet → hire → agent executes → result shown
- [ ] 3-minute demo video recorded without crashes
- [ ] All 5 bounty submissions filed before deadline

---

## Scalability Features

### Feature 1 — Automatic ABI Sync Script (`scripts/sync-abis.sh`)

**Problem being solved:**
Manual ABI copy from `contracts/out/` to `frontend/src/abi/` is error-prone.
With 3+ contracts and frequent redeploys, stale ABIs cause silent runtime bugs in wagmi hooks.
Adding a 4th contract means remembering to update 3 different places by hand.

**What it does:**
1. Reads compiled artifacts from `contracts/out/`
2. Extracts only the `abi` field — strips bytecode, metadata, compiler output
3. Writes clean ABI JSON files to `frontend/src/abi/`
4. Validates that every expected contract is present before writing
5. Prints a clear diff summary of what changed

```bash
#!/usr/bin/env bash
# scripts/sync-abis.sh
# Usage: ./scripts/sync-abis.sh
# Run this after every: forge build or forge script deploy

set -e

CONTRACTS=("AgentNFT" "AgentMarketplace" "AgentPayment")
OUT_DIR="contracts/out"
ABI_DIR="frontend/src/abi"

echo "🔄 Syncing ABIs from $OUT_DIR → $ABI_DIR"
echo ""

# Validate all artifacts exist before touching anything
for CONTRACT in "${CONTRACTS[@]}"; do
  SRC="$OUT_DIR/$CONTRACT.sol/$CONTRACT.json"
  if [ ! -f "$SRC" ]; then
    echo "❌  Missing artifact: $SRC"
    echo "    Did you run: forge build?"
    exit 1
  fi
done

# Extract ABI and write to frontend
mkdir -p "$ABI_DIR"
for CONTRACT in "${CONTRACTS[@]}"; do
  SRC="$OUT_DIR/$CONTRACT.sol/$CONTRACT.json"
  DEST="$ABI_DIR/$CONTRACT.json"
  jq '.abi' "$SRC" > "$DEST"
  echo "✅  $CONTRACT.json"
done

echo ""
echo "✅ All ABIs synced to $ABI_DIR"
echo ""
echo "Next steps:"
echo "  git add frontend/src/abi/ deployments.json"
echo "  git commit -m 'chore: sync ABIs after deploy'"
echo "  Notify Person B to pull and restart frontend"
```

**`deployments.json` — single source of truth for all contract addresses:**
```json
{
  "16600": {
    "chainName": "0G Testnet",
    "AgentNFT": "0x...",
    "AgentMarketplace": "0x..."
  },
  "ADI_CHAIN_ID": {
    "chainName": "ADI Testnet",
    "AgentPayment": "0x..."
  }
}
```

**Frontend reads addresses from `deployments.json` — never from `.env` directly:**
```typescript
// frontend/src/config/contracts.ts
import deployments from "../../../deployments.json";

const OG_CHAIN_ID = 16600;

export const CONTRACT_ADDRESSES = {
  AgentNFT:        deployments[OG_CHAIN_ID].AgentNFT        as `0x${string}`,
  AgentMarketplace: deployments[OG_CHAIN_ID].AgentMarketplace as `0x${string}`,
};
```

**Adding a new contract (scalable pattern):**
```bash
# 1. Write the new contract in contracts/src/MyContract.sol
# 2. Add "MyContract" to the CONTRACTS array in sync-abis.sh
# 3. Deploy: forge script script/Deploy.s.sol --broadcast
# 4. Update deployments.json with the new address
# 5. Run: ./scripts/sync-abis.sh
# 6. Import the ABI in frontend: import MyContract from "@/abi/MyContract.json"
# No other file needs to change.
```

**Person A deploy workflow:**
```bash
forge script script/Deploy0G.s.sol --rpc-url $OG_RPC --broadcast
# manually update deployments.json with new addresses
./scripts/sync-abis.sh
git add frontend/src/abi/ deployments.json
git commit -m "chore: sync ABIs + deployments after 0G deploy"
# notify Person B: done, pull and restart dev server
```

---

### Feature 2 — Composable Agent Orchestrator (`agents/orchestrator.py`)

**Problem being solved:**
The current routing is flat — one request maps to one agent with no way to chain results.
A complex query like "analyze my portfolio and recommend a rebalance strategy" requires:
portfolio_analyzer → risk_scorer → yield_optimizer in sequence, where each agent's output
feeds into the next. This is impossible without an orchestration layer.

**Architecture:**
```
User Query: "Analyze my wallet and recommend a low-risk yield strategy"
    │
    ▼
┌──────────────────────────────────────┐
│           Orchestrator               │
│   GPT-4o-mini builds execution plan  │
│   [ step_0: portfolio_analyzer ]     │
│   [ step_1: risk_scorer(step_0) ]    │
│   [ step_2: yield_optimizer(step_1)] │
└──────┬───────────────────────────────┘
       │
       ├─► portfolio_analyzer  ──► "40% ETH, 30% BTC, 30% stablecoins"
       │                                       │
       ├─► risk_scorer ◄─────────────── receives step_0 output
       │   "risk score: 7/10 — high volatility exposure"
       │                  │
       └─► yield_optimizer ◄──────── receives step_1 output
           "Recommend shifting 15% ETH → stablecoin yield pools (APY 8-12%)"
                          │
                          ▼
                    Final result returned to user
```

**`agents/agents/base_agent.py`:**
```python
from abc import ABC, abstractmethod

class BaseAgent(ABC):
    name: str
    description: str
    price_per_call: float  # in HBAR

    @abstractmethod
    async def execute(self, query: str) -> str:
        """Run the agent logic and return a string result."""
        ...
```

**`agents/orchestrator.py`:**
```python
from agents.base_agent import BaseAgent
from agents.portfolio_analyzer import PortfolioAnalyzerAgent
from agents.yield_optimizer import YieldOptimizerAgent
from agents.risk_scorer import RiskScorerAgent
from openai import AsyncOpenAI
import json, logging

logger = logging.getLogger(__name__)

# Registry — add new agents here, nowhere else
AGENT_REGISTRY: dict[str, BaseAgent] = {
    "portfolio_analyzer": PortfolioAnalyzerAgent(),
    "yield_optimizer":    YieldOptimizerAgent(),
    "risk_scorer":        RiskScorerAgent(),
}

ROUTER_PROMPT = """
You are an agent orchestrator. Given a user query, return a JSON execution plan.
Available agents: portfolio_analyzer, yield_optimizer, risk_scorer.

Rules:
- Use only agents that are truly needed for this query
- Use {step_N} to pass the output of step N as input to a later step
- Maximum 4 steps

Return ONLY valid JSON, no markdown, no explanation:
{
  "steps": [
    { "agent": "portfolio_analyzer", "input": "analyze the user portfolio" },
    { "agent": "risk_scorer", "input": "score this portfolio: {step_0}" }
  ]
}
"""

class AgentOrchestrator:
    def __init__(self):
        self.client = AsyncOpenAI()

    async def _plan(self, query: str) -> list[dict]:
        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=300,
            messages=[
                {"role": "system", "content": ROUTER_PROMPT},
                {"role": "user",   "content": query},
            ]
        )
        return json.loads(response.choices[0].message.content)["steps"]

    async def execute(self, query: str) -> str:
        steps = await self._plan(query)
        outputs: list[str] = []

        for i, step in enumerate(steps):
            agent_name  = step["agent"]
            agent_input = step["input"]

            # Inject previous outputs using {step_N} placeholders
            for j, prev in enumerate(outputs):
                agent_input = agent_input.replace(f"{{step_{j}}}", prev)

            agent = AGENT_REGISTRY.get(agent_name)
            if not agent:
                outputs.append(f"[unknown agent: {agent_name}]")
                continue

            logger.info(f"[orchestrator] step {i}: {agent_name}")
            result = await agent.execute(agent_input)
            outputs.append(result)

        return outputs[-1] if outputs else "No result produced."
```

**`agents/api.py` — both endpoints:**
```python
# Single agent (existing — keep for direct hire)
@app.post("/agents/{agent_id}/execute")
async def execute_single(agent_id: str, body: ExecuteRequest):
    agent = AGENT_REGISTRY.get(agent_id)
    if not agent:
        return {"success": False, "data": None, "error": f"Unknown agent: {agent_id}"}
    result = await agent.execute(body.query)
    return {"success": True, "data": result, "error": None}

# Composable orchestrated execution (new)
@app.post("/orchestrate")
async def orchestrate(body: ExecuteRequest):
    orchestrator = AgentOrchestrator()
    result = await orchestrator.execute(body.query)
    return {"success": True, "data": result, "error": None}
```

**Adding a new agent (scalable pattern):**
```python
# 1. Create agents/agents/my_agent.py inheriting BaseAgent
# 2. Implement: name, description, price_per_call, execute()
# 3. Add ONE line to orchestrator.py AGENT_REGISTRY:
AGENT_REGISTRY["my_agent"] = MyAgent()
# 4. The orchestrator automatically discovers, routes, and chains it
# No other file needs to change.
```

---

## Out of Scope (Hackathon)
- Mainnet deployments
- Real KYC / identity verification (whitelist is admin-controlled mock)
- Agent-to-agent autonomous payments (Kite AI / x402 deferred)
- Mobile responsive UI (desktop demo only)
- Canton Network / Daml integration
- QuickNode Streams integration
- wagmi CLI / typechain code generation (sync-abis.sh is sufficient for 4 days)
- Persistent agent memory between sessions

---

## Submission Narrative Per Bounty

### ADI Open Project ($19,000)
**Angle:** "Cross-Border Payment Infrastructure for Autonomous AI Agents"
Focus on: compliance-native payments, whitelist KYC layer, cross-border settlement,
ADI Chain as the financial rail for the agent economy.

### Hedera Killer App ($10,000)
**Angle:** "AgentFi — The Killer App for the Agentic Society on Hedera"
Focus on: Hedera Agent Kit for orchestration, HCS for agent messaging,
OpenClaw framework integration, vision of autonomous agent society.

### 0G Best DeFAI ($7,000)
**Angle:** "AI-Powered Composable DeFi Agents on 0G Chain"
Focus on: composable orchestrator enabling multi-step DeFi analysis,
yield_optimizer chained with risk_scorer, AI-driven financial decisions on 0G.

### 0G Best iNFT ($7,000)
**Angle:** "Transferable AI Agents as iNFTs (ERC-7857)"
Focus on: each agent is a self-contained iNFT, model hash on IPFS,
transfer = full ownership transfer of the AI agent.

### ETHDenver FUTURLLAMA ($2,000)
**Angle:** "AI + DePIN: The Future of Autonomous Agent Economies"
Focus on: frontier vision, composable AI agents as economic actors, multi-chain infrastructure.
