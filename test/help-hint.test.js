// The hint on the first focus (spec P30): "Press Shift H for keys.", once per
// page load, 500 ms after focus first lands on a task, after the row label.
import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";

import { createEngine, resetHelpHint } from "../src/core/engine.js";
import { uk } from "../src/locales/uk.js";
import { createMemoryAdapter } from "./memory-adapter.js";

const day = (d) => new Date(2026, 5, d);
const task = (id, name, start, end) => ({
	id, name, start: day(start), end: day(end), duration: end - start, parent: null, type: "task", readonly: false, progress: 0
});

function setup(options = {}, { reset = true } = {}) {
	mock.timers.enable({ apis: ["setTimeout", "Date"], now: new Date(2026, 5, 1, 9).getTime() });
	if (reset) {
		resetHelpHint();
	}
	const memory = createMemoryAdapter({
		tasks: [task(1, "Design", 1, 5), task(2, "Build", 5, 13)],
		links: [{ id: 1, source: 1, target: 2, type: "finish_to_start", lag: 0 }],
		focused: null
	});
	const engine = createEngine(memory.adapter, options);
	return { ...memory, engine };
}

const live = (spoken) => spoken.filter((item) => item.via === "live").map((item) => item.text);

afterEach(() => mock.timers.reset());

test("the first focus on a task gives the hint 500 ms later, through the live region", () => {
	const { focus, spoken } = setup();
	focus(1);
	mock.timers.tick(499);
	assert.deepEqual(live(spoken), []);
	mock.timers.tick(1);
	assert.deepEqual(live(spoken), ["Press Shift H for keys."]);
});

test("the hint is given once per page load, also when the extension is enabled again", () => {
	const first = setup();
	first.focus(1);
	mock.timers.tick(500);
	first.focus(2);
	first.focus(1);
	mock.timers.tick(1000);
	assert.deepEqual(live(first.spoken), ["Press Shift H for keys."]);
	first.engine.disable();
	mock.timers.reset();

	const second = setup({}, { reset: false });
	second.focus(1);
	mock.timers.tick(1000);
	assert.deepEqual(live(second.spoken), []);
});

test("no hint at the Brief level", () => {
	const { focus, spoken } = setup({ verbosity: "brief" });
	focus(1);
	mock.timers.tick(1000);
	assert.deepEqual(live(spoken), []);
});

test("no hint with features.helpHint: false, or without the help key", () => {
	for (const features of [{ helpHint: false }, { help: false }]) {
		const { focus, spoken } = setup({ features });
		focus(1);
		mock.timers.tick(1000);
		assert.deepEqual(live(spoken), [], JSON.stringify(features));
		mock.timers.reset();
	}
});

test("no hint once help has been asked for", () => {
	const { focus, press, spoken } = setup();
	focus(1);
	press("shift+h");
	mock.timers.tick(1000);
	assert.equal(live(spoken).length, 1);
	assert.match(live(spoken)[0], /^Reading, 1 of 6\./);
	focus(2);
	mock.timers.tick(1000);
	assert.equal(live(spoken).length, 1);
});

test("no hint when something else was spoken in the meantime", () => {
	const { focus, press, spoken } = setup();
	focus(1);
	press("shift+r");
	mock.timers.tick(1000);
	assert.deepEqual(live(spoken), ["Nothing to repeat."]);
});

test("the hint names the key in use", () => {
	const { focus, spoken } = setup({ shortcuts: { help: "shift+q" } });
	focus(1);
	mock.timers.tick(500);
	assert.deepEqual(live(spoken), ["Press Shift Q for keys."]);
});

test("the hint in Ukrainian", () => {
	const { focus, spoken } = setup({ strings: uk, locale: "uk" });
	focus(1);
	mock.timers.tick(500);
	assert.deepEqual(live(spoken), ["Довідка з клавіш: Shift H."]);
});

test("disable() before the hint drops it", () => {
	const { focus, engine, spoken } = setup();
	focus(1);
	engine.disable();
	mock.timers.tick(1000);
	assert.deepEqual(live(spoken), []);
});

test("an adapter without onTaskFocus gives no hint and still works", () => {
	mock.timers.enable({ apis: ["setTimeout", "Date"], now: new Date(2026, 5, 1, 9).getTime() });
	resetHelpHint();
	const memory = createMemoryAdapter({ tasks: [task(1, "Design", 1, 5)], links: [], focused: 1 });
	delete memory.adapter.onTaskFocus;
	createEngine(memory.adapter);
	memory.focus(1);
	mock.timers.tick(1000);
	assert.deepEqual(live(memory.spoken), []);
});
