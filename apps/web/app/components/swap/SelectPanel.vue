<template>
	<div
		class="flex justify-between items-center gap-2 border border-default rounded-lg w-full p-2">
		<div>
			<p>{{ fieldType }}</p>
			<UInput
				color="neutral"
				variant="none"
				type="number"
				size="xl"
				class="w-full pr-8 no-spinner"
				placeholder="0.00"
				:model-value="modelValue"
				@update:model-value="handleInput" />
			<p>{{ fiatValue || "" }}</p>
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
	selectedToken?: Token | null;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: string];
	"update:selectedToken": [token: Token | undefined];
	input: [value: string];
}>();

const fiatValue = ref<string>("0.00");

const handleInput = (value: string): void => {
	if (!props.disabled) {
		emit("update:modelValue", value);
		emit("input", value);
	}

	// Calculate fiat value with proper type checking
	if (value && props.selectedToken && !props.loading) {
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			const mockUsdRate = props.selectedToken.type === "fiat" ? 0.0012 : 1;
			fiatValue.value = (numValue * mockUsdRate).toFixed(2);
		}
	} else {
		fiatValue.value = "0.00";
	}
};

const handleTokenChange = (token: Token | undefined): void => {
	emit("update:selectedToken", token);
};

// Watch for external changes with proper TypeScript types
watch(
	() => props.modelValue,
	(newValue: string) => {
		if (newValue && props.selectedToken && !props.loading) {
			const numValue = parseFloat(newValue);
			if (!isNaN(numValue)) {
				const mockUsdRate = props.selectedToken.type === "fiat" ? 0.0012 : 1;
				fiatValue.value = (numValue * mockUsdRate).toFixed(2);
			}
		} else {
			fiatValue.value = "0.00";
		}
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

<style scoped>
/* Hide number input spinners for WebKit browsers (Chrome, Safari, Edge) */
.no-spinner :deep(input[type="number"]::-webkit-outer-spin-button),
.no-spinner :deep(input[type="number"]::-webkit-inner-spin-button) {
	-webkit-appearance: none;
	margin: 0;
}

/* Hide number input spinners for Firefox */
.no-spinner :deep(input[type="number"]) {
	-moz-appearance: textfield;
	appearance: textfield;
}

.no-spinner :deep(input[type="number"]) {
	font-size: 1.8rem;
	font-weight: 500;
	padding: 0;
}

/* Text selection styling - this is the key part! */
.custom-text-size input::selection {
	background-color: #3b82f6 !important; /* Blue highlight */
	color: white !important;
}

.custom-text-size input::-moz-selection {
	background-color: #3b82f6 !important; /* Blue highlight for Firefox */
	color: white !important;
}

/* Alternative: Use a different highlight color */
.custom-text-size input::selection {
	background-color: rgba(
		59,
		130,
		246,
		0.3
	) !important; /* Semi-transparent blue */
	color: inherit !important; /* Keep original text color */
}

.custom-text-size input::-moz-selection {
	background-color: rgba(59, 130, 246, 0.3) !important;
	color: inherit !important;
}
</style>
