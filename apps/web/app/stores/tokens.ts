import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Token, CryptoToken, FiatToken } from "~/utils/tokens";
import {
	ALL_TOKENS,
	findTokenById,
	findTokenBySymbol,
	findTokenByAddress,
	getCryptoTokens,
	getFiatTokens,
} from "~/utils/tokens";
import { SUPPORTED_CHAINS } from "~/utils/reown-config";

export interface TokenStore {
	// State
	selectedFromToken: Token | null;
	selectedToToken: Token | null;
	favoriteTokens: string[]; // token IDs
	exchangeRates: Record<string, number>; // fiat currency rates
	tokenBalances: Record<string, string>; // token balances by token ID

	// Getters (computed)
	allTokens: Token[];
	cryptoTokens: CryptoToken[];
	fiatTokens: FiatToken[];
	baseChainTokens: Token[];

	// Actions
	setFromToken: (token: Token | null) => void;
	setToToken: (token: Token | null) => void;
	swapTokens: () => void;
	addToFavorites: (tokenId: string) => void;
	removeFromFavorites: (tokenId: string) => void;
	updateExchangeRate: (currency: string, rate: number) => void;
	updateTokenBalance: (tokenId: string, balance: string) => void;
	getTokenById: (tokenId: string) => Token | undefined;
	getTokenBySymbol: (symbol: string, chainId?: number) => Token | undefined;
	getTokenByAddress: (
		address: string,
		chainId: number,
	) => CryptoToken | undefined;
	getFiatRate: (currency: string) => number;
	getTokenBalance: (tokenId: string) => string;
	isTokenFavorite: (tokenId: string) => boolean;
}

export const useTokenStore = defineStore("tokens", (): TokenStore => {
	// State
	const selectedFromToken = ref<Token | null>(null);
	const selectedToToken = ref<Token | null>(null);
	const favoriteTokens = ref<string[]>([]);
	const exchangeRates = ref<Record<string, number>>({
		NGN: 1650, // Default NGN to USD rate
		KES: 130, // Default KES to USD rate
	});
	const tokenBalances = ref<Record<string, string>>({});

	// Getters (computed)
	const allTokens = computed(() => ALL_TOKENS);
	const cryptoTokens = computed(() => getCryptoTokens());
	const fiatTokens = computed(() => getFiatTokens());
	const baseChainTokens = computed(() =>
		ALL_TOKENS.filter((token) => token.chainId === SUPPORTED_CHAINS.BASE),
	);

	// Actions
	const setFromToken = (token: Token | null) => {
		selectedFromToken.value = token;
	};

	const setToToken = (token: Token | null) => {
		selectedToToken.value = token;
	};

	const swapTokens = () => {
		const temp = selectedFromToken.value;
		selectedFromToken.value = selectedToToken.value;
		selectedToToken.value = temp;
	};

	const addToFavorites = (tokenId: string) => {
		if (!favoriteTokens.value.includes(tokenId)) {
			favoriteTokens.value.push(tokenId);
			// Persist to localStorage
			if (import.meta.client) {
				localStorage.setItem(
					"tokenFavorites",
					JSON.stringify(favoriteTokens.value),
				);
			}
		}
	};

	const removeFromFavorites = (tokenId: string) => {
		const index = favoriteTokens.value.indexOf(tokenId);
		if (index > -1) {
			favoriteTokens.value.splice(index, 1);
			// Persist to localStorage
			if (import.meta.client) {
				localStorage.setItem(
					"tokenFavorites",
					JSON.stringify(favoriteTokens.value),
				);
			}
		}
	};

	const updateExchangeRate = (currency: string, rate: number) => {
		exchangeRates.value[currency] = rate;
	};

	const updateTokenBalance = (tokenId: string, balance: string) => {
		tokenBalances.value[tokenId] = balance;
	};

	const getTokenById = (tokenId: string) => {
		return findTokenById(tokenId);
	};

	const getTokenBySymbol = (symbol: string, chainId?: number) => {
		return findTokenBySymbol(symbol, chainId);
	};

	const getTokenByAddress = (address: string, chainId: number) => {
		return findTokenByAddress(address, chainId);
	};

	const getFiatRate = (currency: string) => {
		return exchangeRates.value[currency] || 1;
	};

	const getTokenBalance = (tokenId: string) => {
		return tokenBalances.value[tokenId] || "0";
	};

	const isTokenFavorite = (tokenId: string) => {
		return favoriteTokens.value.includes(tokenId);
	};

	// Initialize favorites from localStorage on client
	if (import.meta.client) {
		const stored = localStorage.getItem("tokenFavorites");
		if (stored) {
			try {
				favoriteTokens.value = JSON.parse(stored);
			} catch (e) {
				console.warn("Failed to parse stored token favorites");
			}
		}
	}

	// Set default tokens
	if (!selectedFromToken.value) {
		selectedFromToken.value = findTokenBySymbol("USDC") || null;
	}
	if (!selectedToToken.value) {
		selectedToToken.value = findTokenBySymbol("NGN") || null;
	}

	return {
		// State
		selectedFromToken,
		selectedToToken,
		favoriteTokens,
		exchangeRates,
		tokenBalances,

		// Getters
		allTokens,
		cryptoTokens,
		fiatTokens,
		baseChainTokens,

		// Actions
		setFromToken,
		setToToken,
		swapTokens,
		addToFavorites,
		removeFromFavorites,
		updateExchangeRate,
		updateTokenBalance,
		getTokenById,
		getTokenBySymbol,
		getTokenByAddress,
		getFiatRate,
		getTokenBalance,
		isTokenFavorite,
	};
});
