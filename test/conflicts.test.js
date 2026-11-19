import { test } from "node:test";
import assert from "node:assert/strict";

import { conflictKey, describeConflicts, findConflicts } from "../src/core/text/conflicts.js";
import { defaultStrings } from "../src/core/strings.js";
import { day, speech } from "./helpers.js";

const DAY = 86400000;
const applyLag = (date, lag) => new Date(date.getTime() + lag * DAY);
const t = (id, name, start, end) => ({ id, name, start: day(start), end: day(end) });

// Implementation 5-13 June (source); Testing is the target in each case.
function conflictsFor(type, testing, extra = {}) {
	const tasks = { 1: t(1, "Implementation", 5, 13), 2: testing };
	return findConflicts({
		taskId: 2,
		links: [{ id: 7, source: 1, target: 2, type, ...extra }],
		getTask: (id) => tasks[id] || null,
		applyLag
	});
}

function text(conflicts, options = {}) {
	return describeConflicts({ taskId: 2, conflicts, unit: "day", speech: speech(), ...options }, defaultStrings);
}

test("all four link types: detected with the amount, silent when fine", () => {
	assert.equal(conflictsFor("finish_to_start", t(2, "Testing", 11, 16))[0].amount, 2);
	assert.equal(conflictsFor("finish_to_start", t(2, "Testing", 13, 16)).length, 0);
	assert.equal(conflictsFor("start_to_start", t(2, "Testing", 4, 16))[0].amount, 1);
	assert.equal(conflictsFor("start_to_start", t(2, "Testing", 5, 16)).length, 0);
	assert.equal(conflictsFor("finish_to_finish", t(2, "Testing", 1, 10))[0].amount, 3);
	assert.equal(conflictsFor("finish_to_finish", t(2, "Testing", 1, 13)).length, 0);
	assert.equal(conflictsFor("start_to_finish", t(2, "Testing", 1, 4))[0].amount, 1);
	assert.equal(conflictsFor("start_to_finish", t(2, "Testing", 1, 5)).length, 0);
});

test("lag and lead are applied to the source date", () => {
	assert.equal(conflictsFor("finish_to_start", t(2, "Testing", 14, 18), { lag: 3 })[0].amount, 2);
	assert.equal(conflictsFor("finish_to_start", t(2, "Testing", 16, 18), { lag: 3 }).length, 0);
	assert.equal(conflictsFor("finish_to_start", t(2, "Testing", 12, 18), { lag: -2 }).length, 0);
});

test("C1: the changed task is too early, by an amount, for the other", () => {
	assert.equal(text(conflictsFor("finish_to_start", t(2, "Testing", 11, 16))), "Conflict. 2 days too early for Implementation.");
	assert.equal(text(conflictsFor("start_to_start", t(2, "Testing", 4, 16))), "Conflict. 1 day too early for Implementation.");
});

test("C2: the change made the other task too early", () => {
	const conflicts = conflictsFor("finish_to_start", t(2, "Testing", 10, 16));
	assert.equal(describeConflicts({ taskId: 1, conflicts, unit: "day", speech: speech() }, defaultStrings),
		"Conflict. Testing is now 3 days too early.");
});

test("C5: several conflicts give the count and the largest", () => {
	const tasks = { 1: t(1, "A", 5, 13), 2: t(2, "B", 11, 16), 3: t(3, "C", 8, 10) };
	const conflicts = findConflicts({
		taskId: 1,
		links: [{ id: 1, source: 1, target: 2, type: "finish_to_start" }, { id: 2, source: 1, target: 3, type: "finish_to_start" }],
		getTask: (id) => tasks[id] || null,
	});
	assert.equal(describeConflicts({ taskId: 1, conflicts, unit: "day", speech: speech() }, defaultStrings),
		"2 conflicts. Largest: C, 5 days too early.");
});

test("C6: a conflict that existed is resolved; nothing to say without one", () => {
	assert.equal(text([], { before: new Set(["7"]) }), "Conflict resolved.");
	assert.equal(text([], { before: new Set() }), "");
	assert.equal(text([]), "");
});

test("Brief and Detailed levels, rule with lag", () => {
	const conflicts = conflictsFor("finish_to_start", t(2, "Testing", 11, 16));
	assert.equal(text(conflicts, { level: "brief" }), "Conflict, Implementation.");
	assert.equal(text(conflicts, { level: "detailed" }), "Conflict. 2 days too early: must not start before Implementation ends.");
	assert.equal(text(conflictsFor("finish_to_start", t(2, "Testing", 14, 18), { lag: 3 }), { level: "detailed" }),
		"Conflict. 2 days too early: must start at least 3 days after Implementation ends.");
	assert.equal(text(conflictsFor("finish_to_finish", t(2, "Testing", 1, 10)), { level: "detailed" }),
		"Conflict. 3 days too early: must not end before Implementation ends.");
});

test("conflictKey uses the link id, or source, target and type", () => {
	assert.equal(conflictKey({ link: { id: 7 }, source: { id: 1 }, target: { id: 2 }, type: "x" }), "7");
	assert.equal(conflictKey({ link: {}, source: { id: 1 }, target: { id: 2 }, type: "x" }), "1|2|x");
});

test("unrelated links, missing tasks and unknown types are ignored", () => {
	const tasks = { 1: t(1, "A", 5, 13), 2: t(2, "B", 11, 16), 3: t(3, "C", 1, 2), 4: t(4, "D", 1, 2) };
	const conflicts = findConflicts({
		taskId: 1,
		links: [{ source: 3, target: 4, type: "finish_to_start" }, { source: 1, target: 99, type: "finish_to_start" }, { source: 1, target: 2, type: "x" }],
		getTask: (id) => tasks[id] || null,
	});
	assert.deepEqual(conflicts, []);
});
