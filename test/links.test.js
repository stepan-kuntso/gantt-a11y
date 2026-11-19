import { test } from "node:test";
import assert from "node:assert/strict";

import { describeLinkCommand, linkBlocker, nextLinkType, wouldCreateLoop } from "../src/core/text/links.js";
import { spokenKey } from "../src/core/keys.js";
import { defaultStrings } from "../src/core/strings.js";

const links = [{ source: 1, target: 2 }, { source: 2, target: 3 }];

test("wouldCreateLoop follows existing links from the target back to the source", () => {
	assert.equal(wouldCreateLoop(3, 1, links), true);
	assert.equal(wouldCreateLoop(3, 2, links), true);
	assert.equal(wouldCreateLoop(1, 3, links), false);
	assert.equal(wouldCreateLoop(4, 1, links), false);
});

test("linkBlocker checks read-only, same task, existing link, loop, application rule", () => {
	const base = { links, readonly: false, allowed: true };
	assert.equal(linkBlocker({ ...base, sourceId: 1, targetId: 3 }), null);
	assert.equal(linkBlocker({ ...base, sourceId: 1, targetId: 3, readonly: true }), "readonly");
	assert.equal(linkBlocker({ ...base, sourceId: 1, targetId: "1" }), "same");
	assert.equal(linkBlocker({ ...base, sourceId: 1, targetId: 2 }), "exists");
	assert.equal(linkBlocker({ ...base, sourceId: 3, targetId: 1 }), "loop");
	assert.equal(linkBlocker({ ...base, sourceId: 1, targetId: 3, allowed: false }), "notAllowed");
});

test("nextLinkType cycles through the four types", () => {
	assert.equal(nextLinkType("finish_to_start"), "start_to_start");
	assert.equal(nextLinkType("start_to_finish"), "finish_to_start");
});

test("texts for marking, type, cancelling and creating", () => {
	const s = defaultStrings;
	assert.equal(describeLinkCommand({ result: "marked", name: "Testing" }, s), "Link from Testing.");
	assert.equal(describeLinkCommand({ result: "type", type: "start_to_start" }, s), "Type: start to start.");
	assert.equal(describeLinkCommand({ result: "cancelled" }, s), "Link cancelled.");
	assert.equal(describeLinkCommand({ result: "created", name: "Testing", type: "finish_to_start" }, s), "Linked. This depends on Testing.");
	assert.equal(describeLinkCommand({ result: "created", name: "Testing", type: "start_to_start" }, s),
		"Linked. This depends on Testing, start to start.");
	assert.equal(describeLinkCommand({ result: "noSource", key: "Shift L" }, s), "No task marked for a link. Press Shift L on a task first.");
});

test("refusals say what did not happen, then why", () => {
	const s = defaultStrings;
	assert.equal(describeLinkCommand({ result: "blocked", reason: "loop", name: "Implementation" }, s),
		"Link not created. It would make a loop: Implementation already depends on this.");
	assert.equal(describeLinkCommand({ result: "blocked", reason: "exists", name: "Testing" }, s),
		"Link not created. This already depends on Testing.");
	assert.equal(describeLinkCommand({ result: "blocked", reason: "notAllowed" }, s), "Link not created. Not allowed here.");
	assert.equal(describeLinkCommand({ result: "blocked", reason: "readonly" }, s), "Read-only. Not changed.");
	assert.equal(describeLinkCommand({ result: "blocked", reason: "failed" }, s), "Link not created.");
});

test("removing: confirm, removed, nothing to remove", () => {
	const s = defaultStrings;
	assert.equal(describeLinkCommand({ result: "confirmRemove", name: "Launch", direction: "predecessor" }, s),
		"Press again to remove the link: Launch depends on this.");
	assert.equal(describeLinkCommand({ result: "removed", name: "Implementation", direction: "successor" }, s),
		"Link removed. This no longer depends on Implementation.");
	assert.equal(describeLinkCommand({ result: "noContext" }, s), "Nothing to remove. First go to a linked task with the go-to keys.");
	assert.equal(describeLinkCommand({ result: "notRemoved", reason: "readonly" }, s), "Read-only. Not changed.");
});

test("spokenKey turns shortcuts into words", () => {
	assert.equal(spokenKey("shift+l", defaultStrings), "Shift L");
	assert.equal(spokenKey("alt+shift+left", defaultStrings), "Alt Shift Left");
	assert.equal(spokenKey("ctrl+f5", defaultStrings), "Control F5");
});
