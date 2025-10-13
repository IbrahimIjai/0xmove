import { sql } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	bigint as pgBigInt,
} from "drizzle-orm/pg-core";
import { pgEnum, index } from "drizzle-orm/pg-core";

// Enums for transactions
export const currencyEnum = pgEnum("currency", ["NGN", "KES", "USDC", "USDT"]);
export const txStatusEnum = pgEnum("tx_status", [
	"pending",
	"success",
	"failed",
	"reversed",
]);
export const txDirectionEnum = pgEnum("tx_direction", ["credit", "debit"]);
export const providerEnum = pgEnum("provider", [
	"paystack",
	"system",
	"manual",
]);

// Simplified MVP user schema
// - address, email, username
// - kyc (true by default)
// - balances in minor units (cents/kobo) to avoid floating point issues
export const user = pgTable("user", {
	id: text("id").primaryKey(),

	// Web3 or unique user address (EVM): TS type narrowed to `0x${string}`
	// Store lowercase in app logic to ensure case-insensitive uniqueness.
	address: text("address").$type<`0x${string}`>().notNull().unique(),

	email: text("email").notNull().unique(),
	username: text("username").notNull().unique(),

	// KYC flag (MVP defaults to true)
	kyc: boolean("kyc").default(true).notNull(),

	// Balances stored in smallest units (e.g., kobo/cents) as 64-bit integers
	ngnBalance: pgBigInt("ngn_balance", { mode: "bigint" })
		.notNull()
		.default(sql`0`),
	kesBalance: pgBigInt("kes_balance", { mode: "bigint" })
		.notNull()
		.default(sql`0`),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

// Transactions ledger table suited for Paystack integration
// - amount: minor units (kobo/cents)
// - currency: NGN/KES/etc.
// - direction: credit (inflow) or debit (outflow)
// - status: pending/success/failed/reversed
// - provider: paystack/system/manual
// - providerRef: reference from the payment provider (e.g., Paystack reference)
// - metadata: optional JSON string for extra details
export const transactions = pgTable(
	"transactions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		amount: pgBigInt("amount", { mode: "bigint" }).notNull(),
		currency: currencyEnum("currency").notNull(),
		direction: txDirectionEnum("direction").notNull(),
		status: txStatusEnum("status").notNull().default("pending"),
		provider: providerEnum("provider").notNull().default("paystack"),
		providerRef: text("provider_ref"),
		description: text("description"),
		metadata: text("metadata"),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(t) => ({
		// Fast lookups for reconciliation (providerRef may be nullable; use non-unique index)
		providerRefIdx: index("transactions_provider_ref_idx").on(t.providerRef),
		userCreatedIdx: index("transactions_user_created_idx").on(
			t.userId,
			t.createdAt,
		),
	}),
);
