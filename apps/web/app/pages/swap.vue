<template>
  <div>
    <div
      class="max-w-md mx-auto mt-10 space-y-4 border border-default rounded-xl p-2.5"
    >
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
        @input="handleFromAmountChange"
      />
      <!-- Swap Direction Toggle -->
      <div
        class="flex justify-center items-center border border-default w-fit mx-auto rounded-full p-1.5 cursor-pointer hover:bg-muted/70"
      >
        <UIcon
          name="i-lucide-chevron-down"
          class="size-7"
          color="primary"
          @click="swapTokens"
        />
      </div>
      <SwapSelectPanel
        v-model="swapState.toAmount"
        :field-type="'to'"
        :selected-token="swapState.toToken"
        :disabled-tokens="getDisabledTokens('to')"
        :loading="swapState.loading"
        :disabled="true"
        @update:selected-token="handleToTokenChange"
      />

      <SwapConfirmButton
        :loading="swapState.loading"
        :error="swapState.error"
        :success="swapState.success"
        :disabled="!isValidSwap"
        @click="handleSwap"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";
import { useDebounceFn } from "@vueuse/core";
import type { Token } from "@/utils/tokens";

const swapState = reactive({
  fromAmount: "",
  toAmount: "",
  fromToken: undefined as Token | undefined,
  toToken: undefined as Token | undefined,
  loading: false,
  error: null as string | null,
  success: null as string | null,
});

// Get disabled tokens for each field
const getDisabledTokens = (fieldType: "from" | "to"): string[] => {
  const otherToken =
    fieldType === "from" ? swapState.toToken : swapState.fromToken;
  return otherToken ? [otherToken.id] : [];
};

// Computed properties
const isValidSwap = computed(() => {
  return (
    parseFloat(swapState.fromAmount) > 0 &&
    parseFloat(swapState.toAmount) > 0 &&
    swapState.fromToken !== undefined &&
    swapState.toToken !== undefined &&
    !swapState.loading &&
    // !swapState.isSwapping &&
    swapState.fromToken.type !== swapState.toToken.type
  );
});

const fetchExchangeRate = useDebounceFn(
  async (amount: string, fromToken: Token, toToken: Token) => {
    // If inputs are invalid, clear 'toAmount' and return.
    if (!amount || parseFloat(amount) <= 0 || !fromToken || !toToken) {
      swapState.toAmount = "";
      swapState.loading = false; // Ensure loading state is reset
      return;
    }

    // New check: if types are the same, do not fetch rate and show an error
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

    swapState.loading = true; // Set loading true while fetching rate
    swapState.error = null; // Clear any previous errors
    swapState.success = null; // Clear any previous success messages

    try {
      // Simulate an API call delay for fetching the exchange rate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock exchange rate calculation based on token types.
      let mockRate;
      if (fromToken.type === "fiat" && toToken.type === "crypto") {
        mockRate = 0.0012; // Example: 1 NGN = 0.0012 USDC
      } else if (fromToken.type === "crypto" && toToken.type === "fiat") {
        mockRate = 800; // Example: 1 USDC = 800 NGN
      } else {
        // This case should ideally be prevented by the UI filtering and initial type check,
        // but included as a safe fallback.
        mockRate = 1;
      }

      const outputAmount = parseFloat(amount) * mockRate;
      swapState.toAmount = outputAmount.toFixed(6); // Format to 6 decimal places
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      swapState.error = "Failed to fetch exchange rate.";
      toast.error("Exchange Rate Error", {
        description: "An error occurred while fetching the exchange rate.",
      });
      swapState.toAmount = ""; // Clear output amount on error
    } finally {
      swapState.loading = false; // Reset loading state
    }
  },
  2000 // Debounce for 2 seconds
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
const handleFromTokenChange = (token: Token | undefined) => {
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

const handleToTokenChange = (token: Token | undefined) => {
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

const handleFromAmountChange = (value: string) => {
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
      swapState.toToken
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
              "Insufficient balance or network error. Please try again."
            )
          );
        }
      }, 2500); 
    });

    await toast.promise(swapPromise as Promise<string>, {
      loading: "Initiating swap...",
      success: (message:string) => {
        swapState.success = message;
        swapState.fromAmount = "";
        swapState.toAmount = "";
        swapState.fromToken = undefined;
        swapState.toToken = undefined;
        return message;
      },
      error: (error: Error) => {
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
