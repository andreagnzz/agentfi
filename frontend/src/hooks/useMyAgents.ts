import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import AgentMarketplacev2Abi from "@/abi/AgentMarketplacev2.json";

export function useMyAgents() {
  const { address } = useAccount();

  // Get all listed agents, then filter by owner === connected wallet
  const { data: listings, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESSES.AgentMarketplace as `0x${string}`,
    abi: AgentMarketplacev2Abi,
    functionName: "getListedAgents",
    chainId: 16602,
  });

  const myAgents =
    listings && address
      ? (listings as any[])
          .filter((l: any) => {
            const owner = (l.owner ?? l[1]) as string;
            return owner.toLowerCase() === address.toLowerCase();
          })
          .map((l: any) => ({
            tokenId: Number(l.tokenId ?? l[0]),
            pricePerHire: l.pricePerHire ?? l[2],
            active: l.active ?? l[3],
          }))
      : [];

  return { myAgents, isConnected: !!address, address, isLoading, isError };
}
