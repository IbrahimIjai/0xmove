import { SUPPORTED_CHAINS } from "~/utils/reown-config";

// Base interfaces for extensibility
interface BaseToken {
	id: string;
	name: string;
	symbol: string;
	logoURI: string;
	chainId: SUPPORTED_CHAINS;
}

interface CryptoToken extends BaseToken {
	type: "crypto";
	decimals: number;
	address: `0x${string}`;
	coingeckoId?: string;
}

interface FiatToken extends BaseToken {
	type: "fiat";
	decimals: "fiat";
	address: "fiat";
	countryCode: string;
	exchangeRate?: number; // Optional for dynamic rates
}

type Token = CryptoToken | FiatToken;

// Token registry for easy management
interface TokenRegistry {
	crypto: Record<string, Omit<CryptoToken, "id" | "chainId">>;
	fiat: Record<string, Omit<FiatToken, "id" | "chainId">>;
}

// Actual token addresses for Base chain
const BASE_TOKEN_ADDRESSES = {
	USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Real Base USDC address
} as const;

// Token registry with all token metadata
const TOKEN_REGISTRY: TokenRegistry = {
	crypto: {
		USDC: {
			name: "USD Coin",
			symbol: "USDC",
			decimals: 6,
			address: BASE_TOKEN_ADDRESSES.USDC,
			logoURI: "/tokens/usdc.png",
			type: "crypto",
			coingeckoId: "usd-coin",
		},
	},
	fiat: {
		NGN: {
			name: "Nigerian Naira",
			symbol: "NGN",
			decimals: "fiat",
			address: "fiat",
			logoURI: "/tokens/nigerian.svg",
			type: "fiat",
			countryCode: "NG",
		},
		KES: {
			name: "Kenyan Shilling",
			symbol: "KES",
			decimals: "fiat",
			address: "fiat",
			logoURI: "/tokens/kenya.svg",
			type: "fiat",
			countryCode: "KE",
		},
	},
};

// Generate all supported tokens
export const generateTokens = (): Token[] => {
	const tokens: Token[] = [];
	const baseChainId = SUPPORTED_CHAINS.BASE;

	// Add crypto tokens for Base chain
	Object.entries(TOKEN_REGISTRY.crypto).forEach(([symbol, tokenData]) => {
		tokens.push({
			...tokenData,
			id: `${symbol}:${baseChainId}`,
			chainId: baseChainId,
		});
	});

	// Add fiat tokens (they exist conceptually on Base chain)
	Object.entries(TOKEN_REGISTRY.fiat).forEach(([symbol, tokenData]) => {
		tokens.push({
			...tokenData,
			id: `${symbol}:fiat`,
			chainId: baseChainId,
		});
	});

	return tokens;
};

// Export all tokens
export const ALL_TOKENS = generateTokens();

// Utility functions with better performance
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

export const getTokensByType = <T extends Token["type"]>(
	type: T,
): Array<T extends "crypto" ? CryptoToken : FiatToken> => {
	return ALL_TOKENS.filter((token) => token.type === type) as any;
};

export const getCryptoTokens = (): CryptoToken[] => getTokensByType("crypto");
export const getFiatTokens = (): FiatToken[] => getTokensByType("fiat");

// Helper to add new tokens easily
export const createToken = {
	crypto: (
		symbol: string,
		data: Omit<CryptoToken, "id" | "chainId" | "symbol" | "type">,
		chainId: SUPPORTED_CHAINS = SUPPORTED_CHAINS.BASE,
	): CryptoToken => ({
		...data,
		id: `${symbol}:${chainId}`,
		symbol,
		type: "crypto",
		chainId,
	}),

	fiat: (
		symbol: string,
		data: Omit<FiatToken, "id" | "chainId" | "symbol" | "type">,
		chainId: SUPPORTED_CHAINS = SUPPORTED_CHAINS.BASE,
	): FiatToken => ({
		...data,
		id: `${symbol}:fiat`,
		symbol,
		type: "fiat",
		chainId,
	}),
};

// Type guards
export const isCryptoToken = (token: Token): token is CryptoToken => {
	return token.type === "crypto";
};

export const isFiatToken = (token: Token): token is FiatToken => {
	return token.type === "fiat";
};

// Export types
export type { BaseToken, CryptoToken, FiatToken, Token, TokenRegistry };
