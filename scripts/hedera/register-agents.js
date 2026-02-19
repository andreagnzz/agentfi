/**
 * One-time script: Register AgentFi agents on Hedera via HOL Standards SDK.
 * Creates HCS-10 inbound/outbound topics for each agent.
 *
 * Usage:  cd scripts/hedera && pnpm run register
 * Requires HEDERA_ACCOUNT_ID + HEDERA_PRIVATE_KEY (or ACCOUNT_ID + PRIVATE_KEY) in .env
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import {
  HCS10Client,
  AgentBuilder,
  AIAgentCapability,
} from '@hashgraphonline/standards-sdk';

// Load .env — try agents/.env first (has working Hedera creds), fall back to root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../agents/.env') });
config({ path: resolve(__dirname, '../../.env') });

const AGENTS = [
  {
    name: 'AgentFi Portfolio Analyzer',
    description:
      'DeFi portfolio analysis agent — analyzes token holdings, calculates allocation percentages, identifies concentration risks. Part of the AgentFi marketplace.',
    capabilities: [
      AIAgentCapability.TEXT_GENERATION,
      AIAgentCapability.KNOWLEDGE_RETRIEVAL,
      AIAgentCapability.DATA_INTEGRATION,
    ],
    model: 'gpt-4o-mini',
  },
  {
    name: 'AgentFi Yield Optimizer',
    description:
      'DeFi yield optimization agent — finds best yield farming opportunities across protocols, suggests optimal allocation strategies. Part of the AgentFi marketplace.',
    capabilities: [
      AIAgentCapability.TEXT_GENERATION,
      AIAgentCapability.KNOWLEDGE_RETRIEVAL,
      AIAgentCapability.MARKET_INTELLIGENCE,
    ],
    model: 'gpt-4o-mini',
  },
  {
    name: 'AgentFi Risk Scorer',
    description:
      'DeFi risk assessment agent — evaluates portfolio risk across volatility, impermanent loss, smart contract risk, and liquidity dimensions. Part of the AgentFi marketplace.',
    capabilities: [
      AIAgentCapability.TEXT_GENERATION,
      AIAgentCapability.KNOWLEDGE_RETRIEVAL,
      AIAgentCapability.TRANSACTION_ANALYTICS,
    ],
    model: 'gpt-4o-mini',
  },
];

async function main() {
  const accountId = process.env.HEDERA_ACCOUNT_ID || process.env.ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY || process.env.PRIVATE_KEY;

  if (!accountId || !privateKey) {
    console.error('Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env');
    process.exit(1);
  }

  console.log(`Operator account: ${accountId}`);
  console.log(`Network: testnet\n`);

  const client = new HCS10Client({
    network: 'testnet',
    operatorId: accountId,
    operatorPrivateKey: privateKey,
    logLevel: 'info',
  });

  const results = [];

  for (const agentDef of AGENTS) {
    console.log(`\nRegistering: ${agentDef.name}...`);

    const builder = new AgentBuilder()
      .setName(agentDef.name)
      .setDescription(agentDef.description)
      .setAgentType('autonomous')
      .setCapabilities(agentDef.capabilities)
      .setModel(agentDef.model)
      .setNetwork('testnet');

    try {
      const result = await client.createAndRegisterAgent(builder);

      if (!result.success) {
        console.error(`FAILED ${agentDef.name}: ${result.error}`);
        results.push({ name: agentDef.name, error: result.error });
        continue;
      }

      const meta = result.metadata || {};
      const entry = {
        name: agentDef.name,
        accountId: meta.accountId || 'N/A',
        inboundTopicId: meta.inboundTopicId || 'N/A',
        outboundTopicId: meta.outboundTopicId || 'N/A',
        profileTopicId: meta.profileTopicId || 'N/A',
        operatorId: meta.operatorId || 'N/A',
      };
      results.push(entry);

      console.log(`OK ${entry.name}`);
      console.log(`   Account:  ${entry.accountId}`);
      console.log(`   Inbound:  ${entry.inboundTopicId}`);
      console.log(`   Outbound: ${entry.outboundTopicId}`);
      console.log(`   Profile:  ${entry.profileTopicId}`);
    } catch (err) {
      console.error(`ERROR ${agentDef.name}: ${err.message}`);
      results.push({ name: agentDef.name, error: err.message });
    }
  }

  // Save full results to JSON
  const outPath = resolve(__dirname, 'registration-results.json');
  writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n');
  console.log(`\nResults saved to ${outPath}`);

  // Print env vars for easy copy
  console.log('\nAdd to .env:');
  const agentKeys = ['portfolio_analyzer', 'yield_optimizer', 'risk_scorer'];
  results.forEach((r, i) => {
    if (!r.error) {
      const key = agentKeys[i].toUpperCase();
      console.log(`HEDERA_${key}_ACCOUNT=${r.accountId}`);
      console.log(`HEDERA_${key}_INBOUND_TOPIC=${r.inboundTopicId}`);
      console.log(`HEDERA_${key}_OUTBOUND_TOPIC=${r.outboundTopicId}`);
    }
  });

  // Print HashScan links
  console.log('\nHashScan links:');
  results.forEach((r) => {
    if (!r.error) {
      console.log(`  ${r.name}:`);
      console.log(`    Inbound:  https://hashscan.io/testnet/topic/${r.inboundTopicId}`);
      console.log(`    Outbound: https://hashscan.io/testnet/topic/${r.outboundTopicId}`);
    }
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
