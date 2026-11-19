// Browser tests: open the demo pages in real browsers, press keys, and check
// the DOM (live region, focus, aria-label) and the gantt data. They do not
// check what a screen reader speaks.
import { defineConfig, devices } from "@playwright/test";

const PORT = 8181;
// On CI (GitHub Actions sets CI=true) the runners are slower than a developer's
// machine: one retry for a test that fails once, and more time per test.
const CI = !!process.env.CI;

export default defineConfig({
	testDir: "test-browser",
	timeout: CI ? 60000 : 30000,
	retries: CI ? 1 : 0,
	expect: { timeout: CI ? 10000 : 5000 },
	fullyParallel: true,
	// GitHub's macOS runners have 3 cores; the default (half of them) would be one worker
	workers: CI ? 3 : undefined,
	reporter: [["list"]],
	use: {
		baseURL: `http://127.0.0.1:${PORT}`,
		actionTimeout: 5000
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } }
	],
	webServer: {
		command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
		url: `http://127.0.0.1:${PORT}/demo/index.html`,
		reuseExistingServer: false,
		stdout: "ignore",
		stderr: "ignore"
	}
});
