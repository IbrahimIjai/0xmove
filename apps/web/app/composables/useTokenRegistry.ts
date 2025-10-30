import type { CryptoToken, FiatToken } from "~/utils/tokens";
import type { SUPPORTED_CHAINS } from "~/utils/reown-config";

/**
 * Composable for easily adding and managing tokens and chains
 * This provides a standardized way to extend the platform
 */
export const useTokenRegistry = () => {
	/**
	 * Create a new crypto token configuration
	 * @example
	 * const newToken = createCryptoToken({
	 *   symbol: "WETH",
	 *   name: "Wrapped Ether",
	 *   address: "0x4200000000000000000000000000000000000006",
	 *   decimals: 18,
	 *   logoURI: "/tokens/weth.png",
	 *   coingeckoId: "weth"
	 * });
	 */
	const createCryptoToken = (config: {
		symbol: string;
		name: string;
		address: `0x${string}`;
		decimals: number;
		logoURI: string;
		chainId?: SUPPORTED_CHAINS;
		coingeckoId?: string;
	}): CryptoToken => {
		const {
			symbol,
			name,
			address,
			decimals,
			logoURI,
			chainId = 8453,
			coingeckoId,
		} = config;

		return {
			id: `${symbol}:${chainId}`,
			type: "crypto",
			symbol,
			name,
			address,
			decimals,
			logoURI,
			chainId,
			coingeckoId,
		};
	};

	/**
	 * Create a new fiat token configuration
	 * @example
	 * const newFiat = createFiatToken({
	 *   symbol: "USD",
	 *   name: "US Dollar",
	 *   countryCode: "US",
	 *   logoURI: "/tokens/usd.png"
	 * });
	 */
	const createFiatToken = (config: {
		symbol: string;
		name: string;
		countryCode: string;
		logoURI: string;
		chainId?: SUPPORTED_CHAINS;
		exchangeRate?: number;
	}): FiatToken => {
		const {
			symbol,
			name,
			countryCode,
			logoURI,
			chainId = 8453,
			exchangeRate,
		} = config;

		return {
			id: `${symbol}:fiat`,
			type: "fiat",
			symbol,
			name,
			address: "fiat",
			decimals: "fiat",
			logoURI,
			chainId,
			countryCode,
			exchangeRate,
		};
	};

	/**
	 * Validate token configuration
	 */
	const validateToken = (token: CryptoToken | FiatToken): boolean => {
		// Basic validation
		if (!token.id || !token.symbol || !token.name || !token.logoURI) {
			return false;
		}

		// Type-specific validation
		if (token.type === "crypto") {
			return !!(
				token.address &&
				token.decimals &&
				typeof token.decimals === "number"
			);
		}

		if (token.type === "fiat") {
			return !!(token.countryCode && token.decimals === "fiat");
		}

		return false;
	};

	/**
	 * Helper to get token image URL with fallback
	 */
	const getTokenImageUrl = (token: { logoURI: string; symbol: string }) => {
		// If logoURI starts with /, it's a local asset
		if (token.logoURI.startsWith("/")) {
			return token.logoURI;
		}

		// If it's a full URL, use it directly
		if (token.logoURI.startsWith("http")) {
			return token.logoURI;
		}

		// Fallback to local asset based on symbol
		return `/tokens/${token.symbol.toLowerCase()}.png`;
	};

	/**
	 * Format token amount with proper decimals
	 */
	const formatTokenAmount = (
		amount: string | number,
		token: { decimals: number | "fiat"; symbol: string },
		options: {
			showSymbol?: boolean;
			precision?: number;
			locale?: string;
		} = {},
	) => {
		const { showSymbol = true, precision, locale = "en-US" } = options;

		const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

		if (token.decimals === "fiat") {
			// Fiat formatting
			const formatted = new Intl.NumberFormat(locale, {
				minimumFractionDigits: 2,
				maximumFractionDigits: precision || 2,
			}).format(numAmount);

			return showSymbol ? `${formatted} ${token.symbol}` : formatted;
		} else {
			// Crypto formatting
			const decimals = precision || (numAmount < 1 ? 6 : 4);
			const formatted = new Intl.NumberFormat(locale, {
				minimumFractionDigits: 0,
				maximumFractionDigits: decimals,
			}).format(numAmount);

			return showSymbol ? `${formatted} ${token.symbol}` : formatted;
		}
	};

	/**
	 * Generate contract interaction helpers for a token
	 */
	const getTokenContractHelpers = (token: CryptoToken) => {
		return {
			// ERC20 standard functions
			transfer: {
				functionName: "transfer",
				abi: [
					{
						inputs: [
							{ name: "to", type: "address" },
							{ name: "amount", type: "uint256" },
						],
						name: "transfer",
						outputs: [{ name: "", type: "bool" }],
						stateMutability: "nonpayable",
						type: "function",
					},
				] as const,
			},
			balanceOf: {
				functionName: "balanceOf",
				abi: [
					{
						inputs: [{ name: "account", type: "address" }],
						name: "balanceOf",
						outputs: [{ name: "", type: "uint256" }],
						stateMutability: "view",
						type: "function",
					},
				] as const,
			},
			approve: {
				functionName: "approve",
				abi: [
					{
						inputs: [
							{ name: "spender", type: "address" },
							{ name: "amount", type: "uint256" },
						],
						name: "approve",
						outputs: [{ name: "", type: "bool" }],
						stateMutability: "nonpayable",
						type: "function",
					},
				] as const,
			},
		};
	};

	return {
		createCryptoToken,
		createFiatToken,
		validateToken,
		getTokenImageUrl,
		formatTokenAmount,
		getTokenContractHelpers,
	};
};
