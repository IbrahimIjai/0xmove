import { useRuntimeConfig } from "#imports";

export type ApiUser = {
	id: string;
	address: `0x${string}`;
	email: string;
	username: string;
	kyc: boolean;
	ngnBalance: string; // serialized bigint
	kesBalance: string; // serialized bigint
	createdAt: string | Date;
	updatedAt: string | Date;
};

type ApiResponse<T> = { user?: T; existed?: boolean; error?: string };
export type BalancesResponse = {
	address: `0x${string}`;
	chainId: number;
	fiat: { NGN: string; KES: string };
	crypto: { USDC: string; USDT: string };
	tokenDecimals: { USDC: number; USDT: number };
	updatedAt: string;
};

const buildBaseUrl = () => {
	const cfg = useRuntimeConfig();
	// expect NUXT_PUBLIC_API_BASE to be set, else fallback to same-origin /api
	const base =
		(cfg.public as any).apiBase || (cfg.public as any).API_BASE || "/api";
	return base.replace(/\/$/, "");
};

export const api = {
	async getUserByAddress(address: `0x${string}`): Promise<ApiUser | null> {
		const base = buildBaseUrl();
		const res = await fetch(`${base}/onboarding?address=${address}`, {
			credentials: "include",
		});
		if (res.status === 404) return null;
		if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
		const data = (await res.json()) as ApiResponse<ApiUser>;
		return data.user ?? null;
	},
	async createUser(payload: {
		address: `0x${string}`;
		email: string;
		username: string;
	}): Promise<ApiUser> {
		const base = buildBaseUrl();
		const res = await fetch(`${base}/onboarding`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			credentials: "include",
		});
		if (!res.ok) throw new Error(`Failed to create user: ${res.status}`);
		const data = (await res.json()) as ApiResponse<ApiUser>;
		if (!data.user) throw new Error("No user in response");
		return data.user;
	},
	async getBalances(
		address: `0x${string}`,
		chainId?: number,
	): Promise<BalancesResponse> {
		const base = buildBaseUrl();
		const url = new URL(`${base}/balances`, window.location.origin);
		url.searchParams.set("address", address);
		if (chainId) url.searchParams.set("chainId", String(chainId));
		const res = await fetch(url.toString(), { credentials: "include" });
		if (!res.ok) throw new Error(`Failed to fetch balances: ${res.status}`);
		return (await res.json()) as BalancesResponse;
	},
};
