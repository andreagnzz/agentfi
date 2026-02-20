// Upload SVG images + metadata JSONs to 0G Storage
// Run: node upload-to-0g.js
// Falls back to computing root hashes only if on-chain tx fails

import dotenv from "dotenv";
import { ZgFile, Indexer } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const EVM_RPC = "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC = "https://indexer-storage-testnet-turbo.0g.ai";

const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("Missing PRIVATE_KEY in .env");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(EVM_RPC);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const indexer = new Indexer(INDEXER_RPC);

const FILES = [
  "images/agent-0-portfolio.svg",
  "images/agent-1-yield.svg",
  "images/agent-2-risk.svg",
  "metadata/agent-0-portfolio-analyzer.json",
  "metadata/agent-1-yield-optimizer.json",
  "metadata/agent-2-risk-scorer.json",
];

async function uploadFile(filePath) {
  const absPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(absPath)) {
    console.log(`  Skipping ${filePath} — not found`);
    return { filePath, rootHash: null, error: "not found" };
  }

  console.log(`\n  Uploading: ${filePath}`);
  const file = await ZgFile.fromFilePath(absPath);

  const [tree, treeErr] = await file.merkleTree();
  if (treeErr) {
    await file.close();
    throw new Error(`Merkle tree error: ${treeErr}`);
  }
  const rootHash = tree.rootHash();
  console.log(`   Root hash: ${rootHash}`);

  let tx = null;
  try {
    const [txResult, uploadErr] = await indexer.upload(file, EVM_RPC, signer);
    if (uploadErr) {
      console.log(`   Upload tx failed (testnet issue): keeping root hash only`);
    } else {
      tx = txResult;
      console.log(`   TX: ${tx}`);
    }
  } catch (err) {
    console.log(`   Upload tx failed: ${err.message}`);
    console.log(`   Keeping root hash for reference`);
  }

  await file.close();
  return { filePath, rootHash, tx };
}

async function main() {
  console.log("===================================================");
  console.log("  AgentFi v2 - 0G Storage Upload (Images + Metadata)");
  console.log("===================================================");

  const walletAddress = await signer.getAddress();
  const balance = await provider.getBalance(walletAddress);
  console.log(`\nWallet:  ${walletAddress}`);
  console.log(`Balance: ${ethers.formatEther(balance)} A0GI`);

  const results = {};
  for (const file of FILES) {
    try {
      const result = await uploadFile(file);
      results[file] = { rootHash: result.rootHash, tx: result.tx };
    } catch (err) {
      console.error(`   FAILED: ${err.message}`);
      results[file] = { error: err.message };
    }
  }

  const outputPath = path.resolve(__dirname, "upload-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
