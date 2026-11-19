// The adapters' own delays, with a controlled clock (Playwright page.clock):
// nothing before the delay, the text after it. And disable() while a message
// is still waiting.
import { test, expect } from "@playwright/test";
import { expectFocusedLabel, focusTask, open } from "./helpers.js";

const live = (page) => page.locator("[data-gantt-a11y-live]");
const liveText = (page) => live(page).evaluate((element) => element.textContent.trim());

/** Opens a page with a controllable clock; time still flows until pause(). */
async function openPaused(page, path) {
	await page.clock.install();
	await open(page, path);
}

/** Stops the clock (after focus is set: the library's keyboard navigation uses timers), so that only runFor moves time. */
async function pause(page) {
	const now = await page.evaluate(() => Date.now());
	// a margin: time keeps flowing until the call reaches the page
	await page.clock.pauseAt(now + 1000);
}

/** Expects the live region empty just before `ms`, and `text` just after. */
async function expectLiveAfter(page, ms, text) {
	await page.clock.runFor(ms - 30);
	expect(await liveText(page)).toBe("");
	await page.clock.runFor(60);
	expect(await liveText(page)).toBe(text);
}

test("an answer is in the live region 100 ms after the key", async ({ page }) => {
	await openPaused(page);
	await focusTask(page, 4);
	await pause(page);
	await page.keyboard.press("Shift+D");
	await expectLiveAfter(page, 100, "Depends on: Implementation. Required by: Launch.");
});

test("a keyboard edit result waits 500 ms more", async ({ page }) => {
	await openPaused(page);
	await focusTask(page, 4);
	await pause(page);
	await page.keyboard.press("Shift+K");
	await expectLiveAfter(page, 600, "Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.");
});

test("with the tooltip plugin, a jump result comes 500 ms after the jump", async ({ page }) => {
	await openPaused(page, "/test-browser/fixtures/tooltip.html");
	await focusTask(page, 2);
	await pause(page);
	await page.keyboard.press("Shift+P");
	await expectLiveAfter(page, 600, "Build depends on this.");
});

test("dates in the open form are spoken 350 ms after the last change", async ({ page }) => {
	await openPaused(page);
	await focusTask(page, 4);
	await page.keyboard.press("Enter");
	await expect(page.locator(".gantt_cal_light")).toBeVisible();
	await pause(page);
	await page.locator(".gantt_cal_light .gantt_duration_inc").click();
	await expectLiveAfter(page, 450, "Duration 6 days. Ends 19 June.");
});

test("frappe: a message that does not land is spoken after 600 ms", async ({ page }) => {
	await openPaused(page, "/demo/frappe.html");
	await page.evaluate(() => { document.querySelector('[role="option"][data-task-id="test"]').style.display = "none"; });
	await page.locator('[role="option"][data-task-id="launch"]').focus();
	await pause(page);
	await page.keyboard.press("Shift+P");
	await expectLiveAfter(page, 700, "1 of 4. Launch depends on this.");
});

test("frappe: a message stays 5 seconds after landing", async ({ page }) => {
	await openPaused(page, "/demo/frappe.html");
	await page.locator('[role="option"][data-task-id="launch"]').focus();
	await pause(page);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done.");
	await page.clock.runFor(4900);
	await expectFocusedLabel(page, "1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done.");
	await page.clock.runFor(200);
	await expectFocusedLabel(page, "Testing. 13 to 17 June, 5 days. 40 percent done.");
});

test("disable() while a row message and an edit result are waiting", async ({ page }) => {
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await openPaused(page);
	await focusTask(page, 7);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done.");
	await pause(page);
	await page.keyboard.press("Shift+K"); // its result waits 600 ms
	await page.evaluate(() => document.getElementById("toggle").click());
	await expect(live(page)).toHaveCount(0);
	// the template and the row are back to the library's own
	const label = await page.evaluate(() => {
		const t = window.gantt.getTask(4);
		return window.gantt.templates.tooltip_text(t.start_date, t.end_date, t);
	});
	expect(label).not.toContain("Launch depends on this");
	await page.clock.runFor(10000);
	expect(await page.evaluate(() => document.querySelectorAll("[data-gantt-a11y-live]").length)).toBe(0);
	expect(errors).toEqual([]);
});
