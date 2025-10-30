<template>
	<div
		class="flex justify-between items-center gap-2 border border-default rounded-lg w-full p-2">
		<div>
			<p>{{ fieldType }}</p>
			<UInput
				color="neutral"
				variant="none"
				type="number"
				class="text-2xl font-medium text-right w-full pr-8"
				placeholder="0"
				:model-value="modelValue"
				@update:model-value="handleInput" />
			<p>${{ fiatValue }}</p>
		</div>
		<SwapTokenSelector
			:model-value="selectedToken"
			:disabled-tokens="disabledTokens"
			@update:model-value="handleTokenChange" />
	</div>
</template>

<script setup lang="ts">
import type { Token } from "~/utils/tokens";

const props = defineProps<{
	modelValue: string;
	fieldType: "from" | "to";
	disabled?: boolean;
	loading?: boolean;
	disabledTokens?: string[];
	selectedToken?: Token;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: string];
	"update:selectedToken": [token: Token | undefined];
	input: [value: string];
}>();

const tokenStore = useTokenStore();
const { formatTokenAmount } = useTokenRegistry();

const fiatValue = ref<string>("0.00");

const calculateFiatValue = (
	value: string,
	token: Token | undefined,
): string => {
	if (!value || !token) return "0.00";

	const amount = parseFloat(value);
	if (isNaN(amount)) return "0.00";

	if (token.type === "fiat") {
		// For fiat tokens, show USD equivalent
		const rate = tokenStore.getFiatRate(token.symbol);
		return formatTokenAmount(
			amount / rate,
			{ decimals: "fiat", symbol: "USD" },
			{ showSymbol: false },
		);
	} else {
		// For crypto tokens, show USD value (assuming 1:1 for USDC)
		return formatTokenAmount(
			amount,
			{ decimals: 2, symbol: "USD" },
			{ showSymbol: false },
		);
	}
};

const handleInput = (value: string): void => {
	if (!props.disabled) {
		emit("update:modelValue", value);
		emit("input", value);
	}

	// Calculate fiat value
	fiatValue.value = calculateFiatValue(value, props.selectedToken);
};

const handleTokenChange = (token: Token | undefined): void => {
	emit("update:selectedToken", token);
	// Recalculate fiat value with new token
	fiatValue.value = calculateFiatValue(props.modelValue, token);
};

// Watch for external changes with proper TypeScript types
watch(
	() => props.modelValue,
	(newValue: string) => {
		fiatValue.value = calculateFiatValue(newValue, props.selectedToken);
	},
);

watch(
	() => props.selectedToken,
	(newToken: Token | undefined) => {
		fiatValue.value = calculateFiatValue(props.modelValue, newToken);
	},
);

watch(
	() => props.loading,
	(isLoading: boolean | undefined) => {
		if (isLoading) {
			fiatValue.value = "0.00";
		}
	},
);
</script>
