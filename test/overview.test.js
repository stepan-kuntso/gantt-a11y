import { test } from "node:test";
import assert from "node:assert/strict";

import { describeConflictItem, describeSummary, describeWhere, uniqueConflicts } from "../src/core/text/overview.js";
import { conflictKey } from "../src/core/text/conflicts.js";
import { createEngine } from "../src/core/engine.js";
import { defaultStrings } from "../src/core/strings.js";
import { createMemoryAdapter } from "./memory-adapter.js";
import { day, speech } from "./helpers.js";

const s = speech();
const t = (name, start, end, extra = {}) => ({ name, start: day(start), end: day(end), type: "task", ...extra });
const conflict = (late, other, amount) => ({
	type: "finish_to_start", amount, link: { id: late + other, lag: 0 },
	source: { id: other, name: other }, target: { id: late, name: late }
});

test("summary: count, span, conflicts, tasks without dates (S2)", () => {
	const tasks = [t("Design", 1, 5), t("Build", 5, 13), t("Launch", 18, 19), { name: "Idea", type: "task" }];
	assert.equal(describeSummary({ tasks, shown: 4, conflicts: [], level: "standard", unit: "day", speech: s }, defaultStrings),
		"4 tasks. 1 to 18 June. No conflicts. 1 task without dates.");
	assert.equal(describeSummary({ tasks, shown: 2, conflicts: [conflict("Build", "Design", 2)], level: "standard", unit: "day", speech: s }, defaultStrings),
		"4 tasks, 2 shown. 1 to 18 June. 1 conflict. 1 task without dates.");
	assert.equal(describeSummary({ tasks: tasks.slice(0, 3), shown: 3, conflicts: [], level: "brief", unit: "day", speech: s }, defaultStrings),
		"3 tasks. 1 to 18 June.");
	assert.equal(describeSummary({ tasks: [], shown: 0, conflicts: [], level: "standard", unit: "day", speech: s }, defaultStrings), "No tasks.");
});

test("summary at the Detailed level: kinds and the largest conflict", () => {
	const tasks = [t("Website", 1, 23, { type: "project" }), t("Build", 5, 13), t("Go-live", 20, 20, { type: "milestone" })];
	const conflicts = [conflict("Build", "Design", 1), conflict("Launch", "Testing", 3)];
	assert.equal(describeSummary({ tasks, shown: 3, conflicts, level: "detailed", unit: "day", speech: s }, defaultStrings),
		"3 tasks. 1 project, 1 milestone. 1 to 22 June. 2 conflicts. Largest: Launch, 3 days too early for Testing.");
});

test("where am I: ancestors nearest first, level and position (R12)", () => {
	const input = { name: "API", ancestors: ["Backend", "Website redesign"], index: 2, total: 5, speech: s };
	assert.equal(describeWhere({ ...input, level: "standard" }, defaultStrings), "API. In Backend, in Website redesign. Level 3, 3 of 5.");
	assert.equal(describeWhere({ ...input, level: "brief" }, defaultStrings), "API. In Backend.");
	assert.equal(describeWhere({ name: "Website redesign", ancestors: [], index: 0, total: 1, level: "detailed", subtasks: 10, speech: s }, defaultStrings),
		"Website redesign. Top level, 1 of 1. 10 subtasks inside.");
});

test("conflict list: each once, largest first, full form with position (C5)", () => {
	const a = conflict("Build", "Design", 1);
	const b = conflict("Launch", "Testing", 3);
	const list = uniqueConflicts([a, b, a], conflictKey);
	assert.deepEqual(list.map((c) => c.target.name), ["Launch", "Build"]);
	assert.equal(describeConflictItem({ conflict: list[0], index: 0, total: 2, unit: "day", speech: s }, defaultStrings),
		"1 of 2. Conflict. 3 days too early: must not start before Testing ends.");
	assert.equal(describeConflictItem({ conflict: list[1], index: 0, total: 1, unit: "day", speech: s }, defaultStrings),
		"Conflict. 1 day too early: must not start before Design ends.");
});

// The engine with plain data
const task = (id, name, start, end, extra = {}) => ({
	id, name, start: day(start), end: day(end), duration: end - start, parent: null, type: "task", readonly: false, progress: 0, ...extra
});
function setup(focused) {
	const memory = createMemoryAdapter({
		tasks: [
			task(1, "Website", 1, 19, { type: "project" }),
			task(2, "Design", 1, 5, { parent: 1 }),
			task(3, "Build", 4, 13, { parent: 1 }),
			task(4, "Test", 12, 18, { parent: 1 }),
			task(5, "Retro", 18, 19)
		],
		links: [
			{ id: 1, source: 2, target: 3, type: "finish_to_start", lag: 0 },
			{ id: 2, source: 3, target: 4, type: "finish_to_start", lag: 0 }
		],
		focused
	});
	createEngine(memory.adapter, { endDate: "lastDay" });
	return memory;
}

test("Shift+V speaks the summary with every conflict in the chart", () => {
	const { press, last } = setup(5);
	press("shift+v");
	assert.deepEqual(last(), { via: "live", text: "5 tasks. 1 to 18 June. 2 conflicts." });
});

test("Shift+W says where the focused task is", () => {
	const { press, last } = setup(4);
	press("shift+w");
	assert.deepEqual(last(), { via: "live", text: "Test. In Website. Level 2, 3 of 3." });
});

test("Shift+C goes from conflict to conflict, then Shift+Z goes back to where it started", () => {
	const { press, last, state } = setup(5);
	press("shift+c");
	assert.deepEqual(last(), { via: "row", id: 3, text: "1 of 2. Conflict. 1 day too early: must not start before Design ends." });
	assert.equal(state.focused, 3);
	press("shift+c");
	assert.deepEqual(last(), { via: "row", id: 4, text: "2 of 2. Conflict. 1 day too early: must not start before Build ends." });
	press("shift+z");
	assert.deepEqual(last(), { via: "row", id: 5, text: "Back to Retro." });
	assert.equal(state.focused, 5);
	press("shift+z");
	assert.deepEqual(last(), { via: "live", text: "Nothing to go back to." });
});

test("Shift+Z after a chain of jumps returns to the first task", () => {
	const { press, last, state } = setup(4);
	press("shift+p");
	press("shift+p");
	assert.equal(state.focused, 2);
	press("shift+z");
	assert.deepEqual(last(), { via: "row", id: 4, text: "Back to Test." });
});

test("no conflicts: Shift+C says so and does not move", () => {
	const memory = createMemoryAdapter({ tasks: [task(1, "Only", 1, 2)], links: [], focused: 1 });
	createEngine(memory.adapter, {});
	memory.press("shift+c");
	assert.deepEqual(memory.last(), { via: "live", text: "No conflicts." });
	assert.equal(memory.state.focused, 1);
});

test("Shift+C on the task that is in conflict speaks in the live region (focus does not move)", () => {
	const { press, last, state } = setup(3);
	press("shift+c");
	assert.deepEqual(last(), { via: "live", text: "1 of 2. Conflict. 1 day too early: must not start before Design ends." });
	assert.equal(state.focused, 3);
	press("shift+c");
	assert.deepEqual(last(), { via: "row", id: 4, text: "2 of 2. Conflict. 1 day too early: must not start before Build ends." });
});
