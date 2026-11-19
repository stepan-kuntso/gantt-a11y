import { test } from "node:test";
import assert from "node:assert/strict";

import { createPager } from "../src/core/pager.js";
import { createHints } from "../src/core/hints.js";

const pages = [{ text: "one", nextCount: 3 }, { text: "two", nextCount: 2 }, { text: "three", nextCount: 0 }];

test("pager: the same command on the same task within the window goes on, then starts over", () => {
	const pager = createPager(5000);
	let builds = 0;
	const build = () => { builds++; return pages; };
	assert.equal(pager.next("dependencies", 4, build, 0).text, "one");
	assert.equal(pager.next("dependencies", 4, build, 1000).text, "two");
	assert.equal(pager.next("dependencies", "4", build, 2000).text, "three");
	assert.equal(pager.next("dependencies", 4, build, 3000).text, "one");
	assert.equal(builds, 2);
});

test("pager: another task, another command or a pause starts again", () => {
	const pager = createPager(5000);
	const build = () => pages;
	pager.next("dependencies", 4, build, 0);
	assert.equal(pager.next("dependencies", 5, build, 100).text, "one");
	assert.equal(pager.next("concurrent", 5, build, 200).text, "one");
	assert.equal(pager.next("concurrent", 5, build, 9000).text, "one");
});

test("hints: at most three times each, or never when off", () => {
	const hints = createHints();
	assert.deepEqual([1, 2, 3, 4].map(() => hints.take("nextPage", "Press again.")), ["Press again.", "Press again.", "Press again.", ""]);
	assert.equal(hints.take("opened", "Opened X."), "Opened X.");
	assert.equal(createHints({ enabled: false }).take("nextPage", "Press again."), "");
});
