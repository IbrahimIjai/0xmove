<script setup>
const props = withDefaults(defineProps(), {
	type: "text",
	modelValue: "",
	variant: "default",
	size: "default",
	isError: false,
	maxDecimals: undefined,
});

const emit = defineEmits();

const inputRef = ref();

const inputRegex = /^\d*(?:\\[.])?\d*$/;

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isTypeText = (type) => type === "text";
const isTypeNumber = (type) => type === "number";
const isTypePercent = (type) => type === "percent";

/**
 * Computed properties for input attributes based on type
 */
const computedPlaceholder = computed(() => {
	if (isTypeNumber(props.type)) return "0.0";
	if (isTypePercent(props.type)) return "0";
	return undefined;
});

const computedPattern = computed(() => {
	if (isTypePercent(props.type)) return "^[0-9]*$";
	return undefined;
});

const computedInputMode = computed(() => {
	if (isTypePercent(props.type)) return "decimal";
	return undefined;
});

const computedMaxLength = computed(() => {
	if (isTypePercent(props.type)) return 3;
	return undefined;
});

/**
 * Computed classes for the input element
 */
const inputClasses = computed(() => {
	const baseClasses = [
		"truncate",
		"appearance-none",
		"text-gray-600",
		"dark:text-gray-400",
		"w-full",
		"!ring-0",
		"!outline-none",
		"flex-grow",
		"flex-1",
	];

	// Size classes
	if (props.size === "sm") {
		baseClasses.push("min-h-[36px]", "h-[36px]", "py-1");
	} else {
		baseClasses.push("min-h-[40px]", "h-[40px]", "py-2");
	}

	// Variant classes
	if (props.variant === "default") {
		baseClasses.push(
			"border-0",
			"flex",
			"items-center",
			"px-3",
			"rounded-md",
			"block",
			"bg-gray-100",
			"dark:bg-gray-800",
			"group-hover:bg-gray-200",
			"dark:group-hover:bg-gray-700",
			"group-focus:bg-blue-50",
			"dark:group-focus:bg-blue-900/20",
		);
	} else if (props.variant === "naked") {
		baseClasses.push("border-0", "bg-transparent");
	} else if (props.variant === "outline") {
		baseClasses.push(
			"bg-gray-100",
			"dark:bg-gray-800",
			"flex",
			"items-center",
			"px-3",
			"rounded-lg",
			"block",
			"border",
			"border-gray-200",
			"dark:border-gray-700",
			"group-hover:border-gray-400",
			"dark:group-hover:border-gray-500",
			"group-focus:border-gray-500",
			"dark:group-focus:border-gray-400",
			"hover:border-gray-400",
			"dark:hover:border-gray-500",
			"focus-within:border-gray-500",
			"dark:focus-within:border-gray-400",
		);
	}

	// Error state
	if (props.isError) {
		baseClasses.push(
			"bg-red-50",
			"dark:bg-red-900/20",
			"text-red-600",
			"dark:text-red-400",
		);
	}

	// Icon padding
	if (props.icon) {
		baseClasses.push("pl-[40px]");
	}

	// Unit styling
	if (props.unit) {
		baseClasses.push("rounded-r-none", "!border-r-0");
	}

	return baseClasses;
});

/**
 * Computed classes for the unit display
 */
const unitClasses = computed(() => {
	const baseClasses = [
		"text-gray-600",
		"dark:text-gray-400",
		"!w-[unset]",
		"px-3",
		"flex",
		"items-center",
	];

	// Size classes
	if (props.size === "sm") {
		baseClasses.push("min-h-[36px]", "h-[36px]", "py-1");
	} else {
		baseClasses.push("min-h-[40px]", "h-[40px]", "py-2");
	}

	// Variant classes
	if (props.variant === "default") {
		baseClasses.push(
			"border-0",
			"rounded-md",
			"rounded-l-none",
			"bg-gray-100",
			"dark:bg-gray-800",
			"group-hover:bg-gray-200",
			"dark:group-hover:bg-gray-700",
			"group-focus:bg-blue-50",
			"dark:group-focus:bg-blue-900/20",
		);
	} else if (props.variant === "outline") {
		baseClasses.push(
			"bg-gray-100",
			"dark:bg-gray-800",
			"rounded-lg",
			"rounded-l-none",
			"border",
			"border-l-0",
			"border-gray-200",
			"dark:border-gray-700",
		);
	}

	// Error state
	if (props.isError) {
		baseClasses.push(
			"bg-red-50",
			"dark:bg-red-900/20",
			"text-red-600",
			"dark:text-red-400",
		);
	}

	return baseClasses;
});

const handleInput = (event) => {
	const target = event.target;
	const nextUserInput = target.value;

	if (typeof nextUserInput === "undefined") {
		return;
	}

	let validatedValue = nextUserInput;

	if (isTypeNumber(props.type)) {
		// Replace commas with dots for decimal input
		const val = nextUserInput.replace(/,/g, ".");

		if (val === "") {
			validatedValue = "";
			emit("valueChange", "");
		} else if (inputRegex.test(escapeRegExp(val))) {
			// Check decimal places if maxDecimals is specified
			if (props.maxDecimals && val.includes(".")) {
				const [, decimals] = val.split(".");
				if (decimals && decimals.length <= props.maxDecimals) {
					validatedValue = val;
					emit("valueChange", val);
				} else {
					// Don't update if exceeds max decimals
					return;
				}
			} else {
				validatedValue = val;
				emit("valueChange", val);
			}
		} else {
			// Invalid input, don't update
			return;
		}
	} else if (isTypeText(props.type)) {
		validatedValue = nextUserInput;
		emit("valueChange", nextUserInput);
	} else if (isTypePercent(props.type)) {
		// Remove commas and percent signs
		const cleanInput = nextUserInput.replace(/,/g, ".").replace(/%/g, "");

		if (cleanInput === "" || inputRegex.test(escapeRegExp(cleanInput))) {
			validatedValue = cleanInput;
			emit("valueChange", cleanInput);
		} else {
			// Invalid input, don't update
			return;
		}
	}

	emit("update:modelValue", validatedValue);
};

const handleChange = (event) => {
	emit("change", event);
};

/**
 * Expose the input ref for parent components
 */
defineExpose({
	inputRef,
});
</script>

<template>
	<div class="relative flex items-center justify-between w-full group">
		<!-- Icon -->
		<Icon v-if="icon" :name="icon" class="absolute w-4 h-4 left-3 z-10" />

		<!-- Input Field -->
		<input
			ref="inputRef"
			:value="modelValue"
			:class="inputClasses"
			:placeholder="computedPlaceholder"
			:pattern="computedPattern"
			:inputmode="computedInputMode"
			:maxlength="computedMaxLength"
			autocorrect="off"
			autocapitalize="none"
			spellcheck="false"
			autocomplete="off"
			v-bind="$attrs"
			@input="handleInput"
			@change="handleChange" />

		<!-- Unit Display -->
		<div v-if="unit" :class="unitClasses">
			{{ unit }}
		</div>
	</div>
</template>
