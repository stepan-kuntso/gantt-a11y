import { test } from "node:test";
import assert from "node:assert/strict";

import { createEngine } from "../src/core/engine.js";
import { createMemoryAdapter } from "./memory-adapter.js";

const day = (d) => new Date(2026, 5, d);
const task = (id, name, start, end, extra = {}) => ({
	id, name, start: day(start), end: day(end), duration: end - start, parent: null, type: "task", readonly: false, progress: 0, ...extra
});

function setup(focused = 3, options = {}) {
	const memory = createMemoryAdapter({
		tasks: [
			task(1, "Design", 1, 5),
			task(2, "Budget", 2, 4, { readonly: true }),
			task(3, "Build", 5, 13),
			task(4, "Test", 13, 18)
		],
		links: [
			{ id: 1, source: 1, target: 3, type: "finish_to_start", lag: 0 },
			{ id: 2, source: 3, target: 4, type: "start_to_start", lag: 0 }
		],
		focused
	});
	const engine = createEngine(memory.adapter, { endDate: "lastDay", ...options });
	return { ...memory, engine };
}

test("the engine registers every default key through the adapter", () => {
	const { keys } = setup();
	assert.deepEqual(Object.keys(keys).sort(), [
		"shift+a", "shift+b", "shift+c", "shift+d", "shift+h", "shift+i", "shift+j", "shift+k", "shift+l", "shift+m",
		"shift+o", "shift+p", "shift+r", "shift+s", "shift+t", "shift+u", "shift+v", "shift+w", "shift+z"
	]);
});

test("dependencies from plain data", () => {
	const { press, last } = setup(3);
	press("shift+d");
	assert.deepEqual(last(), { via: "live", text: "Depends on: Design. Required by: Test, start to start." });
});

test("a move changes the data and is announced in the live region, not in the row label", () => {
	const { press, last, state } = setup(4);
	press("shift+k");
	assert.equal(state.tasks[3].start.getDate(), 14);
	assert.equal(last().via, "live");
	assert.match(last().text, /^Starts .* 14 June, ends .* 18 June\.$/);
});

test("a read-only task is refused", () => {
	const { press, last, state } = setup(2);
	press("shift+j");
	assert.deepEqual(last(), { via: "live", text: "Read-only. Not changed." });
	assert.equal(state.tasks[1].start.getDate(), 2);
});

test("going to a successor moves focus", () => {
	const { press, state, last } = setup(1);
	press("shift+s");
	assert.equal(state.focused, 3);
	assert.deepEqual(last(), { via: "row", id: 3, text: "This depends on Design." });
});

test("links are created through the adapter", () => {
	const { press, state, last } = setup(1);
	press("shift+l");
	state.focused = 4;
	press("shift+l");
	assert.equal(state.links.some((l) => l.source === 1 && l.target === 4), true);
	assert.equal(last().text, "Linked. This depends on Design.");
});

test("form events from the adapter become form announcements", () => {
	const { form, state, last } = setup(4);
	const before = { ...state.tasks[3] };
	form({ type: "open", id: 4, values: { start: before.start, end: before.end, duration: before.duration } });
	form({ type: "save", id: 4, isNew: false, before });
	state.tasks[3].duration = 6;
	state.tasks[3].end = day(19);
	form({ type: "close" });
	// the live region, not the row label: focus coming back from the form was not announced
	assert.equal(last().via, "live");
	assert.equal(last().text, "Saved. Duration 6 days, was 5. Ends 18 June.");
});

test("the row label comes from the engine when the feature is on", () => {
	const { rowLabel } = setup(1, { features: { rowLabel: true } });
	assert.equal(rowLabel(4), "Test. 13 to 17 June, 5 days. 0 percent done.");
});

test("disable() removes every key", () => {
	const { engine, keys } = setup();
	engine.disable();
	assert.deepEqual(Object.keys(keys), []);
});

test("with the new values at save time, the result goes into the row label before the form closes", () => {
	const { form, state, spoken } = setup(4);
	const before = { ...state.tasks[3] };
	const after = { ...before, duration: 6, end: day(19) };
	form({ type: "open", id: 4, values: { start: before.start, end: before.end, duration: before.duration } });
	form({ type: "save", id: 4, isNew: false, before, after });
	// already prepared for the row, before the library stores and re-renders it
	assert.deepEqual(spoken[spoken.length - 1], { via: "row", id: 4, text: "Saved. Duration 6 days, was 5. Ends 18 June." });
	state.tasks[3].duration = 6;
	state.tasks[3].end = day(19);
	form({ type: "close" });
	assert.deepEqual(spoken[spoken.length - 1], { via: "row", id: 4, text: "Saved. Duration 6 days, was 5. Ends 18 June." });
	assert.equal(spoken.filter((item) => item.via === "live").length, 0);
});
