import type { SupportedChainId } from "./chains";

export const USDC: Partial<Record<SupportedChainId, `0x${string}`>> = {
	// [8453]: '0x...', // base mainnet
};

export const USDT: Partial<Record<SupportedChainId, `0x${string}`>> = {
	// [8453]: '0x...',
};

export type TokenAddresses = {
	USDC: Partial<Record<SupportedChainId, `0x${string}`>>;
	USDT: Partial<Record<SupportedChainId, `0x${string}`>>;
};
