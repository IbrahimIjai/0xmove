<template>
	<div class="space-y-6 py-4">
		<div class="flex items-center justify-between">
			<h1 class="text-xl font-semibold">Dashboard</h1>
			<ConnectButton />
		</div>

		<USeparator />

		<div>
			<h2 class="text-lg font-medium mb-2">Fiat balances</h2>
			<div v-if="balances.query.isLoading.value">Loading balances...</div>
			<div v-else-if="balances.query.error.value" class="text-red-500 text-sm">
				{{ String(balances.query.error.value) }}
			</div>
			<div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<div class="text-sm opacity-75">NGN</div>
							<div class="text-2xl font-semibold">
								{{ formatMinor(balances.query.data.value?.fiat.NGN) }}
							</div>
						</div>
					</div>
				</UCard>
				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<div class="text-sm opacity-75">KES</div>
							<div class="text-2xl font-semibold">
								{{ formatMinor(balances.query.data.value?.fiat.KES) }}
							</div>
						</div>
					</div>
				</UCard>
			</div>
		</div>

		<USeparator />

		<div>
			<h2 class="text-lg font-medium mb-2">Crypto balances</h2>
			<div v-if="balances.query.isLoading.value">Loading balances...</div>
			<div v-else-if="balances.query.error.value" class="text-red-500 text-sm">
				{{ String(balances.query.error.value) }}
			</div>
			<div v-else class="grid grid-cols-1 gap-4">
				<UCard>
					<div class="space-y-2">
						<div class="text-sm opacity-75">USDC</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<div
								v-for="entry in balances.query.data.value?.crypto.USDC || []"
								:key="'usdc-' + entry.chainId"
								class="flex items-center justify-between">
								<span class="text-xs opacity-70">{{
									chainName(entry.chainId)
								}}</span>
								<span class="text-lg font-semibold">{{
									formatToken(entry.balance, 6)
								}}</span>
							</div>
						</div>
					</div>
				</UCard>
				<UCard>
					<div class="space-y-2">
						<div class="text-sm opacity-75">USDT</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<div
								v-for="entry in balances.query.data.value?.crypto.USDT || []"
								:key="'usdt-' + entry.chainId"
								class="flex items-center justify-between">
								<span class="text-xs opacity-70">{{
									chainName(entry.chainId)
								}}</span>
								<span class="text-lg font-semibold">{{
									formatToken(entry.balance, 6)
								}}</span>
							</div>
						</div>
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useBalances } from "@/composables/useBalances";
import { CHAIN_BY_ID } from "@0xmove/config";

const balances = useBalances();

function formatMinor(v?: string) {
	if (!v) return "0";
	// stored in minor units; display as integer with separators
	try {
		return Number.parseInt(v, 10).toLocaleString();
	} catch {
		return v;
	}
}

function formatToken(v?: string, decimals = 6) {
	if (!v) return "0.0";
	try {
		const bn = BigInt(v);
		const base = 10n ** BigInt(decimals);
		const whole = bn / base;
		const frac = (bn % base).toString().padStart(decimals, "0").slice(0, 2); // 2 dp
		return `${whole.toLocaleString()}.${frac}`;
	} catch {
		return v;
	}
}

function chainName(id: number): string {
	const c = (CHAIN_BY_ID as any)[id];
	return c?.name || `Chain ${id}`;
}
</script>
