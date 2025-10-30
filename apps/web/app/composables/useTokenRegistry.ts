import type { CryptoToken, FiatToken } from "~/utils/tokens";
import type { SUPPORTED_CHAINS } from "~/utils/reown-config";

export const useTokenRegistry = () => {
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

	const validateToken = (token: CryptoToken | FiatToken): boolean => {
		if (!token.id || !token.symbol || !token.name || !token.logoURI) {
			return false;
		}

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

	const getTokenImageUrl = (token: { logoURI: string; symbol: string }) => {
		if (token.logoURI.startsWith("/")) {
			return token.logoURI;
		}

		if (token.logoURI.startsWith("http")) {
			return token.logoURI;
		}

		return `/tokens/${token.symbol.toLowerCase()}.png`;
	};
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
			const formatted = new Intl.NumberFormat(locale, {
				minimumFractionDigits: 2,
				maximumFractionDigits: precision || 2,
			}).format(numAmount);

			return showSymbol ? `${formatted} ${token.symbol}` : formatted;
		} else {
			const decimals = precision || (numAmount < 1 ? 6 : 4);
			const formatted = new Intl.NumberFormat(locale, {
				minimumFractionDigits: 0,
				maximumFractionDigits: decimals,
			}).format(numAmount);

			return showSymbol ? `${formatted} ${token.symbol}` : formatted;
		}
	};

	const getTokenContractHelpers = (token: CryptoToken) => {
		return {
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
