// The same engine with the frappe-gantt adapter (demo/frappe.html).
// The adapter provides its own task list (role="listbox"), so focus is set
// by focusing an option, and keys are pressed on it.
import { test, expect } from "@playwright/test";
import { endBurst, expectFocusedLabel, expectLive, focusedTaskId, open } from "./helpers.js";

async function focusTask(page, id) {
	await page.locator(`[role="option"][data-task-id="${id}"]`).focus();
	await expect.poll(() => focusedTaskId(page)).toBe(id);
}

const task = (page, id) => page.evaluate((id) => {
	const t = window.frappeTasks.find((item) => item.id === id);
	return { start: t.start, end: t.end, dependencies: [].concat(t.dependencies || []) };
}, id);

test.beforeEach(async ({ page }) => {
	await open(page, "/demo/frappe.html");
});

test("the task list: roles, labels, arrows", async ({ page }) => {
	await expect(page.getByRole("listbox", { name: "Tasks" })).toHaveCount(1);
	await expect(page.getByRole("option")).toHaveCount(9);
	await focusTask(page, "test");
	await expectFocusedLabel(page, "Testing. 13 to 17 June, 5 days. 40 percent done.");
	await page.keyboard.press("ArrowDown");
	expect(await focusedTaskId(page)).toBe("marketing");
	await page.keyboard.press("ArrowUp");
	await page.keyboard.press("ArrowUp");
	expect(await focusedTaskId(page)).toBe("docs");
	await page.keyboard.press("Home");
	expect(await focusedTaskId(page)).toBe("design");
	await page.keyboard.press("End");
	expect(await focusedTaskId(page)).toBe("retro");
	await expect(page.locator('[role="option"][aria-selected="true"]')).toHaveAttribute("data-task-id", "retro");
});

test("the first focus on a task gives \"Press Shift H for keys.\" once", async ({ page }) => {
	await focusTask(page, "test");
	await expectLive(page, "Press Shift H for keys.");
});

test("dependencies with a second page, time questions", async ({ page }) => {
	await focusTask(page, "test");
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on: Implementation. Required by: Launch.");
	await page.keyboard.press("Shift+O");
	await expectLive(page, "2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days.");
	await page.keyboard.press("Shift+B");
	await expectLive(page, "4 tasks end before this starts. Nearest: Implementation, ends 12 June. Press again for the next 3.");

	await focusTask(page, "launch");
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on 4. First 3: Testing, Documentation, Code review. Press again for the next 1.");
	await page.keyboard.press("Shift+D");
	await expectLive(page, "4 of 4: Budget approval. End of list.");
});

test("jumps put the position before the option's label", async ({ page }) => {
	await focusTask(page, "launch");
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done.");
	expect(await focusedTaskId(page)).toBe("test");
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "2 of 4. Launch depends on this. Documentation. 5 to 14 June, 10 days. 0 percent done.");
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowUp");
	await expectFocusedLabel(page, "Documentation. 5 to 14 June, 10 days. 0 percent done.");
});

test("V1: after two jumps, the first option is not left with the message", async ({ page }) => {
	const label = (id) => page.locator(`[role="option"][data-task-id="${id}"]`).getAttribute("aria-label");
	await focusTask(page, "launch");
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done.");
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "2 of 4. Launch depends on this. Documentation. 5 to 14 June, 10 days. 0 percent done.");
	expect(await label("test")).toBe("Testing. 13 to 17 June, 5 days. 40 percent done.");
});

test("V1: a message that cannot land falls back to the live region", async ({ page }) => {
	// the application hides the target's option: focus cannot go there
	await page.evaluate(() => { document.querySelector('[role="option"][data-task-id="test"]').style.display = "none"; });
	await focusTask(page, "launch");
	await page.keyboard.press("Shift+P");
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveText("1 of 4. Launch depends on this.");
	expect(await focusedTaskId(page)).toBe("launch");
	expect(await page.locator('[role="option"][data-task-id="test"]').getAttribute("aria-label")).toBe("Testing. 13 to 17 June, 5 days. 40 percent done.");
});

test("keyboard edits change the chart's data and are announced", async ({ page }) => {
	await focusTask(page, "test");
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early.");
	expect(await task(page, "test")).toMatchObject({ start: "2026-06-14", end: "2026-06-18" });
	expect(await focusedTaskId(page)).toBe("test");
	await endBurst(page);
	await page.keyboard.press("Shift+I");
	await expectLive(page, "6 days. Ends Friday 19 June. Conflict. Launch is now 2 days too early.");
	expect((await task(page, "test")).end).toBe("2026-06-19");

	await focusTask(page, "budget");
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Read-only. Not changed.");
	expect((await task(page, "budget")).start).toBe("2026-06-02");
});

test("links: finish to start only, then removed after a jump", async ({ page }) => {
	await focusTask(page, "retro");
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Link from Retrospective. Go to the task that depends on it and press Shift L.");
	await page.keyboard.press("Shift+T");
	await focusTask(page, "marketing");
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Link not created. Not allowed here.");

	await focusTask(page, "marketing");
	await page.keyboard.press("Shift+L");
	await focusTask(page, "retro");
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Linked. This depends on Marketing.");
	expect((await task(page, "retro")).dependencies).toEqual(["marketing"]);

	await page.keyboard.press("Shift+P");
	await expect.poll(() => focusedTaskId(page)).toBe("marketing");
	await page.keyboard.press("Shift+U");
	await expectLive(page, "Press again to remove the link: Retrospective depends on this.");
	await page.keyboard.press("Shift+U");
	await expectLive(page, "Link removed. Retrospective no longer depends on this.");
	expect((await task(page, "retro")).dependencies).toEqual([]);
});

test("repeat, help and disable()", async ({ page }) => {
	await focusTask(page, "test");
	await page.keyboard.press("Shift+R");
	await expectLive(page, "Nothing to repeat.");
	await page.keyboard.press("Shift+H");
	await expectLive(page, "Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.");

	await page.click("#toggle");
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveCount(0);
	await expect(page.getByRole("listbox")).toHaveCount(0);
	await page.click("#toggle");
	await expect(page.getByRole("option")).toHaveCount(9);
});

test("enabling twice on one chart throws, as for dhtmlx; the same handle", async ({ page }) => {
	const result = await page.evaluate(async () => {
		const { enableFrappeGanttA11y } = await import("/src/index.js");
		try {
			enableFrappeGanttA11y(window.frappeGantt, { tasks: window.frappeTasks, listContainer: document.body });
			return "no error";
		} catch (error) {
			return error.message;
		}
	});
	expect(result).toBe("gantt-a11y: already enabled for this gantt instance");
	await expect(page.locator("[data-gantt-a11y-list]")).toHaveCount(1);
});
