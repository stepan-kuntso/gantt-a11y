// Results that go into the row label, checked on the label itself (the memory
// adapter changes it like a real adapter), and focus that cannot move.
import { test } from "node:test";
import assert from "node:assert/strict";

import { createEngine } from "../src/core/engine.js";
import { createMemoryAdapter } from "./memory-adapter.js";

const day = (d) => new Date(2026, 5, d);
const task = (id, name, start, end) => ({ id, name, start: day(start), end: day(end), duration: end - start, parent: null, type: "task", readonly: false, progress: 0 });

function setup(focused, extra = {}) {
	const memory = createMemoryAdapter({
		tasks: [task(1, "Design", 1, 5), task(3, "Build", 5, 13), task(4, "Test", 13, 18)],
		links: [
			{ id: 1, source: 1, target: 3, type: "finish_to_start", lag: 0 },
			{ id: 2, source: 3, target: 4, type: "finish_to_start", lag: 0 }
		],
		focused,
		...extra
	});
	createEngine(memory.adapter, { endDate: "lastDay" });
	return memory;
}

test("a jump puts the position in front of the target row's own label; moving on removes it", () => {
	const memory = setup(4);
	memory.press("shift+p");
	assert.equal(memory.state.focused, 3);
	assert.equal(memory.label(3), "Test depends on this. Build");
	assert.equal(memory.label(4), "Test");
	memory.focus(1);
	assert.equal(memory.label(3), "Build");
});

test("a jump to a task that cannot get focus: no message is left, focus stays, the live region says why", () => {
	const memory = setup(4, { unreachable: [3] });
	memory.press("shift+p");
	assert.equal(memory.state.focused, 4);
	assert.equal(memory.label(3), "Build");
	assert.deepEqual(memory.last(), { via: "live", text: "Build is filtered out. Focus did not move." });
});

test("Shift+Z to an unreachable task leaves no message either", () => {
	const memory = setup(4);
	memory.press("shift+p"); // to Build, the series started on Test
	memory.press("shift+p"); // on to Design
	assert.equal(memory.state.focused, 1);
	memory.adapter.focusTask = () => ({ moved: false }); // Test is filtered out meanwhile
	memory.press("shift+z");
	assert.equal(memory.label(4), "Test");
	assert.equal(memory.state.focused, 1);
	assert.match(memory.last().text, /filtered out\. Focus did not move\.$/);
});

test("a form result is in the row label, followed by the task's name", () => {
	const memory = setup(4);
	const before = { ...memory.state.tasks[2] };
	memory.form({ type: "open", id: 4, values: { start: before.start, end: before.end, duration: before.duration } });
	memory.form({ type: "cancel", id: 4 });
	memory.form({ type: "close" });
	assert.equal(memory.label(4), "Cancelled. Nothing changed. Test");
});
