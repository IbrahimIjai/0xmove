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
};
