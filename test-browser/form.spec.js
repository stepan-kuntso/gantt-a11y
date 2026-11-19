// The task form (lightbox): values while editing and the result after closing.
import { test, expect } from "@playwright/test";
import { expectFocusedLabel, expectLive, focusTask, open, taskData } from "./helpers.js";

const lightbox = (page) => page.locator(".gantt_cal_light");

/**
 * The library does not always move focus into the form when it opens
 * (measured without this extension too: Chromium 6 of 15, WebKit 10 of 15
 * openings). A user would then move into the dialog; the test does the same
 * and records the case, so the library's behaviour stays visible.
 */
async function intoForm(page) {
	const field = lightbox(page).locator("textarea");
	try {
		await expect(field).toBeFocused({ timeout: 1500 });
	} catch (error) {
		test.info().annotations.push({ type: "library", description: "form opened without focus in it; focused its first field" });
		await field.focus();
	}
}

async function openForm(page, id) {
	await focusTask(page, id);
	await page.keyboard.press("Enter");
	await expect(lightbox(page)).toBeVisible();
	await intoForm(page);
}

test.beforeEach(async ({ page }) => {
	await open(page);
});

test("a value while the form is open, then save with one change", async ({ page }) => {
	await openForm(page, 4);
	await lightbox(page).locator(".gantt_duration_inc").click();
	await expectLive(page, "Duration 6 days. Ends 19 June.");
	await lightbox(page).getByRole("button", { name: "Save" }).click();
	await expectFocusedLabel(page, "Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early. Testing. 13 to 19 June, 6 days. 40 percent done.");
	// heard first, and only once: nothing in the live region
	await page.waitForTimeout(800);
	await expect(page.locator("[data-gantt-a11y-live]")).not.toContainText("Saved.");
	expect((await taskData(page, 4)).duration).toBe(6);
});

test("save with three changes: field names, then the row label", async ({ page }) => {
	await openForm(page, 4);
	await lightbox(page).locator("textarea").fill("QA");
	await lightbox(page).locator("select").first().selectOption("15");
	await expectLive(page, "Start 15 June. Ends 20 June.");
	await lightbox(page).locator(".gantt_duration_dec").click();
	await expectLive(page, "Duration 4 days. Ends 19 June.");
	await lightbox(page).getByRole("button", { name: "Save" }).click();
	await expectFocusedLabel(page, "Saved, 3 changes: name, start, duration. Conflict. Launch is now 1 day too early. QA. 15 to 19 June, 4 days. 40 percent done.");
	expect(await taskData(page, 4)).toEqual({ text: "QA", start: 15, end: 19, duration: 4 });
});

test("save without changes, cancel with Escape", async ({ page }) => {
	await openForm(page, 4);
	await lightbox(page).getByRole("button", { name: "Save" }).click();
	await expectFocusedLabel(page, "Saved, no changes. Testing. 13 to 18 June, 5 days. 40 percent done.");

	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowUp");
	await openForm(page, 4);
	await page.keyboard.press("Escape");
	await expectFocusedLabel(page, "Cancelled. Nothing changed. Testing. 13 to 18 June, 5 days. 40 percent done.");
});

test("create and discard a new task", async ({ page }) => {
	await focusTask(page, 1);
	await page.keyboard.press("Control+Enter");
	await expect(lightbox(page)).toBeVisible();
	await lightbox(page).getByRole("button", { name: "Save" }).click();
	// the library focuses a new task's row while the form is open: the result comes through the live region
	await expectLive(page, "Created New task. New task. 1 to 2 June, 1 day. 0 percent done.");

	await focusTask(page, 1);
	await page.keyboard.press("Control+Enter");
	await expect(lightbox(page)).toBeVisible();
	await intoForm(page);
	await page.keyboard.press("Escape");
	// focus goes back to the row the task was created from, with the result first
	// (11 tasks: the one created and saved above is still there)
	await expectFocusedLabel(page, "New task discarded. Website redesign. Project, 1 to 23 June, 11 tasks. 0 percent done.");
});

test("delete, with links removed; a declined confirmation says nothing", async ({ page }) => {
	await openForm(page, 9);
	await lightbox(page).getByRole("button", { name: "Delete" }).click();
	await page.locator(".gantt_modal_box .gantt_cancel_button").click();
	await expect(lightbox(page)).toBeVisible();
	await lightbox(page).getByRole("button", { name: "Delete" }).click();
	await page.locator(".gantt_modal_box .gantt_ok_button").click();
	await expectLive(page, "Deleted Retrospective.");

	await openForm(page, 7);
	await lightbox(page).getByRole("button", { name: "Delete" }).click();
	await page.locator(".gantt_modal_box .gantt_ok_button").click();
	await expectLive(page, "Deleted Launch. 6 links removed.");
	expect(await page.evaluate(() => window.gantt.isTaskExists(7))).toBe(false);
});

test("B3: a created task that was saved, opened again and cancelled is not 'discarded'", async ({ page }) => {
	await focusTask(page, 1);
	await page.keyboard.press("Control+Enter");
	await expect(lightbox(page)).toBeVisible();
	await lightbox(page).getByRole("button", { name: "Save" }).click();
	await expect(lightbox(page)).toBeHidden();
	const id = await page.evaluate(() => document.activeElement.getAttribute("data-task-id"));
	await page.waitForTimeout(800);
	await focusTask(page, id);
	await page.keyboard.press("Enter");
	await expect(lightbox(page)).toBeVisible();
	await intoForm(page);
	await page.keyboard.press("Escape");
	await expect(lightbox(page)).toBeHidden();
	await expectFocusedLabel(page, "Cancelled. Nothing changed. New task. 1 to 2 June, 1 day. 0 percent done.");
	await page.waitForTimeout(800);
	await expect(page.locator("[data-gantt-a11y-live]")).not.toContainText("discarded");
	expect(await page.evaluate((id) => window.gantt.isTaskExists(id), id)).toBe(true);
});
