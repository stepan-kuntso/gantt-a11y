import { test } from "node:test";
import assert from "node:assert/strict";

import { describeJump, describeNoJump, describeUnreachable, linkedTasks, nextJump } from "../src/core/text/navigation.js";
import { defaultStrings } from "../src/core/strings.js";
import { speech } from "./helpers.js";

const links = [
	{ id: 1, source: 1, target: 3, type: "finish_to_start" },
	{ id: 2, source: 2, target: 3, type: "start_to_start" },
	{ id: 3, source: 3, target: 4, type: "finish_to_start" },
	{ id: 4, source: 3, target: 5, type: "finish_to_finish" }
];

test("linkedTasks lists predecessors and successors in link order", () => {
	assert.deepEqual(linkedTasks(3, links, "predecessor").map((x) => x.id), [1, 2]);
	assert.deepEqual(linkedTasks("3", links, "successor").map((x) => x.id), [4, 5]);
	assert.deepEqual(linkedTasks(9, links, "successor"), []);
});

test("nextJump: round the origin's list when several, along the chain when one", () => {
	assert.deepEqual(nextJump(null, 3, "successor", 0), { originId: 3, index: 0 });
	assert.deepEqual(nextJump({ direction: "successor", originId: 3, landedId: 4, index: 0 }, 4, "successor", 3), { originId: 3, index: 1 });
	assert.deepEqual(nextJump({ direction: "successor", originId: 3, landedId: 6, index: 2 }, 6, "successor", 3), { originId: 3, index: 0 });
	assert.deepEqual(nextJump({ direction: "predecessor", originId: 4, landedId: 3, index: 0 }, 3, "predecessor", 1), { originId: 3, index: 0 });
	assert.deepEqual(nextJump({ direction: "successor", originId: 3, landedId: 4, index: 0 }, 5, "successor", 3), { originId: 5, index: 0 });
	assert.deepEqual(nextJump({ direction: "successor", originId: 3, landedId: 4, index: 0 }, 4, "predecessor", 3), { originId: 4, index: 0 });
});

test("describeJump: N1, N2 with position and origin", () => {
	const s = speech();
	assert.equal(describeJump({ direction: "predecessor", index: 1, total: 5, type: "finish_to_start", origin: "Launch", speech: s }, defaultStrings),
		"2 of 5. Launch depends on this.");
	assert.equal(describeJump({ direction: "successor", index: 1, total: 3, type: "finish_to_start", origin: "Implementation", speech: s }, defaultStrings),
		"2 of 3. This depends on Implementation.");
	assert.equal(describeJump({ direction: "predecessor", index: 2, total: 5, type: "start_to_start", origin: "Launch", speech: s }, defaultStrings),
		"3 of 5, start to start. Launch depends on this.");
});

test("describeJump: N3 without 1 of 1", () => {
	const s = speech();
	assert.equal(describeJump({ direction: "predecessor", index: 0, total: 1, type: "finish_to_start", origin: "Testing", speech: s }, defaultStrings),
		"Testing depends on this.");
	assert.equal(describeJump({ direction: "successor", index: 0, total: 1, type: "finish_to_finish", origin: "<b>Build</b>", speech: s }, defaultStrings),
		"This depends on Build, finish to finish.");
});

test("N4 and N5", () => {
	assert.equal(describeNoJump("predecessor", defaultStrings), "Depends on nothing.");
	assert.equal(describeNoJump("successor", defaultStrings), "Nothing depends on this.");
	assert.equal(describeUnreachable({ index: 1, total: 5, name: "Budget approval", speech: speech() }, defaultStrings),
		"2 of 5, Budget approval, is filtered out. Focus did not move.");
	assert.equal(describeUnreachable({ index: 0, total: 1, name: "Budget approval", speech: speech() }, defaultStrings),
		"Budget approval is filtered out. Focus did not move.");
});
