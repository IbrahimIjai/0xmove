import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, watch } from "vue";
import { api, type ApiUser } from "@/utils/api";
import { useAppKitAccount } from "@reown/appkit/vue";

const USER_QUERY_KEY = (address: string | undefined) => [
	"user",
	address?.toLowerCase(),
];

export function useUser() {
	const qc = useQueryClient();
	const account = useAppKitAccount();
	const address = computed(
		() => account.value.address as undefined | `0x${string}`,
	);
	const isConnected = computed(() => account.value.isConnected ?? false);

	const userQuery = useQuery<ApiUser | null>({
		queryKey: USER_QUERY_KEY(address.value),
		queryFn: async () => {
			if (!address.value || !isConnected.value) return null;
			return api.getUserByAddress(address.value);
		},
		enabled: computed(() => Boolean(address.value && isConnected.value)),
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});

	// Refetch whenever address changes
	watch(address, () => {
		if (address.value && isConnected.value) {
			qc.invalidateQueries({ queryKey: USER_QUERY_KEY(address.value) });
		}
	});

	const createUser = useMutation<
		ApiUser,
		Error,
		{ email: string; username: string }
	>({
		mutationFn: async (body: { email: string; username: string }) => {
			if (!address.value) throw new Error("Missing address");
			return api.createUser({
				address: address.value,
				email: body.email,
				username: body.username,
			});
		},
		onSuccess(user: ApiUser) {
			if (address.value) {
				qc.setQueryData(USER_QUERY_KEY(address.value), user);
			}
		},
	});

	return { address, isConnected, userQuery, createUser };
}
