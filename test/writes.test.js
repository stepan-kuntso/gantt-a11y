// B2: the extension never announces a change that did not happen. The
// adapter's return values are not trusted: after each write the engine reads
// the data again and speaks what was stored.
import { test } from "node:test";
import assert from "node:assert/strict";

import { createEngine } from "../src/core/engine.js";
import { createMemoryAdapter } from "./memory-adapter.js";

const day = (d) => new Date(2026, 5, d);
const task = (id, name, start, end, extra = {}) => ({
	id, name, start: day(start), end: day(end), duration: end - start, parent: null, type: "task", readonly: false, progress: 0, ...extra
});

function setup(focused, rules) {
	const memory = createMemoryAdapter({
		tasks: [task(1, "Design", 1, 5), task(3, "Build", 5, 13), task(4, "Test", 13, 18)],
		links: [{ id: 1, source: 1, target: 3, type: "finish_to_start", lag: 0 }],
		focused,
		rules
	});
	createEngine(memory.adapter, { endDate: "lastDay" });
	return memory;
}

test("a refused move is not announced as done, and the data is unchanged", () => {
	const { press, last, state } = setup(4, { updateTask: () => false });
	press("shift+k");
	assert.equal(state.tasks[2].start.getTime(), day(13).getTime());
	assert.deepEqual(last(), { via: "live", text: "Not changed. The change was not accepted." });
});

test("a refused duration change is not announced as done", () => {
	const { press, last, state } = setup(4, { updateTask: () => false });
	press("shift+i");
	assert.equal(state.tasks[2].duration, 5);
	assert.equal(last().text, "Not changed. The change was not accepted.");
});

test("when the application stores other values, those are announced", () => {
	// the application moves the task one day further than asked
	const later = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
	const { press, last, state } = setup(4, { updateTask: (id, values) => ({ ...values, start: later(values.start), end: later(values.end) }) });
	press("shift+k");
	assert.equal(state.tasks[2].start.getTime(), day(15).getTime());
	assert.equal(last().text, "Starts Monday 15 June, ends Friday 19 June.");
	// the next press within a second counts from what was stored
	press("shift+k");
	assert.equal(last().text, "4 days later. Starts Wednesday 17 June, ends Sunday 21 June.");
});

test("a link the library did not store is not announced as created", () => {
	const { press, last, state } = setup(1, { addLink: () => false });
	press("shift+l");
	state.focused = 4;
	press("shift+l");
	assert.equal(state.links.length, 1);
	assert.equal(last().text, "Link not created.");
});

test("a link the library did not remove is not announced as removed", () => {
	const { press, last, state } = setup(1, { removeLink: () => false });
	press("shift+s"); // to Build, along link 1
	press("shift+u");
	press("shift+u");
	assert.equal(state.links.length, 1);
	assert.equal(last().text, "Link not removed.");
});

test("form: when other values were stored than the form had, the stored ones are announced", () => {
	const { form, state, spoken } = setup(4);
	const before = { ...state.tasks[2] };
	const after = { ...before, duration: 6, end: day(19) };
	form({ type: "open", id: 4, values: { start: before.start, end: before.end, duration: before.duration } });
	form({ type: "save", id: 4, isNew: false, before, after });
	// the application keeps the duration at 5 (onAfterTaskUpdate, a server reply...)
	form({ type: "close" });
	const last = spoken[spoken.length - 1];
	assert.equal(last.text, "Saved, no changes.");
	assert.equal(spoken.some((item) => item.text.includes("Duration 6 days") && item === last), false);
});

test("form: a save of a new task that was not stored is not announced as created", () => {
	const { form, spoken } = setup(4);
	form({ type: "save", id: 99, isNew: true, before: null, after: null });
	form({ type: "close" });
	assert.equal(spoken.some((item) => /Created/.test(item.text)), false);
});
