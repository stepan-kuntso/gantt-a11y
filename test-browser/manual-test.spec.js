// The manual test helper (demo/manual-test.html): every step can be prepared,
// focus goes back to the chart after an answer, F6 moves between the chart
// and the answer buttons, answers survive a reload, and the report has them.
import { test, expect } from "@playwright/test";

const chartFocus = (page) => page.evaluate(() => {
	const frame = document.getElementById("chart");
	if (document.activeElement !== frame) {
		return { outer: document.activeElement.id || document.activeElement.tagName };
	}
	const inner = frame.contentDocument.activeElement;
	const holder = inner.closest("[data-task-id]");
	return { task: holder ? holder.getAttribute("data-task-id") : null, label: inner.getAttribute("aria-label") };
});

const ready = (page, previous = "") => page.waitForFunction((previous) => {
	const id = document.getElementById("step-id").textContent;
	return id !== previous && /^Focus is on/.test(document.getElementById("start").textContent);
}, previous, { timeout: 15000 });

test.beforeEach(async ({ page }) => {
	await page.goto("/demo/manual-test.html");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await ready(page);
});

test("answers move to the next step with focus on its task, and go into the report", async ({ page }) => {
	const first = await page.textContent("#step-id");
	expect(await chartFocus(page)).toMatchObject({ task: expect.any(String) });

	await page.keyboard.press("F6");
	expect(await chartFocus(page)).toEqual({ outer: "btn-match" });
	await page.keyboard.press("Enter");
	await ready(page, first);
	const second = await page.textContent("#step-id");
	const expectedTask = await page.evaluate(() => {
		const item = window.manualTest.ordered[window.manualTest.state.index].item;
		return String(typeof item.focus === "object" ? item.focus.id : item.focus);
	});
	expect((await chartFocus(page)).task).toBe(expectedTask);

	await page.fill("#heard", "something else");
	await page.check('input[name="clarity"][value="confusing"]');
	await page.focus("#btn-mismatch");
	await page.keyboard.press("Enter");
	await ready(page, second);

	await page.reload();
	await ready(page);
	const total = await page.evaluate(() => window.manualTest.ordered.length);
	await expect(page.locator("#answered")).toHaveText(`2 of ${total} answered.`);
	await page.click("#btn-report");
	const report = await page.inputValue("#report");
	expect(report).toContain(`1 matched, 1 did not match, 0 skipped, ${total - 2} not done.`);
	expect(report).toContain("Heard: “something else”");
	expect(report).toContain("by ear: confusing");
});

test("F6 and the button go back to the chart without reloading it", async ({ page }) => {
	const before = await chartFocus(page);
	await page.keyboard.press("F6");
	await page.keyboard.press("F6");
	await expect.poll(() => chartFocus(page)).toEqual(before);
	await page.keyboard.press("F6");
	await page.click("#btn-chart");
	await expect.poll(() => chartFocus(page)).toEqual(before);
});

test("every step can be prepared", async ({ page }) => {
	test.setTimeout(300000);
	const total = await page.evaluate(() => window.manualTest.ordered.length);
	for (let i = 1; i < total; i++) {
		const previous = await page.textContent("#step-id");
		await page.click("#btn-skip");
		await ready(page, previous);
		await expect(page.locator("#error")).toBeHidden();
		const expected = await page.evaluate(() => {
			const item = window.manualTest.ordered[window.manualTest.state.index].item;
			return String(typeof item.focus === "object" ? item.focus.id : item.focus);
		});
		expect((await chartFocus(page)).task, await page.textContent("#step-id")).toBe(expected);
	}
});

test("new steps come right after the steps to check first", async ({ page }) => {
	const groups = await page.evaluate(() => window.manualTest.ordered.map((o) => o.group.key));
	const firstNew = groups.indexOf("new");
	expect(firstNew).toBeGreaterThan(0);
	expect(groups.slice(0, firstNew).every((key) => key === "first")).toBe(true);
	expect(groups.slice(firstNew).filter((key) => key === "new").length).toBe(groups.filter((key) => key === "new").length);
});
