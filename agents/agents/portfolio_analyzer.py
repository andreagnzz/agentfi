"""Portfolio Analyzer Agent — uses real market data from CoinGecko."""
import json

from anthropic import AsyncAnthropic
from agents.base_agent import BaseAgent
from agents.defi_data import get_token_prices, get_wallet_balances
import logging

logger = logging.getLogger(__name__)

# Map common token names to CoinGecko IDs
TOKEN_MAP = {
    "ETH": "ethereum", "BTC": "bitcoin", "USDC": "usd-coin",
    "USDT": "tether", "HBAR": "hedera-hashgraph", "WBTC": "wrapped-bitcoin",
    "LINK": "chainlink", "AAVE": "aave", "UNI": "uniswap", "SUSHI": "sushiswap",
}


class PortfolioAnalyzerAgent(BaseAgent):
    name: str = "portfolio_analyzer"
    description: str = "Analyzes DeFi portfolio composition using real-time market data"
    price_per_call: float = 0.5

    async def execute(self, query: str, wallet_address: str | None = None) -> str:
        try:
            # 1. Fetch real prices
            prices = await get_token_prices()

            # 2. Build price context
            price_context = "\n".join([
                f"- {name}: ${data.get('usd', 'N/A')} (24h: {data.get('usd_24h_change', 0):.2f}%)"
                for name, data in prices.items()
            ])

            # 2b. Fetch wallet balances if address provided
            wallet_context = ""
            if wallet_address:
                balances = await get_wallet_balances(wallet_address)
                wallet_context = f"""

CONNECTED WALLET: {wallet_address}
WALLET DATA: {json.dumps(balances, indent=2)}
The user is connected with this wallet. Reference their address and real balance in your analysis.
If they ask about "my portfolio", use their actual on-chain data."""

            # 3. Ask Claude to analyze with real data
            system_prompt = f"""You are a DeFi portfolio analyzer with access to REAL-TIME market data.

CURRENT MARKET PRICES (live from CoinGecko):
{price_context}
{wallet_context}

Your job:
1. Parse the user's portfolio allocation from their query
2. Calculate USD values using the REAL prices above
3. Assess concentration risk (>50% in one asset = high risk)
4. Calculate 24h portfolio change using real 24h change data
5. Identify any red flags (high concentration, stablecoin-heavy, volatile mix)

ALWAYS use the real prices above in your calculations. Show your math.
Format your response as a structured analysis with sections:
- Portfolio Breakdown (with real USD values)
- 24h Performance
- Concentration Risk Assessment
- Key Observations"""

            client = AsyncAnthropic()
            response = await client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=600,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": query},
                ],
            )
            return response.content[0].text or ""
        except Exception as e:
            logger.error(f"Portfolio analyzer error: {e}")
            return f"Portfolio analysis error: {str(e)}"
