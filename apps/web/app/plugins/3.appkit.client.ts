import { createAppKit } from "@reown/appkit/vue";
import { wagmiAdapter, networks, projectId } from "~/config/wagmi";

export default defineNuxtPlugin(() => {
	// Initialize AppKit only on client side
	if (import.meta.client) {
		createAppKit({
			adapters: [wagmiAdapter],
			networks,
			projectId,
			metadata: {
				name: "0xMove - DeFi Fiat Bridge",
				description: "Earn sustainable APR on fiat & stablecoins",
				url: "https://distant.finance",
				icons: ["/favicon.png"],
			},
		});
	}
});
