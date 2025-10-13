import { Hono } from "hono";
import { db } from "../db/drizzle";
import { user } from "../db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

const isEvmAddress = (addr: unknown): addr is `0x${string}` =>
	typeof addr === "string" && /^0x[a-fA-F0-9]{40}$/.test(addr);

const ERC20_ABI = [
	{
		type: "function",
		name: "balanceOf",
		stateMutability: "view",
		inputs: [{ name: "account", type: "address" }],
		outputs: [{ name: "balance", type: "uint256" }],
	},
] as const;

const balances = new Hono();

// GET /balances?address=0x...&chainId=84532
// Returns fiat balances (NGN/KES) from DB and crypto balances (USDC/USDT) via viem.
balances.get("/", async (c) => {
	try {
		const url = new URL(c.req.url);
		const address = url.searchParams.get("address") ?? undefined;
		const chainIdParam = url.searchParams.get("chainId");

		if (!isEvmAddress(address)) {
			return c.json({ error: "Invalid or missing address" }, 400);
		}

		const chainId = chainIdParam ? Number(chainIdParam) : base.id;
		const rpcUrl = (process.env.RPC_URL || "").trim() || undefined;
		const usdcAddress = (process.env.USDC_ADDRESS || "").trim();
		const usdtAddress = (process.env.USDT_ADDRESS || "").trim();
		const useCrypto = usdcAddress && usdtAddress;

		// 1) Fiat from DB
		const addressNorm = address.toLowerCase() as `0x${string}`;
		const existing = await db
			.select({ ngnBalance: user.ngnBalance, kesBalance: user.kesBalance })
			.from(user)
			.where(eq(user.address, addressNorm))
			.limit(1);

		const fiat = {
			NGN: existing[0]?.ngnBalance?.toString?.() ?? "0",
			KES: existing[0]?.kesBalance?.toString?.() ?? "0",
		};

		// 2) Crypto via viem (optional if env set)
		let crypto = { USDC: "0", USDT: "0" };
		if (useCrypto) {
			const client = createPublicClient({
				chain: { ...base, id: chainId },
				transport: http(rpcUrl || base.rpcUrls.default.http[0]),
			});
			try {
				const [usdc, usdt] = await Promise.all([
					client.readContract({
						address: usdcAddress as `0x${string}`,
						abi: ERC20_ABI,
						functionName: "balanceOf",
						args: [address],
					}),
					client.readContract({
						address: usdtAddress as `0x${string}`,
						abi: ERC20_ABI,
						functionName: "balanceOf",
						args: [address],
					}),
				]);
				crypto = {
					USDC: (usdc as bigint).toString(),
					USDT: (usdt as bigint).toString(),
				};
			} catch (e) {
				// leave crypto as zero on failure
			}
		}

		return c.json(
			{
				address,
				chainId,
				fiat, // minor units (e.g., kobo/cents) as strings
				crypto, // token base units (6 decimals) as strings
				tokenDecimals: { USDC: 6, USDT: 6 },
				updatedAt: new Date().toISOString(),
			},
			200,
		);
	} catch (err) {
		return c.json({ error: "Unexpected error" }, 500);
	}
});

export default balances;
