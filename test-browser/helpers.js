import { expect } from "@playwright/test";

/** Opens a page and waits until the extension has created its live region. */
export async function open(page, path = "/demo/index.html") {
	await page.goto(path);
	await page.waitForSelector("[data-gantt-a11y-live]", { state: "attached" });
}

/**
 * Moves keyboard focus to a task row through the public keyboard navigation
 * API and waits until the row element really has focus.
 * @param {string} [ganttName="gantt"]  global name of the gantt instance
 */
export async function focusTask(page, id, ganttName = "gantt") {
	await expect.poll(async () => page.evaluate(({ id, ganttName }) => {
		const g = window[ganttName];
		g.ext.keyboardNavigation.focus({ type: "taskRow", id });
		const node = g.ext.keyboardNavigation.getActiveNode();
		const active = document.activeElement;
		return !!node && String(node.id) === String(id) && !!active && active.getAttribute("data-task-id") === String(id);
	}, { id, ganttName }), { timeout: 5000 }).toBe(true);
}

/** The live region of the first (or n-th) extension instance on the page. */
export function liveRegion(page, index = 0) {
	return page.locator("[data-gantt-a11y-live]").nth(index);
}

/** Waits until the live region's text is `text` (whitespace normalised). */
export async function expectLive(page, text, index = 0) {
	await expect(liveRegion(page, index)).toHaveText(text);
}

/** aria-label of the focused element. */
export async function focusedLabel(page) {
	return page.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-label"));
}

/** Waits until the focused element's label is `text`. */
export async function expectFocusedLabel(page, text) {
	await expect.poll(() => focusedLabel(page)).toBe(text);
}

/** data-task-id of the focused element. */
export async function focusedTaskId(page) {
	return page.evaluate(() => document.activeElement && document.activeElement.getAttribute("data-task-id"));
}

/** A task's fields from the gantt data. */
export async function taskData(page, id, ganttName = "gantt") {
	return page.evaluate(({ id, ganttName }) => {
		const t = window[ganttName].getTask(id);
		return { text: t.text, start: t.start_date.getDate(), end: t.end_date.getDate(), duration: t.duration };
	}, { id, ganttName });
}

/** Waits for the time after which a burst of edits is over (1 s in the extension). */
export async function endBurst(page) {
	await page.waitForTimeout(1200);
}

/**
 * The first focus on a task after a page load gives "Press Shift H for keys."
 * 500 ms later (spec P30). For tests about something else: wait for it, then
 * empty the live region so that what follows starts from silence.
 * @param {{clock?: boolean}} [options]  clock: the test installed page.clock
 */
export async function waitOutHelpHint(page, { clock = false } = {}) {
	if (clock) {
		await page.clock.runFor(600);
	}
	await expectLive(page, "Press Shift H for keys.");
	await page.evaluate(() => {
		document.querySelectorAll("[data-gantt-a11y-live]").forEach((region) => { region.textContent = ""; });
	});
}
