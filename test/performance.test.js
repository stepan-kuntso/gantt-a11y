// V4: commands over the whole chart stay fast on a large chart.
import { test } from "node:test";
import assert from "node:assert/strict";

import { createEngine } from "../src/core/engine.js";
import { createMemoryAdapter } from "./memory-adapter.js";

const TASKS = 5000;
// Generous for a slow machine; measured times are printed.
const LIMIT_MS = 400;

function largeChart() {
	const tasks = [];
	const links = [];
	for (let i = 0; i < TASKS; i++) {
		const start = new Date(2026, 0, 1 + 2 * i);
		tasks.push({ id: i, name: "Task " + i, start, end: new Date(start.getTime() + 2 * 86400000), duration: 2, parent: null, type: "task", readonly: false, progress: 0 });
		if (i > 0) {
			// finish to start chains; every 50th link is broken (a conflict)
			links.push({ id: i, source: i - 1, target: i, type: "finish_to_start", lag: i % 50 === 0 ? 30 : 0 });
		}
	}
	return { tasks, links };
}

function time(fn) {
	const started = performance.now();
	fn();
	return performance.now() - started;
}

test(`overview and the conflict list on ${TASKS} tasks take less than ${LIMIT_MS} ms`, () => {
	const memory = createMemoryAdapter({ ...largeChart(), focused: 10 });
	createEngine(memory.adapter, { endDate: "lastDay" });
	const overview = time(() => memory.press("shift+v"));
	assert.match(memory.last().text, /^5,000 tasks\..* \d+ conflicts\.$/);
	const conflictList = time(() => memory.press("shift+c"));
	assert.match(memory.last().text, /^1 of \d+\. Conflict\./);
	console.log(`overview ${overview.toFixed(0)} ms, conflict list ${conflictList.toFixed(0)} ms`);
	assert.ok(overview < LIMIT_MS, `overview took ${overview.toFixed(0)} ms`);
	assert.ok(conflictList < LIMIT_MS, `conflict list took ${conflictList.toFixed(0)} ms`);
});
