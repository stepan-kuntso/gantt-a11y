// Every time window and delay of the engine, with a controlled clock
// (node:test mock timers): just inside and just outside each one.
import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";

import { createEngine } from "../src/core/engine.js";
import { createMemoryAdapter } from "./memory-adapter.js";

const day = (d) => new Date(2026, 5, d);
const task = (id, name, start, end, extra = {}) => ({ id, name, start: day(start), end: day(end), duration: end - start, parent: null, type: "task", readonly: false, progress: 0, ...extra });
const fs = (id, source, target, lag = 0) => ({ id, source, target, type: "finish_to_start", lag });

function setup(focused, { tasks, links, options = {} } = {}) {
	mock.timers.enable({ apis: ["setTimeout", "Date"], now: new Date(2026, 5, 1, 9).getTime() });
	const memory = createMemoryAdapter({
		tasks: tasks || [task(1, "Design", 1, 5), task(2, "Copy", 1, 4), task(3, "Review", 2, 4), task(4, "Budget", 1, 3), task(5, "Launch", 5, 6)],
		links: links || [fs(1, 1, 5), fs(2, 2, 5), fs(3, 3, 5), fs(4, 4, 5)],
		focused
	});
	createEngine(memory.adapter, { endDate: "lastDay", ...options });
	return memory;
}

afterEach(() => mock.timers.reset());

test("a burst of edits lasts 1 second from the last press", () => {
	const memory = setup(1);
	memory.press("shift+k");
	mock.timers.tick(999);
	memory.press("shift+k");
	assert.match(memory.last().text, /^2 days later\./);
	mock.timers.tick(1001);
	memory.press("shift+k");
	assert.match(memory.last().text, /^Starts /);
});

test("edit results wait 500 ms (the delay goes to the live region)", () => {
	const memory = setup(1);
	memory.press("shift+k");
	assert.equal(memory.timing[memory.timing.length - 1].delay, 500);
});

test("the next page within 5 seconds; after that the first page again", () => {
	const memory = setup(5);
	memory.press("shift+d");
	assert.match(memory.last().text, /^Depends on 4\. First 3/);
	mock.timers.tick(4999);
	memory.press("shift+d");
	assert.match(memory.last().text, /^4 of 4: /);
	mock.timers.tick(5001);
	memory.press("shift+d");
	assert.match(memory.last().text, /^Depends on 4\. First 3/);
});

test("removing a link needs the second press within 5 seconds", () => {
	const memory = setup(5);
	memory.press("shift+p"); // along link 1 to Design
	memory.press("shift+u");
	assert.match(memory.last().text, /^Press again to remove the link/);
	mock.timers.tick(5001);
	memory.press("shift+u");
	assert.match(memory.last().text, /^Press again to remove the link/);
	assert.equal(memory.state.links.length, 4);
	mock.timers.tick(4999);
	memory.press("shift+u");
	assert.match(memory.last().text, /^Link removed\./);
	assert.equal(memory.state.links.length, 3);
});

test("the next conflict within 5 seconds; after that the largest again", () => {
	// two broken links: Design must end before Launch starts (by 3 days), Copy by 1
	const memory = setup(5, {
		tasks: [task(1, "Design", 1, 8), task(2, "Copy", 1, 6), task(5, "Launch", 5, 6)],
		links: [fs(1, 1, 5), fs(2, 2, 5)]
	});
	memory.press("shift+c");
	assert.match(memory.last().text, /^1 of 2\. /);
	mock.timers.tick(4999);
	memory.press("shift+c");
	assert.match(memory.last().text, /^2 of 2\. /);
	mock.timers.tick(5001);
	memory.press("shift+c");
	assert.match(memory.last().text, /^1 of 2\. /);
});

test("a deletion is spoken 500 ms after the form closes", () => {
	const memory = setup(4);
	memory.form({ type: "delete", id: 4 });
	memory.state.tasks.splice(3, 1);
	memory.form({ type: "close" });
	assert.deepEqual(memory.timing[memory.timing.length - 1], { text: "Deleted Budget. 1 link removed.", delay: 500 });
});

test("Detailed level: the rest of a long save result follows 4 seconds later", () => {
	const memory = setup(1, { options: { verbosity: "detailed" } });
	const before = { ...memory.state.tasks[0] };
	const after = { ...before, name: "Design system", duration: 5, end: day(6), progress: 0.5 };
	memory.form({ type: "open", id: 1, values: { start: before.start, end: before.end, duration: before.duration } });
	memory.form({ type: "save", id: 1, isNew: false, before, after });
	Object.assign(memory.state.tasks[0], { name: "Design system", duration: 5, end: day(6), progress: 0.5 });
	memory.form({ type: "close" });
	const spokenLive = () => memory.spoken.filter((item) => item.via === "live").length;
	const before4s = spokenLive();
	mock.timers.tick(3999);
	assert.equal(spokenLive(), before4s);
	mock.timers.tick(1);
	assert.equal(spokenLive(), before4s + 1);
});
