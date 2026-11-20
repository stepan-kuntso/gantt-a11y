// The temporary row label (src/adapters/dhtmlx/focus-label.js): a message is
// put before a task row's label through gantt.templates.tooltip_text, a
// template the library, its tooltip plugin and the application share.
import { test, expect } from "@playwright/test";
import { expectFocusedLabel, focusTask, open, waitOutHelpHint } from "./helpers.js";

/** Page errors and console errors, collected for the whole test. */
function collectErrors(page) {
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
	return errors;
}

/** The row label the template gives a task now. */
const templateLabel = (page, id) => page.evaluate((id) => {
	const t = window.gantt.getTask(id);
	return window.gantt.templates.tooltip_text(t.start_date, t.end_date, t);
}, id);

/** The application wraps the template, as code that adds to tooltips does. */
const wrapTemplate = (page) => page.evaluate(() => {
	const previous = window.gantt.templates.tooltip_text;
	window.gantt.templates.tooltip_text = function () {
		return previous.apply(this, arguments);
	};
});

test.beforeEach(async ({ page }) => {
	await open(page);
});

test("B1: the application wraps the template while a message is pending", async ({ page }) => {
	const errors = collectErrors(page);
	await focusTask(page, 7);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done.");
	await wrapTemplate(page);
	// focus leaves the row: the message is removed
	await page.keyboard.press("ArrowUp");
	await expect.poll(() => templateLabel(page, 4)).toBe("Testing. 13 to 18 June, 5 days. 40 percent done.");
	// and the mechanism still works afterwards, with the message once
	await focusTask(page, 7);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done.");
	await page.keyboard.press("ArrowUp");
	await expect.poll(() => templateLabel(page, 4)).toBe("Testing. 13 to 18 June, 5 days. 40 percent done.");
	expect(errors).toEqual([]);
});

test("B1: disable() after the application wrapped the template", async ({ page }) => {
	const errors = collectErrors(page);
	await focusTask(page, 7);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done.");
	await wrapTemplate(page);
	await page.evaluate(() => document.getElementById("toggle").click());
	// the application's wrapper stays; under it, the library's own label
	const label = await templateLabel(page, 4);
	expect(label).not.toContain("Launch depends on this");
	expect(label).toContain("Testing");
	await page.evaluate(() => window.gantt.render());
	expect(errors).toEqual([]);
});

test("B4: a jump to a filtered-out task says only that focus did not move", async ({ page }) => {
	const errors = collectErrors(page);
	await page.evaluate(() => {
		window.gantt.attachEvent("onBeforeTaskDisplay", (id) => String(id) !== "3");
		window.gantt.refreshData();
	});
	await focusTask(page, 4);
	await page.keyboard.press("Shift+P");
	const live = page.locator("[data-gantt-a11y-live]");
	await expect(live).toHaveText("Implementation is filtered out. Focus did not move.");
	// longer than the time the row label waits for focus to land
	await page.waitForTimeout(1500);
	await expect(live).toHaveText("Implementation is filtered out. Focus did not move.");
	expect(await page.evaluate(() => document.activeElement.getAttribute("data-task-id"))).toBe("4");
	// nothing is left waiting in the target's label
	expect(await templateLabel(page, 3)).toBe("Implementation. 5 to 13 June, 8 days. 0 percent done.");
	expect(errors).toEqual([]);
});

const LANDED = "1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done.";
const PLAIN = "Testing. 13 to 18 June, 5 days. 40 percent done.";

test("V2: focus leaves the row for another element and comes back: the normal label, nothing spoken again", async ({ page }) => {
	await focusTask(page, 7);
	await waitOutHelpHint(page);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, LANDED);
	await page.evaluate(() => {
		window.row = document.activeElement;
		document.getElementById("toggle").focus();
	});
	await page.waitForTimeout(1500);
	// the message was heard when focus landed: it is not spoken again
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveText("");
	await focusTask(page, 4);
	await expectFocusedLabel(page, PLAIN);
});

test("V2: another window: the message goes", async ({ page }) => {
	await focusTask(page, 7);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, LANDED);
	await page.evaluate(() => window.dispatchEvent(new Event("blur")));
	await expectFocusedLabel(page, PLAIN);
});

test("V2: a blur the library turns back into focus on the row: not spoken again, gone later", async ({ page }) => {
	await page.clock.install();
	await open(page);
	await focusTask(page, 7);
	await waitOutHelpHint(page, { clock: true });
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, LANDED);
	await page.evaluate(() => document.activeElement.blur());
	await page.clock.runFor(1500);
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveText("");
	expect(await page.evaluate(() => document.activeElement.getAttribute("data-task-id"))).toBe("4");
	await page.clock.runFor(4000);
	await expectFocusedLabel(page, PLAIN);
});

test("V2: the message goes a few seconds after focus landed, focus staying on the row", async ({ page }) => {
	await page.clock.install();
	await open(page);
	await focusTask(page, 7);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, LANDED);
	await page.clock.runFor(2000);
	expect(await page.evaluate(() => document.activeElement.getAttribute("aria-label"))).toBe(LANDED);
	await page.clock.runFor(4000);
	await expectFocusedLabel(page, PLAIN);
	expect(await page.evaluate(() => document.activeElement.getAttribute("data-task-id"))).toBe("4");
});

test("V2: a form result in the row label is followed by the task's own label", async ({ page }) => {
	await focusTask(page, 4);
	await page.keyboard.press("Enter");
	await expect(page.locator(".gantt_cal_light")).toBeVisible();
	await page.locator(".gantt_cal_light textarea").focus();
	await page.keyboard.press("Escape");
	await expectFocusedLabel(page, "Cancelled. Nothing changed. " + PLAIN);
});

test("V3: with the tooltip plugin, a sighted user never sees the message; it is spoken through the live region", async ({ page }) => {
	await open(page, "/test-browser/fixtures/tooltip.html");
	await focusTask(page, 2);
	await page.keyboard.press("Shift+P");
	await expect.poll(() => page.evaluate(() => document.activeElement.getAttribute("data-task-id"))).toBe("1");
	// the template, and so the tooltip, has only the library's own text
	expect(await templateLabel(page, 1)).not.toContain("depends on this");
	// the plugin shows its tooltip on mouse movement over the bar
	const bar = page.locator('.gantt_task_line[data-task-id="1"]');
	await expect.poll(async () => {
		await bar.hover({ position: { x: 5, y: 5 } });
		await bar.hover({ position: { x: 15, y: 8 } });
		return page.locator(".gantt_tooltip").isVisible();
	}, { timeout: 10000 }).toBe(true);
	await expect(page.locator(".gantt_tooltip")).not.toContainText("depends on this");
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveText("Build depends on this.");
});

test("V3: with the tooltip plugin, a form result comes through the live region only", async ({ page }) => {
	await open(page, "/test-browser/fixtures/tooltip.html");
	await focusTask(page, 2);
	await page.keyboard.press("Enter");
	await expect(page.locator(".gantt_cal_light")).toBeVisible();
	await page.locator(".gantt_cal_light textarea").focus();
	await page.keyboard.press("Escape");
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveText("Cancelled. Nothing changed.");
	expect(await templateLabel(page, 2)).not.toContain("Cancelled");
});
