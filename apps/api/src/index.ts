import { Hono } from "hono";
import onboarding from "./routes/onboarding";
import health from "./routes/health";

const app = new Hono();

const welcomeStrings = [
	"Hello Hono!",
	"To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

app.get("/", (c) => {
	return c.text(welcomeStrings.join("\n\n"));
});

app.route("/onboarding", onboarding);
app.route("/health", health);

export default app;
