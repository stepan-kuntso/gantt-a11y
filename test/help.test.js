import { test } from "node:test";
import assert from "node:assert/strict";

import { helpPages } from "../src/core/text/help.js";
import { defaultStrings, mergeStrings } from "../src/core/strings.js";
import { uk } from "../src/locales/uk.js";
import { speech } from "./helpers.js";

const cmd = (id, description, spokenKey) => ({ id, description, spokenKey });

test("groups in a fixed order, at most four keys each, action before key", () => {
	const pages = helpPages([
		cmd("help", "Help", "Shift H"),
		cmd("dependencies", "Dependencies", "Shift D"),
		cmd("goToPredecessor", "To what this depends on", "Shift P"),
		cmd("concurrent", "Same time", "Shift O"),
		cmd("endsBefore", "Ends before", "Shift B"),
		cmd("startsAfter", "Starts after", "Shift A"),
		cmd("goToSuccessor", "To what depends on this", "Shift S"),
		cmd("repeat", "Repeat last", "Shift R")
	], speech(), defaultStrings);
	assert.deepEqual(pages.map((page) => page.text), [
		"Reading, 1 of 3. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.",
		"Moving focus, 2 of 3. To what this depends on, Shift P key. To what depends on this, Shift S key.",
		"Other, 3 of 3. Help, Shift H key. Repeat last, Shift R key."
	]);
	assert.deepEqual(pages.map((page) => page.nextCount), [1, 1, 0]);
});

test("a group with more than four keys is split", () => {
	const pages = helpPages(["moveEarlier", "moveLater", "longer", "shorter", "link"].map((id) => cmd(id, id, "K")), speech(), defaultStrings);
	assert.equal(pages.length, 2);
	assert.equal(pages[0].text, "Changing, 1 of 2. moveEarlier, K key. moveLater, K key. longer, K key. shorter, K key. Press again within 5 seconds for the next group.");
	assert.equal(pages[1].text, "Links, 2 of 2. link, K key.");
});

test("only what is registered is spoken", () => {
	assert.deepEqual(helpPages([cmd("help", "Help", "Shift H")], speech(), defaultStrings).map((p) => p.text), ["Other, 1 of 1. Help, Shift H key."]);
});

test("only the first group says how to go on, and only when there is a next group", () => {
	const pages = helpPages(["dependencies", "whereAmI", "help"].map((id) => cmd(id, id, "K")), speech(), defaultStrings);
	assert.match(pages[0].text, / Press again within 5 seconds for the next group\.$/);
	assert.ok(pages.slice(1).every((page) => !page.text.includes("Press again")));
	const one = helpPages([cmd("help", "Help", "Shift H")], speech(), defaultStrings);
	assert.ok(!one[0].text.includes("Press again"));
});

test("the sentence about the next group in Ukrainian", () => {
	const pages = helpPages([cmd("dependencies", "Залежності", "Shift D"), cmd("help", "Довідка", "Shift H")], speech(), mergeStrings(uk));
	assert.equal(pages[0].text, "Читання, 1 з 2. Залежності: клавіші Shift D. Натисніть ще раз протягом 5 секунд, щоб почути наступну групу.");
});
