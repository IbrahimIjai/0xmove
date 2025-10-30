import { defineStore } from "pinia";
import { computed, ref, type Ref, type ComputedRef } from "vue";
import {
	SUPPORTED_CHAINS,
	CHAIN_METADATA,
	getChainName,
	getChainLogo,
	type SUPPORTED_CHAINS as SupportedChainType,
} from "~/utils/reown-config";

export interface ChainInfo {
	id: SupportedChainType;
	name: string;
	logo: string;
	nativeCurrency: string;
	blockExplorer?: string;
	rpcUrl?: string;
}

export interface ChainStore {
	// State (reactive refs)
	currentChainId: Ref<SupportedChainType>;
	connectionStatus: Ref<"connected" | "connecting" | "disconnected">;

	// Getters (computed refs)
	supportedChains: ComputedRef<ChainInfo[]>;
	currentChain: ComputedRef<ChainInfo | null>;
	isBaseChain: ComputedRef<boolean>;

	// Actions
	setCurrentChain: (chainId: SupportedChainType) => void;
	setConnectionStatus: (
		status: "connected" | "connecting" | "disconnected",
	) => void;
	getChainInfo: (chainId: SupportedChainType) => ChainInfo | undefined;
	isChainSupported: (chainId: number) => boolean;
}

export const useChainStore = defineStore("chains", (): ChainStore => {
	// State
	const currentChainId = ref<SupportedChainType>(SUPPORTED_CHAINS.BASE);
	const connectionStatus = ref<"connected" | "connecting" | "disconnected">(
		"disconnected",
	);

	// Getters
	const supportedChains = computed((): ChainInfo[] => {
		return Object.entries(SUPPORTED_CHAINS).map(([key, chainId]) => ({
			id: chainId,
			name: getChainName(chainId),
			logo: getChainLogo(chainId),
			nativeCurrency: CHAIN_METADATA[chainId]?.nativeCurrency || "ETH",
			blockExplorer: getBlockExplorerUrl(chainId),
			rpcUrl: getRpcUrl(chainId),
		}));
	});

	const currentChain = computed((): ChainInfo | null => {
		return (
			supportedChains.value.find(
				(chain) => chain.id === currentChainId.value,
			) || null
		);
	});

	const isBaseChain = computed(() => {
		return currentChainId.value === SUPPORTED_CHAINS.BASE;
	});

	// Actions
	const setCurrentChain = (chainId: SupportedChainType) => {
		currentChainId.value = chainId;
	};

	const setConnectionStatus = (
		status: "connected" | "connecting" | "disconnected",
	) => {
		connectionStatus.value = status;
	};

	const getChainInfo = (chainId: SupportedChainType): ChainInfo | undefined => {
		return supportedChains.value.find((chain) => chain.id === chainId);
	};

	const isChainSupported = (chainId: number): boolean => {
		return Object.values(SUPPORTED_CHAINS).includes(
			chainId as SupportedChainType,
		);
	};

	return {
		// State
		currentChainId,
		connectionStatus,

		// Getters
		supportedChains,
		currentChain,
		isBaseChain,

		// Actions
		setCurrentChain,
		setConnectionStatus,
		getChainInfo,
		isChainSupported,
	};
});

// Helper functions
function getBlockExplorerUrl(chainId: SupportedChainType): string {
	switch (chainId) {
		case SUPPORTED_CHAINS.BASE:
			return "https://basescan.org";
		default:
			return "";
	}
}

function getRpcUrl(chainId: SupportedChainType): string {
	switch (chainId) {
		case SUPPORTED_CHAINS.BASE:
			return "https://mainnet.base.org";
		default:
			return "";
	}
}
