// B2: what an application's onBefore* handlers refuse is not announced as
// done, and the extension does not change task data before the library
// allows it.
import { test, expect } from "@playwright/test";
import { expectFocusedLabel, expectLive, focusTask, liveRegion, open, taskData } from "./helpers.js";

const lightbox = (page) => page.locator(".gantt_cal_light");

async function openForm(page, id) {
	await focusTask(page, id);
	await page.keyboard.press("Enter");
	await expect(lightbox(page)).toBeVisible();
	const field = lightbox(page).locator("textarea");
	try {
		await expect(field).toBeFocused({ timeout: 1500 });
	} catch (error) {
		await field.focus();
	}
}

/** Attaches a handler that refuses an event, in the page. */
const refuse = (page, event) => page.evaluate((event) => window.gantt.attachEvent(event, () => false), event);

test.beforeEach(async ({ page }) => {
	await open(page);
});

test("a move refused in onBeforeTaskUpdate: data unchanged, refusal spoken", async ({ page }) => {
	await refuse(page, "onBeforeTaskUpdate");
	await focusTask(page, 4);
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Not changed. The change was not accepted.");
	expect(await taskData(page, 4)).toEqual({ text: "Testing", start: 13, end: 18, duration: 5 });
});

test("a duration change refused in onBeforeTaskUpdate: data unchanged, refusal spoken", async ({ page }) => {
	await refuse(page, "onBeforeTaskUpdate");
	await focusTask(page, 4);
	await page.keyboard.press("Shift+I");
	await expectLive(page, "Not changed. The change was not accepted.");
	expect((await taskData(page, 4)).duration).toBe(5);
});

test("the task object is not changed before onBeforeTaskUpdate", async ({ page }) => {
	await page.evaluate(() => {
		window.seen = [];
		window.gantt.attachEvent("onBeforeTaskUpdate", (id, item) => {
			// what is stored at this moment, and what is asked for
			window.seen.push({ stored: window.gantt.getTask(id).start_date.getDate(), asked: item.start_date.getDate() });
			return true;
		});
	});
	await focusTask(page, 4);
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.");
	expect(await page.evaluate(() => window.seen)).toEqual([{ stored: 13, asked: 14 }]);
});

test("a link refused in onBeforeLinkAdd is not announced as created", async ({ page }) => {
	await refuse(page, "onBeforeLinkAdd");
	const count = await page.evaluate(() => window.gantt.getLinks().length);
	await focusTask(page, 6);
	await page.keyboard.press("Shift+L");
	await focusTask(page, 10);
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Link not created.");
	expect(await page.evaluate(() => window.gantt.getLinks().length)).toBe(count);
});

test("a link removal refused in onBeforeLinkDelete is not announced as done", async ({ page }) => {
	await refuse(page, "onBeforeLinkDelete");
	await focusTask(page, 4);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.");
	await page.keyboard.press("Shift+U");
	await expectLive(page, "Press again to remove the link: Testing depends on this.");
	await page.keyboard.press("Shift+U");
	await expectLive(page, "Link not removed.");
	expect(await page.evaluate(() => window.gantt.getLinks().some((l) => String(l.source) === "3" && String(l.target) === "4"))).toBe(true);
});

test("a save refused in onLightboxSave: the form stays open and nothing is announced", async ({ page }) => {
	await refuse(page, "onLightboxSave");
	await openForm(page, 4);
	await lightbox(page).locator(".gantt_duration_inc").click();
	await expectLive(page, "Duration 6 days. Ends 19 June.");
	await lightbox(page).getByRole("button", { name: "Save" }).click();
	await page.waitForTimeout(1000);
	await expect(lightbox(page)).toBeVisible();
	await expect(liveRegion(page)).toHaveText("Duration 6 days. Ends 19 June.");
	expect((await taskData(page, 4)).duration).toBe(5);
	// cancelling afterwards says what happened: nothing changed
	await page.keyboard.press("Escape");
	await expectFocusedLabel(page, "Cancelled. Nothing changed. Testing. 13 to 18 June, 5 days. 40 percent done.");
	expect((await taskData(page, 4)).duration).toBe(5);
});

test("form save with onBeforeTaskUpdate refusing: what is announced is what is stored", async ({ page }) => {
	await refuse(page, "onBeforeTaskUpdate");
	await openForm(page, 4);
	await lightbox(page).locator(".gantt_duration_inc").click();
	await expectLive(page, "Duration 6 days. Ends 19 June.");
	await lightbox(page).getByRole("button", { name: "Save" }).click();
	await expect(lightbox(page)).toBeHidden();
	const stored = (await taskData(page, 4)).duration;
	// the library's form writes the values into the task before updateTask, so a
	// refusal in onBeforeTaskUpdate does not undo them (library behaviour)
	if (stored === 6) {
		await expectFocusedLabel(page, "Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early. Testing. 13 to 19 June, 6 days. 40 percent done.");
	} else {
		await expect.poll(() => page.evaluate(() => document.activeElement.getAttribute("aria-label"))).not.toContain("Saved. Duration 6 days");
	}
	test.info().annotations.push({ type: "library", description: `duration stored after a refused onBeforeTaskUpdate in the form: ${stored}` });
});
