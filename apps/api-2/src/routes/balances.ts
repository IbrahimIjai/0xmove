import { Hono } from "hono";
import { db } from "../db/drizzle";
import { user } from "../db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { USDC, USDT } from "@0xmove/config/tokens";
import { SUPPORTED_CHAIN_IDS, CHAIN_BY_ID } from "@0xmove/config/chains";

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
		// Prefer config mapping; fallback to env overrides if provided
		const envUsdc = (process.env.USDC_ADDRESS || "").trim();
		const envUsdt = (process.env.USDT_ADDRESS || "").trim();

		// Build list of chains to query. If a specific chainId is provided, query only that; otherwise, query all supported chains.
		const chainIdsToQuery = chainIdParam
			? [Number(chainIdParam)]
			: SUPPORTED_CHAIN_IDS.slice();

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

		// 2) Crypto via viem across chains
		const crypto: {
			USDC: Array<{ chainId: number; balance: string }>;
			USDT: Array<{ chainId: number; balance: string }>;
		} = {
			USDC: [],
			USDT: [],
		};
		for (const cid of chainIdsToQuery) {
			const cfgUsdc = (USDC as Record<number, string>)[cid] || "";
			const cfgUsdt = (USDT as Record<number, string>)[cid] || "";
			const usdcAddress = (envUsdc || cfgUsdc).trim();
			const usdtAddress = (envUsdt || cfgUsdt).trim();

			const chain = (CHAIN_BY_ID as any)[cid] || {
				...base,
				id: cid,
				rpcUrls: base.rpcUrls,
			};
			const client = createPublicClient({
				chain,
				transport: http(rpcUrl || chain.rpcUrls.default.http[0]),
			});

			const contracts: any[] = [];
			const mapIndex: Array<"USDC" | "USDT"> = [];
			if (usdcAddress) {
				contracts.push({
					address: usdcAddress as `0x${string}`,
					abi: ERC20_ABI,
					functionName: "balanceOf",
					args: [address],
				});
				mapIndex.push("USDC");
			}
			if (usdtAddress) {
				contracts.push({
					address: usdtAddress as `0x${string}`,
					abi: ERC20_ABI,
					functionName: "balanceOf",
					args: [address],
				});
				mapIndex.push("USDT");
			}

			if (!contracts.length) {
				continue;
			}

			try {
				const results: any[] = await client.multicall({
					contracts,
					allowFailure: true,
				});
				results.forEach((r: any, idx: number) => {
					const token = mapIndex[idx];
					const balance = r?.result ? (r.result as bigint).toString() : "0";
					crypto[token].push({ chainId: cid, balance });
				});
			} catch (e) {
				// push zeros in case of failure
				mapIndex.forEach((token) =>
					crypto[token].push({ chainId: cid, balance: "0" }),
				);
			}
		}

		return c.json(
			{
				address,
				queriedChains: chainIdsToQuery,
				fiat, // minor units (e.g., kobo/cents) as strings
				crypto, // per-token arrays of { chainId, balance }
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
