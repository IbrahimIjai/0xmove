<template>
	<div>
		<UModal v-model:open="isOpen">
			<UButton
				color="neutral"
				variant="outline"
				class="rounded-full"
				@click="isOpen = true">
				<div class="flex items-center gap-1 relative">
					<div class="relative">
						<UAvatar
							v-if="modelValue?.logoURI"
							:src="modelValue.logoURI"
							size="md" />
						<!-- Small chain logo at bottom-right -->
						<UAvatar
							v-if="getChainLogo(modelValue?.chainId)"
							:src="getChainLogo(modelValue?.chainId)"
							size="3xs"
							class="bg-gray-200 absolute -bottom-1 -right-1 z-20 ring-1 ring-white dark:ring-gray-900 rounded-full" />
					</div>
					<span class="mx-1 whitespace-nowrap">{{
						modelValue?.symbol || "Select Token"
					}}</span>
				</div>
				<UIcon name="i-lucide-chevron-down" class="size-5" />
			</UButton>

			<template #content>
				<div class="py-4 px-2">
					<div>
						<h3 class="text-lg font-medium">Select Currency/Token</h3>
					</div>
					<UInput
						v-model="searchQuery"
						placeholder="Search name or paste address"
						icon="i-heroicons-magnifying-glass"
						class="mb-4 w-full rounded-lg" />

					<div class="max-h-96 overflow-y-auto px-4">
						<div
							v-if="filteredTokens.length === 0"
							class="text-center py-8 text-gray-500">
							No tokens found
						</div>

						<div v-else>
							<div
								v-for="token in filteredTokens"
								:key="token.id"
								class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
								@click="selectToken(token)">
								<UAvatar :src="token.logoURI" size="sm" />
								<div class="ml-3 flex-1">
									<div class="font-medium">{{ token.symbol }}</div>
									<div class="text-xs text-gray-500">{{ token.name }}</div>
								</div>
								<div
									v-if="token.type === 'crypto'"
									class="text-xs text-gray-400">
									Chain: {{ getChainName(token.chainId) }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
		</UModal>
	</div>
</template>

<script setup lang="ts">
import type { Token } from "~/utils/tokens";
import { ALL_TOKENS } from "~/utils/tokens";
import { SUPPORTED_CHAINS } from "~/utils/reown-config";

const props = defineProps<{
	modelValue?: Token | null;
	disabledTokens?: string[];
}>();

const emit = defineEmits<{
	"update:modelValue": [token: Token];
}>();

const isOpen = ref<boolean>(false);

const searchQuery = ref<string>("");

const filteredTokens = computed<Token[]>(() => {
	let tokens: Token[] = ALL_TOKENS;

	// Filter out disabled tokens
	if (props.disabledTokens?.length) {
		tokens = tokens.filter((t: Token) => !props.disabledTokens?.includes(t.id));
	}

	// Filter by search query
	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase();
		tokens = tokens.filter(
			(t: Token) =>
				t.name.toLowerCase().includes(query) ||
				t.symbol.toLowerCase().includes(query) ||
				(typeof t.address === "string" &&
					t.address.toLowerCase().includes(query)),
		);
	}

	return tokens;
});

const getChainName = (chainId: number): string => {
	const chainEntry = Object.entries(SUPPORTED_CHAINS).find(
		([, id]) => id === chainId,
	);
	return chainEntry ? chainEntry[0] : `Chain ${chainId}`;
};

const getChainLogo = (chainId: number | undefined): string | undefined => {
	// Return Base chain logo for Base chain, undefined for others or undefined
	if (chainId === 8453) {
		return "https://github.com/base-org/brand-kit/raw/main/logo/in-product/Base_Network_Logo.svg";
	}
	return undefined;
};

function selectToken(token: Token): void {
	emit("update:modelValue", token);
	isOpen.value = false;
	searchQuery.value = "";
}
</script>
