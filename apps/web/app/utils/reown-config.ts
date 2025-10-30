import { base, type AppKitNetwork } from "@reown/appkit/networks";

export const chains: [AppKitNetwork, ...AppKitNetwork[]] = [base];

export const SUPPORTED_CHAINS = {
	BASE: base.id,
} as const;

export type SUPPORTED_CHAINS =
	(typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];

export const CHAIN_METADATA: Record<
	SUPPORTED_CHAINS,
	{ name: string; logo: string; nativeCurrency: string }
> = {
	[SUPPORTED_CHAINS.BASE]: {
		name: "Base",
		logo: "/chains/base.svg",
		nativeCurrency: "ETH",
	},
};
export function getChainName(chainId: SUPPORTED_CHAINS): string {
	return CHAIN_METADATA[chainId]?.name || `Chain ${chainId}`;
}

export function getChainLogo(chainId: SUPPORTED_CHAINS): string {
	return CHAIN_METADATA[chainId]?.logo;
}
