// Cell navigation mode and two gantt instances on one page.
import { test, expect } from "@playwright/test";
import { expectLive, open } from "./helpers.js";

test("cell navigation: Shift+D works on an editable cell and does not open the inline editor", async ({ page }) => {
	await open(page, "/test-browser/fixtures/cells.html");
	await expect.poll(() => page.evaluate(() => {
		gantt.ext.keyboardNavigation.focus({ type: "taskCell", id: 2, column: "duration" });
		const node = gantt.ext.keyboardNavigation.getActiveNode();
		return !!node && node.type === "taskCell" && String(node.id) === "2";
	})).toBe(true);
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on: Design.");
	expect(await page.evaluate(() => gantt.ext.inlineEditors.isVisible())).toBe(false);
});

test("cell navigation: a keyboard edit is announced through the live region", async ({ page }) => {
	await open(page, "/test-browser/fixtures/cells.html");
	await expect.poll(() => page.evaluate(() => {
		gantt.ext.keyboardNavigation.focus({ type: "taskCell", id: 2, column: "text" });
		const node = gantt.ext.keyboardNavigation.getActiveNode();
		return !!node && node.type === "taskCell" && String(node.id) === "2";
	})).toBe(true);
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Starts Saturday 6 June, ends Sunday 14 June.");
});

test("two instances: each has its own region, keys and data", async ({ page }) => {
	await open(page, "/test-browser/fixtures/two.html");
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveCount(2);

	const focus = (name, id) => expect.poll(() => page.evaluate(({ name, id }) => {
		const g = window[name];
		g.ext.keyboardNavigation.focus({ type: "taskRow", id });
		const node = g.ext.keyboardNavigation.getActiveNode();
		return !!node && String(node.id) === String(id) && document.activeElement.getAttribute("data-task-id") === String(id);
	}, { name, id })).toBe(true);

	await focus("g1", 2);
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on: Alpha design.", 0);

	await focus("g2", 2);
	await page.keyboard.press("Shift+Y");
	await expectLive(page, "Depends on: Beta design.", 1);
	expect(await page.evaluate(() => !!window.g2.getShortcutHandler("shift+d", "taskRow"))).toBe(false);

	await page.evaluate(() => window.a1.disable());
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveCount(1);
	await page.keyboard.press("Shift+Y");
	await expectLive(page, "Depends on: Beta design.", 0);
});

test("cell navigation: a jump's result goes to the live region; column templates are not touched", async ({ page }) => {
	await open(page, "/demo/index.html?cells=1");
	const templates = () => page.evaluate(() => gantt.config.columns.map((column) => String(column.template)));
	const before = await templates();
	await expect.poll(() => page.evaluate(() => {
		gantt.ext.keyboardNavigation.focus({ type: "taskCell", id: 3, column: "text" });
		const node = gantt.ext.keyboardNavigation.getActiveNode();
		return !!node && node.type === "taskCell" && String(node.id) === "3";
	})).toBe(true);
	await page.keyboard.press("Shift+S");
	await expect.poll(() => page.evaluate(() => document.activeElement.closest("[data-task-id]").getAttribute("data-task-id"))).toBe("5");
	expect(await page.evaluate(() => document.activeElement.getAttribute("data-column-name"))).toBe("text");
	// the cell keeps its own name; the result comes after it, from the live region
	await expect.poll(() => page.evaluate(() => (document.activeElement.getAttribute("aria-label") || "").trim())).toBe("Documentation");
	await expectLive(page, "1 of 3, start to start. This depends on Implementation.");
	expect(await templates()).toEqual(before);
});
