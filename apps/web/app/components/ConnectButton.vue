<script setup lang="ts">
import { computed, toRef, watch } from "vue";
import { useAppKit } from "@reown/appkit/vue";
import { useAppKitAccount } from "@reown/appkit/vue";
import { useUser } from "@/composables/useUser";

const { open } = useAppKit();

const accountData = useAppKitAccount();
const isConnected = computed(
	() => toRef(accountData.value, "isConnected").value || false,
);

const address = computed(() => toRef(accountData.value, "address").value);
const { userQuery } = useUser();

const openConnection = () => {
	 open({ view: 'Connect' });
};

// When wallet connects, check if user exists and navigate accordingly
watch(isConnected, async (now) => {
	if (!now) return;
	await userQuery.refetch();
	const user = userQuery.data.value;
	if (user) navigateTo("/dashboard");
	else navigateTo("/onboarding");
});

const shortenAddress = (address: string | undefined): string => {
	if (!address) return "";
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
</script>

<template>
	<UButton
		class="connect-button"
		@click="openConnection"
		:variant="isConnected ? 'outline' : 'solid'"
		:loading="isConnected && !address">
		<template v-if="isConnected">
			{{ address ? shortenAddress(address) : "Loading..." }}
		</template>
		<template v-else> Connect </template>
	</UButton>
</template>
