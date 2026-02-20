import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import AgentNFTv2Abi from '@/abi/AgentNFTv2.json';

export function useAgentData(tokenId: number) {
  // AgentNFTv2.getAgentData returns (name, description, capabilities, pricePerCall)
  const { data, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESSES.AgentNFT as `0x${string}`,
    abi: AgentNFTv2Abi,
    functionName: 'getAgentData',
    args: [BigInt(tokenId)],
    chainId: 16602,
  });

  const { data: tokenURI } = useReadContract({
    address: CONTRACT_ADDRESSES.AgentNFT as `0x${string}`,
    abi: AgentNFTv2Abi,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
    chainId: 16602,
  });

  const { data: metadataHash } = useReadContract({
    address: CONTRACT_ADDRESSES.AgentNFT as `0x${string}`,
    abi: AgentNFTv2Abi,
    functionName: 'getMetadataHash',
    args: [BigInt(tokenId)],
    chainId: 16602,
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESSES.AgentNFT as `0x${string}`,
    abi: AgentNFTv2Abi,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
    chainId: 16602,
  });

  const agentData = data
    ? {
        name: (data as any)[0] as string,
        description: (data as any)[1] as string,
        capabilities: JSON.parse(
          ((data as any)[2] as string) || '[]',
        ),
        pricePerCall: (data as any)[3] as bigint,
        priceDisplay: Number((data as any)[3]) / 1e18,
      }
    : null;

  return {
    agentData,
    tokenURI: tokenURI as string | undefined,
    metadataHash: metadataHash as string | undefined,
    owner: owner as string | undefined,
    isLoading,
    isError,
  };
}

export function useIsAuthorized(tokenId: number, userAddress?: string) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.AgentNFT as `0x${string}`,
    abi: AgentNFTv2Abi,
    functionName: 'isAuthorized',
    args: [BigInt(tokenId), userAddress as `0x${string}`],
    chainId: 16602,
    query: { enabled: !!userAddress },
  });

  return (data as boolean) ?? false;
}
