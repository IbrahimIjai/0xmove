import { Hono } from 'hono'
import onboarding from './routes/onboarding';
import health from './routes/health';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route("/onboarding", onboarding);
app.route("/health", health);
export default app
