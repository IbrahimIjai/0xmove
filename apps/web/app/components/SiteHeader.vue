<template>
	<header class="p-4 shadow-sm w-full flex items-center justify-between">
		<NuxtLink to="/">0xMove</NuxtLink>
		<UNavigationMenu
			color="neutral"
			:items="items"
			class="hidden lg:inline-flex" />

		<div class="flex items-center gap-1.5">
			<UButton to="/dashboard">Dashboard</UButton>
			<UButton
				v-if="isConnected && address"
				variant="outline"
				@click="openAccountDialog"
				class="hidden lg:inline-flex">
				{{ shortenAddress(address) }}
			</UButton>
			<div class="inline-flex lg:hidden">
				<USlideover title="0xMove" description="">
					<UButton
						icon="i-lucide-menu"
						size="md"
						color="primary"
						variant="outline" />

					<template #body>
						<div class="flex flex-col items-center gap-3">
							<NuxtLink to="/swap" class="text-center">Swap</NuxtLink>
							<NuxtLink to="/pool" class="text-center">Pools</NuxtLink>
							<UButton
								v-if="isConnected && address"
								variant="outline"
								block
								@click="openAccountDialog">
								{{ shortenAddress(address) }}
							</UButton>
						</div>
					</template>
				</USlideover>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { computed, toRef } from "vue";
import { useAppKit, useAppKitAccount } from "@reown/appkit/vue";
const router = useRouter();

const items = ref<NavigationMenuItem[][]>([
	[
		{
			label: "Swap",
			to: "/swap",
		},
		{
			label: "Pools",
			to: "/pool",
		},
	],
	[],
]);

const accountData = useAppKitAccount();
const isConnected = computed(
	() => toRef(accountData.value, "isConnected").value || false,
);
const address = computed(() => toRef(accountData.value, "address").value);

const openAccountDialog = () => {
	useAppKit().open();
};

const shortenAddress = (addr?: string): string => {
	if (!addr) return "";
	return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};
</script>
