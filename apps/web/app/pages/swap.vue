<template>
	<div>
		<div
			class="max-w-md mx-auto mt-10 space-y-4 border border-default rounded-xl p-2.5">
			<div>
				<h1 class="text-xl font-bold text-left">Swap</h1>
			</div>
			<SwapSelectPanel
				v-model="swapState.fromAmount"
				:field-type="'from'"
				:selected-token="swapState.fromToken"
				:disabled-tokens="getDisabledTokens('from')"
				:loading="swapState.loading"
				@update:selected-token="handleFromTokenChange"
				@input="handleFromAmountChange" />
			<!-- Swap Direction Toggle -->
			<div
				class="flex justify-center items-center border border-default w-fit mx-auto rounded-full p-1.5 cursor-pointer hover:bg-muted/70">
				<UIcon
					name="i-lucide-chevron-down"
					class="size-7"
					color="primary"
					@click="swapTokens" />
			</div>
			<SwapSelectPanel
				v-model="swapState.toAmount"
				:field-type="'to'"
				:selected-token="swapState.toToken"
				:disabled-tokens="getDisabledTokens('to')"
				:loading="swapState.loading"
				:disabled="true"
				@update:selected-token="handleToTokenChange" />

			<SwapConfirmButton
				:loading="swapState.loading"
				:error="swapState.error"
				:success="swapState.success"
				:disabled="!isValidSwap"
				@click="handleSwap" />
		</div>
	</div>
</template>

<script setup>
import { toast } from "vue-sonner";
import { useDebounceFn } from "@vueuse/core";

const swapState = reactive({
	fromAmount: "",
	toAmount: "",
	fromToken: undefined,
	toToken: undefined,
	loading: false,
	error: null,
	success: null,
});

const getDisabledTokens = (fieldType) => {
	const otherToken =
		fieldType === "from" ? swapState.toToken : swapState.fromToken;
	return otherToken ? [otherToken.id] : [];
};
const isValidSwap = computed(() => {
	return (
		parseFloat(swapState.fromAmount) > 0 &&
		parseFloat(swapState.toAmount) > 0 &&
		swapState.fromToken !== undefined &&
		swapState.toToken !== undefined &&
		!swapState.loading &&
		swapState.fromToken.type !== swapState.toToken.type
	);
});

const fetchExchangeRate = useDebounceFn(
	async (amount, fromToken, toToken) => {
		if (!amount || parseFloat(amount) <= 0 || !fromToken || !toToken) {
			swapState.toAmount = "";
			swapState.loading = false;
			return;
		}

		if (fromToken.type === toToken.type) {
			swapState.toAmount = "";
			swapState.loading = false;
			swapState.error =
				"Cannot swap between tokens of the same type (e.g., crypto to crypto or fiat to fiat).";
			toast.error("Invalid Swap Pair", {
				description:
					"Only fiat-to-crypto or crypto-to-fiat swaps are supported.",
			});
			return;
		}

		swapState.loading = true;
		swapState.error = null;
		swapState.success = null;

		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));

			let mockRate;
			if (fromToken.type === "fiat" && toToken.type === "crypto") {
				mockRate = 0.0012;
			} else if (fromToken.type === "crypto" && toToken.type === "fiat") {
				mockRate = 800;
			} else {
				mockRate = 1;
			}

			const outputAmount = parseFloat(amount) * mockRate;
			swapState.toAmount = outputAmount.toFixed(6);
		} catch (error) {
			console.error("Error fetching exchange rate:", error);
			swapState.error = "Failed to fetch exchange rate.";
			toast.error("Exchange Rate Error", {
				description: "An error occurred while fetching the exchange rate.",
			});
			swapState.toAmount = "";
		} finally {
			swapState.loading = false;
		}
	},
	2000, // Debounce for 2 seconds
);

// Event handlers
// const handleFromTokenChange = (token: Token | undefined) => {
//   if (!token) return;
//   if (token.tokenId === swapState.toToken?.tokenId) {
//     toast.error("Invalid Selection", {
//       description: "Cannot select same token for both fields",
//     });
//     return;
//   }

//   swapState.fromToken = token;

//   // Recalculate if we have an amount
//   if (swapState.fromAmount && swapState.toToken) {
//     fetchExchangeRate(swapState.fromAmount, token, swapState.toToken);
//   }
// };
const handleFromTokenChange = (token) => {
	if (!token) return;

	if (token.id === swapState.toToken?.id) {
		toast.error("Invalid Selection", {
			description: "Cannot select the same token for both fields.",
		});
		return;
	}

	swapState.fromToken = token;
	if (
		swapState.fromAmount &&
		parseFloat(swapState.fromAmount) > 0 &&
		swapState.toToken
	) {
		fetchExchangeRate(swapState.fromAmount, token, swapState.toToken);
	} else {
		swapState.toAmount = "";
		swapState.loading = false;
		swapState.error = null;
	}
};

// const handleToTokenChange = (token: Token | undefined) => {
//   if (!token) return;
//   if (token.tokenId === swapState.fromToken?.tokenId) {
//     toast.error("Invalid Selection", {
//       description: "Cannot select same token for both fields",
//     });
//     return;
//   }

//   swapState.toToken = token;

//   // Recalculate if we have an amount
//   if (swapState.fromAmount && swapState.fromToken) {
//     fetchExchangeRate(swapState.fromAmount, swapState.fromToken, token);
//   }
// };

const handleToTokenChange = (token) => {
	if (!token) return;

	if (token.id === swapState.fromToken?.id) {
		toast.error("Invalid Selection", {
			description: "Cannot select the same token for both fields.",
		});
		return;
	}

	swapState.toToken = token;
	if (
		swapState.fromAmount &&
		parseFloat(swapState.fromAmount) > 0 &&
		swapState.fromToken
	) {
		fetchExchangeRate(swapState.fromAmount, swapState.fromToken, token);
	} else {
		swapState.toAmount = "";
		swapState.loading = false;
		swapState.error = null;
	}
};

const handleFromAmountChange = (value) => {
	swapState.fromAmount = value;

	if (value && swapState.fromToken && swapState.toToken) {
		fetchExchangeRate(value, swapState.fromToken, swapState.toToken);
	} else {
		swapState.toAmount = "";
	}
};

const swapTokens = () => {
	swapState.error = null;
	swapState.success = null;

	const tempToken = swapState.fromToken;
	const tempAmount = swapState.fromAmount;

	swapState.fromToken = swapState.toToken;
	swapState.toToken = tempToken;

	swapState.fromAmount = swapState.toAmount;
	swapState.toAmount = tempAmount;

	if (
		swapState.fromAmount &&
		parseFloat(swapState.fromAmount) > 0 &&
		swapState.fromToken &&
		swapState.toToken
	) {
		fetchExchangeRate(
			swapState.fromAmount,
			swapState.fromToken,
			swapState.toToken,
		);
	} else {
		swapState.loading = false;
		swapState.toAmount = "";
	}
};

const handleSwap = async () => {
	if (!isValidSwap.value) {
		toast.warning("Swap Not Valid", {
			description: "Please enter valid amounts and select tokens to proceed.",
		});
		return;
	}

	// swapState.isSwapping = true;
	swapState.error = null;
	swapState.success = null;

	try {
		const swapPromise = new Promise((resolve, reject) => {
			setTimeout(() => {
				const success = Math.random() > 0.3;
				if (success) {
					resolve("Your swap was successful!");
				} else {
					reject(
						new Error(
							"Insufficient balance or network error. Please try again.",
						),
					);
				}
			}, 2500);
		});

		await toast.promise(swapPromise, {
			loading: "Initiating swap...",
			success: (message) => {
				swapState.success = message;
				swapState.fromAmount = "";
				swapState.toAmount = "";
				swapState.fromToken = undefined;
				swapState.toToken = undefined;
				return message;
			},
			error: (error) => {
				swapState.error =
					error instanceof Error
						? error.message
						: "An unexpected error occurred";
				return `Swap failed: ${swapState.error}`;
			},
		});
	} catch (err) {
		console.error("An unexpected error occurred during swap:", err);
	} finally {
		if (swapState.success) {
			setTimeout(() => {
				swapState.success = null;
			}, 5000);
		}
		if (swapState.error) {
			setTimeout(() => {
				swapState.error = null;
			}, 5000);
		}
	}
};
</script>
