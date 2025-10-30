import { defineStore } from "pinia";
import { computed, ref, type Ref, type ComputedRef } from "vue";
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
	selectedFromToken: Ref<Token | null>;
	selectedToToken: Ref<Token | null>;
	favoriteTokens: Ref<string[]>;
	exchangeRates: Ref<Record<string, number>>;
	tokenBalances: Ref<Record<string, string>>;

	allTokens: ComputedRef<Token[]>;
	cryptoTokens: ComputedRef<CryptoToken[]>;
	fiatTokens: ComputedRef<FiatToken[]>;
	baseChainTokens: ComputedRef<Token[]>;

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
	const selectedFromToken = ref<Token | null>(null);
	const selectedToToken = ref<Token | null>(null);
	const favoriteTokens = ref<string[]>([]);
	const exchangeRates = ref<Record<string, number>>({
		NGN: 1650,
		KES: 130,
	});
	const tokenBalances = ref<Record<string, string>>({});

	const allTokens = computed(() => ALL_TOKENS);
	const cryptoTokens = computed(() => getCryptoTokens());
	const fiatTokens = computed(() => getFiatTokens());
	const baseChainTokens = computed(() =>
		ALL_TOKENS.filter((token) => token.chainId === SUPPORTED_CHAINS.BASE),
	);

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

	if (!selectedFromToken.value) {
		selectedFromToken.value = findTokenBySymbol("USDC") || null;
	}
	if (!selectedToToken.value) {
		selectedToToken.value = findTokenBySymbol("NGN") || null;
	}

	return {
		selectedFromToken,
		selectedToToken,
		favoriteTokens,
		exchangeRates,
		tokenBalances,
		allTokens,
		cryptoTokens,
		fiatTokens,
		baseChainTokens,
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
