// The demo server (npm run demo): serves this folder on http://localhost:8080
// with Cache-Control: no-store, so that reloading a page always runs the
// current code. (A plain static server lets Safari keep JavaScript modules,
// and a reload could run an older version of the extension.)
import { serve } from "../audit/serve.js";

const port = Number(process.env.PORT) || 8080;

try {
	// "localhost" may be ::1 or 127.0.0.1; listen on both loopback addresses
	await serve(process.cwd(), { port, host: "127.0.0.1", noStore: true });
	await serve(process.cwd(), { port, host: "::1", noStore: true }).catch(() => {});
	console.log(`gantt-a11y demos: http://localhost:${port}/demo/index.html (no caching; Ctrl+C to stop)`);
} catch (error) {
	if (error.code === "EADDRINUSE") {
		console.error(`Port ${port} is in use: stop the other server first, or run PORT=8081 npm run demo`);
		process.exit(1);
	}
	throw error;
}
