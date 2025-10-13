import { base } from "viem/chains";

export const SUPPORTED_CHAINS = [base] as const;
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(
	(c) => c.id,
) as ReadonlyArray<number>;
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

export const CHAIN_BY_ID: Record<SupportedChainId, typeof base> =
	Object.fromEntries(SUPPORTED_CHAINS.map((c) => [c.id, c])) as any;
