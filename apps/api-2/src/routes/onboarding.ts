import { Hono } from "hono";
import { db } from "../db/drizzle";
import { user } from "../db/schema/auth-schema";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

const isEvmAddress = (addr: unknown): addr is `0x${string}` =>
	typeof addr === "string" && /^0x[a-fA-F0-9]{40}$/.test(addr);

const onboarding = new Hono();

type DbUser = typeof user.$inferSelect;
const serializeUser = (u: DbUser) => ({
	...u,
	ngnBalance: (u as any).ngnBalance?.toString?.() ?? "0",
	kesBalance: (u as any).kesBalance?.toString?.() ?? "0",
});

// GET /onboarding?address=0x...
// Returns the user if found, else 404
onboarding.get("/", async (c) => {
	try {
		const url = new URL(c.req.url);
		const address = url.searchParams.get("address") ?? undefined;
		if (!isEvmAddress(address)) {
			return c.json({ error: "Invalid or missing address" }, 400);
		}
		const addressNorm = address.toLowerCase() as `0x${string}`;
		const existing = await db
			.select()
			.from(user)
			.where(eq(user.address, addressNorm))
			.limit(1);
		if (!existing[0]) {
			return c.json({ error: "User not found" }, 404);
		}
		return c.json({ user: serializeUser(existing[0]) }, 200);
	} catch (err) {
		return c.json({ error: "Unexpected error" }, 500);
	}
});

// POST /onboarding
// body: { address: `0x${string}`, email: string, username: string }
onboarding.post("/", async (c) => {
	try {
		const body = (await c.req.json().catch(() => ({}))) as Record<
			string,
			unknown
		>;
		const { address, email, username } = body as {
			address?: string;
			email?: string;
			username?: string;
		};

		if (!isEvmAddress(address)) {
			return c.json({ error: "Invalid EVM address" }, 400);
		}
		if (typeof email !== "string" || !email.includes("@")) {
			return c.json({ error: "Invalid email" }, 400);
		}
		if (typeof username !== "string" || username.trim().length < 2) {
			return c.json({ error: "Invalid username" }, 400);
		}

		const addressNorm = address.toLowerCase() as `0x${string}`;

		// Build id with required prefix
		const id = `0xMove_${randomUUID().replace(/-/g, "")}`;

		// Try to insert; if unique violation, fall back to selecting existing
		try {
			const inserted = await db
				.insert(user)
				.values({
					id,
					address: addressNorm,
					email,
					username,
					kyc: true,
					// balances default to 0 via schema
				})
				.returning();

			return c.json({ user: serializeUser(inserted[0]) }, 201);
		} catch (e) {
			// likely unique constraint violation on address/email/username
			const existing = await db
				.select()
				.from(user)
				.where(eq(user.address, addressNorm))
				.limit(1);
			if (existing[0]) {
				return c.json({ user: serializeUser(existing[0]), existed: true }, 200);
			}
			// as a fallback, try email/username lookup
			const byEmail = await db
				.select()
				.from(user)
				.where(eq(user.email, email))
				.limit(1);
			if (byEmail[0]) {
				return c.json({ user: serializeUser(byEmail[0]), existed: true }, 200);
			}
			return c.json({ error: "Could not create user" }, 500);
		}
	} catch (err) {
		return c.json({ error: "Unexpected error" }, 500);
	}
});

export default onboarding;
