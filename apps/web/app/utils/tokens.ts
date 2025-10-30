import { SUPPORTED_CHAINS } from "./reown-config";

// Token interfaces directly in this file to avoid import issues
export interface BaseToken {
	id: string;
	name: string;
	symbol: string;
	logoURI: string;
	chainId: SUPPORTED_CHAINS;
}

export interface CryptoToken extends BaseToken {
	type: "crypto";
	decimals: number;
	address: `0x${string}`;
	coingeckoId?: string;
}

export interface FiatToken extends BaseToken {
	type: "fiat";
	decimals: "fiat";
	address: "fiat";
	countryCode: string;
	exchangeRate?: number;
}

export type Token = CryptoToken | FiatToken;

// Actual token addresses for Base chain
const BASE_TOKEN_ADDRESSES = {
	USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
} as const;

// Generate all supported tokens
const generateTokens = (): Token[] => {
	const tokens: Token[] = [];
	const baseChainId = SUPPORTED_CHAINS.BASE;

	// Add USDC token for Base chain
	tokens.push({
		id: `USDC:${baseChainId}`,
		type: "crypto",
		symbol: "USDC",
		name: "USD Coin",
		address: BASE_TOKEN_ADDRESSES.USDC,
		decimals: 6,
		logoURI: "/tokens/usdc.png",
		chainId: baseChainId,
		coingeckoId: "usd-coin",
	});

	// Add fiat tokens
	tokens.push({
		id: "NGN:fiat",
		type: "fiat",
		symbol: "NGN",
		name: "Nigerian Naira",
		address: "fiat",
		decimals: "fiat",
		logoURI: "/tokens/nigerian.svg",
		chainId: baseChainId,
		countryCode: "NG",
	});

	tokens.push({
		id: "KES:fiat",
		type: "fiat",
		symbol: "KES",
		name: "Kenyan Shilling",
		address: "fiat",
		decimals: "fiat",
		logoURI: "/tokens/kenya.svg",
		chainId: baseChainId,
		countryCode: "KE",
	});

	return tokens;
};

export const ALL_TOKENS = generateTokens();

// Utility functions
export const findTokenById = (tokenId: string): Token | undefined => {
	return ALL_TOKENS.find((token) => token.id === tokenId);
};

export const findTokenBySymbol = (
	symbol: string,
	chainId?: number,
): Token | undefined => {
	if (chainId) {
		return ALL_TOKENS.find(
			(token) => token.symbol === symbol && token.chainId === chainId,
		);
	}
	return ALL_TOKENS.find((token) => token.symbol === symbol);
};

export const findTokenByAddress = (
	address: string,
	chainId: number,
): CryptoToken | undefined => {
	const normalizedAddress = address.toLowerCase();
	return ALL_TOKENS.find(
		(token): token is CryptoToken =>
			token.type === "crypto" &&
			token.address.toLowerCase() === normalizedAddress &&
			token.chainId === chainId,
	) as CryptoToken | undefined;
};

export const getCryptoTokens = (): CryptoToken[] => {
	return ALL_TOKENS.filter(
		(token): token is CryptoToken => token.type === "crypto",
	);
};

export const getFiatTokens = (): FiatToken[] => {
	return ALL_TOKENS.filter(
		(token): token is FiatToken => token.type === "fiat",
	);
};

// Type guards
export const isCryptoToken = (token: Token): token is CryptoToken => {
	return token.type === "crypto";
};

export const isFiatToken = (token: Token): token is FiatToken => {
	return token.type === "fiat";
};

// Legacy compatibility
export const findToken = (address: string, chainId: number) => {
	console.warn("findToken is deprecated, use findTokenByAddress instead");
	return findTokenByAddress(address, chainId);
};

export const getTokensBySymbol = (symbol: string) => {
	console.warn(
		"getTokensBySymbol is deprecated, use findTokenBySymbol instead",
	);
	return ALL_TOKENS.filter((token) => token.symbol === symbol);
};
