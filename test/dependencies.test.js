import { test } from "node:test";
import assert from "node:assert/strict";

import { dependencyPages, orderLinked } from "../src/core/text/dependencies.js";
import { defaultStrings } from "../src/core/strings.js";
import { day, speech } from "./helpers.js";

const item = (name, type = "finish_to_start", extra = {}) => ({ name, type, start: day(1), end: day(5), ...extra });

function pages(predecessors, successors, extra = {}) {
	return dependencyPages({ predecessors, successors, limit: 3, speech: speech(), strings: defaultStrings, ...extra })
		.map((page) => page.text);
}

test("no links: R2", () => {
	assert.deepEqual(pages([], []), ["No dependencies."]);
});

test("one in each direction, finish to start not spoken: R3", () => {
	assert.deepEqual(pages([item("Software design")], [item("Testing")]),
		["Depends on: Software design. Required by: Testing."]);
});

test("one with an unusual type", () => {
	assert.deepEqual(pages([item("Documentation", "start_to_start")], []), ["Depends on: Documentation, start to start."]);
});

test("two or three: count and list, or one sentence per task when a type is unusual: R4", () => {
	assert.deepEqual(pages([item("A"), item("B"), item("C")], []), ["Depends on 3: A, B, C."]);
	assert.deepEqual(pages([item("Software design")], [item("Testing"), item("Documentation", "start_to_start"), item("Code review", "finish_to_finish")]),
		["Depends on: Software design. Required by 3. Testing. Documentation, start to start. Code review, finish to finish."]);
});

test("Detailed level speaks every type", () => {
	assert.deepEqual(pages([item("Software design")], [], { alwaysTypes: true }), ["Depends on: Software design, finish to start."]);
});

test("more than the limit: first page, further pages, end of list: R5 to R7", () => {
	const names = ["Implementation", "Budget approval", "Code review", "Documentation", "Legal review", "Translation", "Hosting contract", "Security audit"];
	const result = dependencyPages({ predecessors: names.map((name) => item(name)), successors: [], limit: 3, speech: speech(), strings: defaultStrings });
	assert.deepEqual(result.map((page) => page.text), [
		"Depends on 8. First 3: Implementation, Budget approval, Code review.",
		"4 to 6 of 8: Documentation, Legal review, Translation.",
		"7 and 8 of 8: Hosting contract, Security audit. End of list."
	]);
	assert.deepEqual(result.map((page) => page.nextCount), [3, 2, 0]);
});

test("both directions long: the second gives only its count on the first press", () => {
	const many = (prefix, n) => Array.from({ length: n }, (_, i) => item(prefix + (i + 1)));
	const result = pages(many("P", 4), many("S", 5));
	assert.equal(result[0], "Depends on 4. First 3: P1, P2, P3. Required by 5.");
	assert.equal(result[1], "4 of 4: P4. End of list.");
	assert.equal(result[2], "Required by 5. First 3: S1, S2, S3.");
	assert.equal(result[3], "4 and 5 of 5: S4, S5. End of list.");
});

test("ten or more: the deciding task and the conflicts instead of names (D2)", () => {
	const list = Array.from({ length: 12 }, (_, i) => item("T" + (i + 1), "finish_to_start", { end: day(i + 1), start: day(1) }));
	list[4].conflict = true;
	const result = pages(list, []);
	assert.equal(result[0], "Depends on 12. Last to end: T12, 11 June. 1 in conflict: T5.");
	assert.equal(result[1], "1 to 3 of 12: T1, T2, T3.");
});

test("names: HTML removed, empty names, long names cut in lists", () => {
	assert.deepEqual(pages([item("<b>Software</b>&nbsp;design &amp; review"), item(null)], []),
		["Depends on 2: Software design & review, Unnamed task."]);
	assert.deepEqual(pages([item("Migrate customer accounts from the legacy billing system")], []),
		["Depends on: Migrate customer accounts from the legacy."]);
});

test("orderLinked: conflicts first, then predecessors that end last, successors that start first", () => {
	const preds = [item("early", "x", { end: day(3) }), item("late", "x", { end: day(9) }), item("broken", "x", { end: day(1), conflict: true })];
	assert.deepEqual(orderLinked(preds, "predecessor").map((x) => x.name), ["broken", "late", "early"]);
	const succs = [item("later", "x", { start: day(9) }), item("sooner", "x", { start: day(2) })];
	assert.deepEqual(orderLinked(succs, "successor").map((x) => x.name), ["sooner", "later"]);
});
