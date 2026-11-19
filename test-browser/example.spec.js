// The minimal example in README.md (examples/minimal.html) works as written.
import { test, expect } from "@playwright/test";
import { expectFocusedLabel, expectLive, open } from "./helpers.js";

test("examples/minimal.html: Tab into the chart, Shift+D", async ({ page }) => {
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await open(page, "/examples/minimal.html");
	await expect.poll(async () => {
		await page.keyboard.press("Tab");
		return page.evaluate(() => document.activeElement.getAttribute("data-task-id"));
	}, { timeout: 10000 }).toBe("1");
	await expectFocusedLabel(page, "Design. 1 to 5 June, 4 days. 0 percent done.");
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on: Design. Required by: Test.");
	// README, step 5
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "Build depends on this. Design. 1 to 5 June, 4 days. 0 percent done.");
	expect(errors).toEqual([]);
});
