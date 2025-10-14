import { defineNuxtPlugin } from "nuxt/app";
import { createAppKit } from "@reown/appkit/vue";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { chains } from "@/utils/reown-config";
import { wagmiAdapter } from "@/config/wagmi";

export default defineNuxtPlugin(() => {
	// Ensure this only runs on client
	if (import.meta.server) return;

	const projectId = "563770c2c39279113e697078705ad8cd";

	const metadata = {
		name: "0xMove",
		description: "0xMove",
		url: "https://0xMove.xyz",
		icons: ["https://avatars.githubusercontent.com/u/179229932"],
	};

	const networks: [AppKitNetwork, ...AppKitNetwork[]] = chains;

	createAppKit({
		adapters: [wagmiAdapter],
		networks,
		projectId,
		metadata,
		features: {
			analytics: true,
		},
	});
});
