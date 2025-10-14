import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, type AppKitNetwork } from "@reown/appkit/networks";

export const networks = [base] as [AppKitNetwork, ...AppKitNetwork[]];

export const projectId = "563770c2c39279113e697078705ad8cd";

export const wagmiAdapter = new WagmiAdapter({
	networks,
	projectId,
});
