import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { api, type BalancesResponse } from "@/utils/api";
import { useAppKitAccount } from "@reown/appkit/vue";

export function useBalances(chainId?: number) {
	const account = useAppKitAccount();
	const address = computed(
		() => account.value.address as undefined | `0x${string}`,
	);
	const isConnected = computed(() => account.value.isConnected ?? false);

	const query = useQuery<BalancesResponse | null>({
		queryKey: ["balances", address, chainId],
		enabled: computed(() => Boolean(address.value && isConnected.value)),
		queryFn: async () => {
			if (!address.value) return null;
			return api.getBalances(address.value, chainId);
		},
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});

	return { address, isConnected, query };
}
