// Every command in the key table, on the demo page, with real key presses.
import { test, expect } from "@playwright/test";
import { endBurst, expectFocusedLabel, expectLive, focusTask, focusedTaskId, open, taskData } from "./helpers.js";

test.beforeEach(async ({ page }) => {
	await open(page);
});

test("row labels (features.rowLabel)", async ({ page }) => {
	await focusTask(page, 4);
	await expectFocusedLabel(page, "Testing. 13 to 18 June, 5 days. 40 percent done.");
	await focusTask(page, 10);
	await expectFocusedLabel(page, "Go-live. Milestone, 20 June.");
	await focusTask(page, 1);
	await expectFocusedLabel(page, "Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.");
});

test("Shift+D: dependencies, a second page, then from the start", async ({ page }) => {
	await focusTask(page, 4);
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on: Implementation. Required by: Launch.");

	await focusTask(page, 7);
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.");
	await page.keyboard.press("Shift+D");
	await expectLive(page, "4 and 5 of 5: Software design, Budget approval. End of list.");
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.");

	await focusTask(page, 9);
	await page.keyboard.press("Shift+D");
	await expectLive(page, "No dependencies.");
});

test("Shift+O, Shift+B, Shift+A with pages", async ({ page }) => {
	await focusTask(page, 4);
	await page.keyboard.press("Shift+O");
	await expectLive(page, "2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.");
	await page.keyboard.press("Shift+B");
	await expectLive(page, "4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3.");
	await page.keyboard.press("Shift+B");
	await expectLive(page, "2 to 4 of 4: Code review, Software design, Budget approval. End of list.");
	await page.keyboard.press("Shift+A");
	await expectLive(page, "3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2.");
	await page.keyboard.press("Shift+A");
	await expectLive(page, "2 and 3 of 3: Go-live, Retrospective. End of list.");
});

test("Shift+S and Shift+P move focus and put the position before the row label", async ({ page }) => {
	await focusTask(page, 3);
	await page.keyboard.press("Shift+S");
	await expectFocusedLabel(page, "1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done.");
	expect(await focusedTaskId(page)).toBe("5");
	await page.keyboard.press("Shift+S");
	await expectFocusedLabel(page, "2 of 3, finish to finish. This depends on Implementation. Code review. 8 to 13 June, 5 days. 0 percent done.");
	await page.keyboard.press("Shift+S");
	await expectFocusedLabel(page, "3 of 3. This depends on Implementation. Testing. 13 to 18 June, 5 days. 40 percent done.");

	await focusTask(page, 4);
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.");
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done.");
	await page.keyboard.press("Shift+P");
	await expectLive(page, "Depends on nothing.");
	expect(await focusedTaskId(page)).toBe("2");
});

test("the row label returns to normal when focus leaves the row", async ({ page }) => {
	await focusTask(page, 3);
	await page.keyboard.press("Shift+S");
	await expectFocusedLabel(page, "1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done.");
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowUp");
	await expectFocusedLabel(page, "Documentation. 5 to 15 June, 10 days. 0 percent done.");
});

test("Shift+J, K, I and M change the data; the result goes to the live region, the row keeps its own label", async ({ page }) => {
	await focusTask(page, 4);
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.");
	expect(await taskData(page, 4)).toEqual({ text: "Testing", start: 14, end: 19, duration: 5 });
	// not read twice: the row label is the task's own label with the new dates
	await expectFocusedLabel(page, "Testing. 14 to 19 June, 5 days. 40 percent done.");

	await endBurst(page);
	await page.keyboard.press("Shift+I");
	await expectLive(page, "6 days. Ends Saturday 20 June. Conflict. Launch is now 2 days too early.");
	expect((await taskData(page, 4)).duration).toBe(6);

	await endBurst(page);
	await page.keyboard.press("Shift+M");
	await expectLive(page, "5 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early.");

	await endBurst(page);
	await page.keyboard.press("Shift+J");
	await expectLive(page, "Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved.");
	expect(await taskData(page, 4)).toEqual({ text: "Testing", start: 13, end: 18, duration: 5 });
});

test("a burst of quick presses is spoken as one running total", async ({ page }) => {
	// A burst lasts 1 second from the last press. With a real clock, waiting for
	// the first result could take longer than that on a busy machine and start a
	// new burst, so the clock is controlled: only runFor moves time.
	await page.clock.install();
	await open(page);
	await focusTask(page, 4);
	await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1000);
	await page.keyboard.press("Shift+J");
	await page.keyboard.press("Shift+J");
	await page.keyboard.press("Shift+J");
	await page.clock.runFor(700); // the result waits 600 ms
	await expectLive(page, "3 days earlier. Starts Wednesday 10 June, ends Monday 15 June. Conflict. 3 days too early for Implementation.");
	expect((await taskData(page, 4)).start).toBe(10);
	// 700 ms after the last press: still the same burst
	await page.keyboard.press("Shift+K");
	await page.keyboard.press("Shift+K");
	await page.keyboard.press("Shift+K");
	await page.clock.runFor(700);
	await expectLive(page, "Back where it started. 13 to 18 June. Conflict resolved.");
});

test("edits are refused for read-only tasks, projects, milestone duration, the minimum", async ({ page }) => {
	await focusTask(page, 11);
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Read-only. Not changed.");
	expect((await taskData(page, 11)).start).toBe(2);

	await focusTask(page, 1);
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Not changed. A project takes its dates from its subtasks.");

	await focusTask(page, 10);
	await page.keyboard.press("Shift+I");
	await expectLive(page, "A milestone has no duration.");

	await focusTask(page, 7);
	await page.keyboard.press("Shift+M");
	await expectLive(page, "Already 1 day, the minimum.");
	expect((await taskData(page, 7)).duration).toBe(1);
});

test("gantt.config.readonly blocks every edit", async ({ page }) => {
	await page.evaluate(() => { window.gantt.config.readonly = true; });
	await focusTask(page, 4);
	await page.keyboard.press("Shift+K");
	await expectLive(page, "Read-only. Not changed.");
	expect((await taskData(page, 4)).start).toBe(13);
	await page.keyboard.press("Shift+L");
	await focusTask(page, 9);
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Read-only. Not changed.");
});

test("Shift+L, Shift+T, Shift+U: links", async ({ page }) => {
	const linkExists = (source, target) => page.evaluate(({ source, target }) =>
		window.gantt.getLinks().some((l) => String(l.source) === String(source) && String(l.target) === String(target)), { source, target });

	await focusTask(page, 6);
	await page.keyboard.press("Shift+T");
	await expectLive(page, "No task marked for a link. Press Shift L on a task first.");
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Link from Code review. Go to the task that depends on it and press Shift L.");
	await page.keyboard.press("Shift+T");
	await expectLive(page, "Type: start to start.");
	await focusTask(page, 9);
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Linked. This depends on Code review, start to start.");
	expect(await linkExists(6, 9)).toBe(true);

	await focusTask(page, 3);
	await page.keyboard.press("Shift+L");
	await focusTask(page, 4);
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Link not created. This already depends on Implementation.");

	await focusTask(page, 7);
	await page.keyboard.press("Shift+L");
	await focusTask(page, 2);
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Link not created. It would make a loop: Launch already depends on this.");
	expect(await linkExists(7, 2)).toBe(false);

	await focusTask(page, 5);
	await page.keyboard.press("Shift+L");
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Link cancelled.");

	await focusTask(page, 4);
	await page.keyboard.press("Shift+U");
	await expectLive(page, "Nothing to remove. First go to a linked task with the go-to keys.");
	await page.keyboard.press("Shift+P");
	await expectFocusedLabel(page, "Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.");
	await page.keyboard.press("Shift+U");
	await expectLive(page, "Press again to remove the link: Testing depends on this.");
	expect(await linkExists(3, 4)).toBe(true);
	await page.keyboard.press("Shift+U");
	await expectLive(page, "Link removed. Testing no longer depends on this.");
	expect(await linkExists(3, 4)).toBe(false);
});

test("a read-only task cannot be linked", async ({ page }) => {
	await focusTask(page, 11);
	await page.keyboard.press("Shift+L");
	await focusTask(page, 9);
	await page.keyboard.press("Shift+L");
	await expectLive(page, "Read-only. Not changed.");
});

test("Shift+R repeats; Shift+H speaks the keys in groups", async ({ page }) => {
	await focusTask(page, 4);
	await page.keyboard.press("Shift+R");
	await expectLive(page, "Nothing to repeat.");
	await page.keyboard.press("Shift+D");
	await expectLive(page, "Depends on: Implementation. Required by: Launch.");
	await page.keyboard.press("Shift+R");
	await expectLive(page, "Depends on: Implementation. Required by: Launch.");

	await page.keyboard.press("Shift+H");
	await expectLive(page, "Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key.");
	await page.keyboard.press("Shift+H");
	await expectLive(page, "Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.");
	await page.keyboard.press("Shift+H");
	await expectLive(page, "Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.");
	await page.keyboard.press("Shift+H");
	await expectLive(page, "Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.");
	await page.keyboard.press("Shift+H");
	await expectLive(page, "Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key.");
	await page.keyboard.press("Shift+H");
	await expectLive(page, "Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key.");
});

test("disable() removes keys, labels, templates and the live region", async ({ page }) => {
	const original = await page.evaluate(() => window.gantt.templates.tooltip_text.toString().slice(0, 60));
	await page.click("#toggle");
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveCount(0);
	const state = await page.evaluate(() => {
		const keys = ["shift+d", "shift+o", "shift+b", "shift+a", "shift+p", "shift+s", "shift+j", "shift+k",
			"shift+i", "shift+m", "shift+l", "shift+t", "shift+u", "shift+r", "shift+h"];
		return {
			handlers: keys.filter((key) => window.gantt.getShortcutHandler(key, "taskRow") || window.gantt.getShortcutHandler(key, "taskCell")),
			template: window.gantt.templates.tooltip_text.toString().slice(0, 60)
		};
	});
	expect(state.handlers).toEqual([]);
	expect(state.template).not.toBe(original);
	await focusTask(page, 4);
	const label = await page.evaluate(() => document.activeElement.getAttribute("aria-label"));
	expect(label).toContain("Task: Testing");
	await page.keyboard.press("Shift+K");
	await page.waitForTimeout(300);
	expect((await taskData(page, 4)).start).toBe(13);

	await page.click("#toggle");
	await expect(page.locator("[data-gantt-a11y-live]")).toHaveCount(1);
	await focusTask(page, 4);
	await expectFocusedLabel(page, "Testing. 13 to 18 June, 5 days. 40 percent done.");
});
