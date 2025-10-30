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

<script setup>
const props = defineProps({
	modelValue: {
		type: String,
		required: true,
	},
	fieldType: {
		type: String,
		required: true,
		validator: (value) => ["from", "to"].includes(value),
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	loading: {
		type: Boolean,
		default: false,
	},
	disabledTokens: {
		type: Array,
		default: () => [],
	},
	selectedToken: {
		type: Object,
		default: null,
	},
});

const emit = defineEmits([
	"update:modelValue",
	"update:selectedToken",
	"input",
]);

const fiatValue = ref("0.00");

const handleInput = (value) => {
	if (!props.disabled) {
		emit("update:modelValue", value);
		emit("input", value);
	}

	// Calculate fiat value (mock implementation)
	if (value && props.selectedToken && !props.loading) {
		const mockUsdRate = props.selectedToken.type === "fiat" ? 0.0012 : 1;
		fiatValue.value = (parseFloat(value) * mockUsdRate).toFixed(2);
	} else {
		fiatValue.value = "0.00";
	}
};

const handleTokenChange = (token) => {
	emit("update:selectedToken", token);
};

// Watch for external changes
watch(
	() => props.modelValue,
	(newValue) => {
		if (newValue && props.selectedToken && !props.loading) {
			const mockUsdRate = props.selectedToken.type === "fiat" ? 0.0012 : 1;
			fiatValue.value = (parseFloat(newValue) * mockUsdRate).toFixed(2);
		} else {
			fiatValue.value = "0.00";
		}
	},
);

watch(
	() => props.loading,
	(isLoading) => {
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
