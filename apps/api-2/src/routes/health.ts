import { Hono } from "hono";
import { db } from "../db/drizzle";
import { sql } from "drizzle-orm";

const health = new Hono();

// Liveness: cheap and fast. Should not depend on external services.
health.get("/", (c) => {
	const payload = {
		status: "ok" as const,
		uptimeSec: Math.round(process.uptime()),
		timestamp: new Date().toISOString(),
		env: process.env.NODE_ENV || "development",
	};
	return c.json(payload, 200);
});

// Readiness: checks dependencies (e.g., database). Returns 503 if not ready.
health.get("/ready", async (c) => {
	// Timebox the DB check so it doesn't hang the probe
	const dbOk = await Promise.race<boolean>([
		db
			.execute(sql`select 1 as ok`)
			.then(() => true)
			.catch(() => false),
		new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 800)),
	]);

	const ready = dbOk;
	const payload = {
		status: ready ? ("ok" as const) : ("degraded" as const),
		dependencies: { db: dbOk ? "ok" : "down" },
		uptimeSec: Math.round(process.uptime()),
		timestamp: new Date().toISOString(),
	};

	return c.json(payload, ready ? 200 : 503);
});

export default health;
