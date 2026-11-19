import { test } from "node:test";
import assert from "node:assert/strict";

import { beforeAfterPages, concurrentPages, findTasksInTime, overlapExtent, overlaps } from "../src/core/text/time.js";
import { defaultStrings } from "../src/core/strings.js";
import { day, speech } from "./helpers.js";

const t = (id, name, start, end) => ({ id, name, start: day(start), end: day(end) });
const durationBetween = (a, b) => (b - a) / 86400000;

// Testing works 13 to 17 June (end date 18 June, midnight).
const testing = t(4, "Testing", 13, 18);

function concurrent(found, limit = 3) {
	return concurrentPages({ task: testing, found, limit, unit: "day", durationBetween, speech: speech() }, defaultStrings)
		.map((page) => page.text);
}

test("overlaps: touching ranges do not overlap, except milestones", () => {
	assert.equal(overlaps(t(1, "a", 1, 5), t(2, "b", 5, 9)), false);
	assert.equal(overlaps(t(1, "a", 1, 6), t(2, "b", 5, 9)), true);
	assert.equal(overlaps(t(1, "a", 5, 5), t(2, "b", 1, 5)), true);
});

test("overlapExtent: whole, first, last, middle, milestone", () => {
	assert.equal(overlapExtent(testing, t(1, "x", 10, 20)).kind, "whole");
	assert.equal(overlapExtent(testing, t(1, "x", 5, 15)).kind, "first");
	assert.equal(overlapExtent(testing, t(1, "x", 16, 25)).kind, "last");
	assert.equal(overlapExtent(testing, t(1, "x", 14, 16)).kind, "middle");
	assert.equal(overlapExtent(testing, t(1, "x", 15, 15)).kind, "milestone");
});

test("findTasksInTime: whole-time first, then longest overlap; nearest first before and after", () => {
	const tasks = [testing, t(1, "Partly", 5, 15), t(2, "Whole", 10, 19), t(3, "Long part", 14, 30), t(5, "Before", 1, 13), t(6, "Far before", 1, 3), t(7, "After", 18, 19), t(8, "No dates")];
	assert.deepEqual(findTasksInTime({ task: testing, tasks, relation: "concurrent" }).map((x) => x.name), ["Whole", "Long part", "Partly"]);
	assert.deepEqual(findTasksInTime({ task: testing, tasks, relation: "before" }).map((x) => x.name), ["Before", "Far before"]);
	assert.deepEqual(findTasksInTime({ task: testing, tasks, relation: "after" }).map((x) => x.name), ["After"]);
	assert.deepEqual(findTasksInTime({ task: testing, tasks, relation: "concurrent", excludeIds: [2, 3] }).map((x) => x.name), ["Partly"]);
});

test("R8, R9: none, one, few with the extent of overlap", () => {
	assert.deepEqual(concurrent([]), ["No tasks at the same time."]);
	assert.deepEqual(concurrent([t(5, "Documentation", 5, 15)]), ["1 task at the same time: Documentation, first 2 days."]);
	assert.deepEqual(concurrent([t(8, "Marketing prep & PR", 10, 19), t(5, "Documentation", 5, 15)]),
		["2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days."]);
	assert.deepEqual(concurrent([t(1, "Code review", 14, 16), t(2, "Launch", 17, 19), t(3, "Go-live", 15, 15)]),
		["3 tasks at the same time. Code review, 2 days in the middle. Launch, last day. Milestone Go-live, on 15 June."]);
});

test("R10: many, grouped by kind, then pages of the partial ones", () => {
	const whole = [1, 2, 3, 4].map((n) => t(n, "W" + n, 10, 20));
	const partly = [5, 6, 7, 8].map((n) => t(n, "P" + n, 5, 15));
	const result = concurrent([...whole, ...partly]);
	assert.equal(result[0], "8 tasks at the same time. 4 the whole time: W1, W2, W3. 4 partly.");
	assert.equal(result[1], "Partly, 1 to 3 of 4: P5, first 2 days. P6, first 2 days. P7, first 2 days.");
	assert.equal(result[2], "Partly, 4 to 4 of 4: P8, first 2 days. End of list.");
});

test("R11: count and the nearest, then pages", () => {
	const s = speech();
	const before = [t(1, "Implementation", 5, 13), t(2, "Code review", 8, 12), t(3, "Design", 1, 5), t(6, "Kickoff", 1, 2)];
	const pages = beforeAfterPages({ found: before, relation: "before", limit: 3, speech: s }, defaultStrings).map((p) => p.text);
	assert.deepEqual(pages, [
		"4 tasks end before this starts. Nearest: Implementation, ends 12 June.",
		"2 to 4 of 4: Code review, Design, Kickoff. End of list."
	]);
	assert.deepEqual(beforeAfterPages({ found: [t(7, "Launch", 18, 19)], relation: "after", limit: 3, speech: s }, defaultStrings).map((p) => p.text),
		["1 task starts after this ends: Launch, starts 18 June."]);
	assert.deepEqual(beforeAfterPages({ found: [], relation: "after", limit: 3, speech: s }, defaultStrings).map((p) => p.text),
		["No tasks start after this ends."]);
});
