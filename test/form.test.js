import { test } from "node:test";
import assert from "node:assert/strict";

import { describeFormResult, describeFormValue, describeSaved, diffFields, sameValue } from "../src/core/text/form.js";
import { defaultStrings } from "../src/core/strings.js";
import { day, speech } from "./helpers.js";

const change = (field, label, listLabel, to, from, isColumn = true) => ({ field, label, listLabel, to, from, isColumn });
const duration = change("duration", "Duration", "duration", "8 days", "5");
const start = change("start_date", "Start", "start", "15 June", "13 June");
const progress = change("progress", "Progress", "progress", "60 percent", "40", false);

function saved(changes, extra = {}) {
	return describeSaved({ changes, endChanged: true, endDate: "20 June", level: "standard", speech: speech(), ...extra }, defaultStrings);
}

test("sameValue and diffFields", () => {
	assert.equal(sameValue(day(1), new Date(day(1))), true);
	assert.equal(sameValue(day(1), "2026-06-01"), false);
	assert.equal(sameValue(null, ""), true);
	assert.equal(sameValue(5, "5"), true);
	assert.deepEqual(diffFields({ text: "A", duration: 5 }, { text: "A", duration: 6 }, ["text", "duration"]).map((c) => c.field), ["duration"]);
});

test("F1: one or two table fields with new and old value, then the new end", () => {
	assert.deepEqual(saved([duration]), { messages: ["Saved. Duration 8 days, was 5. Ends 20 June."], withLabel: false });
	assert.deepEqual(saved([start, duration]).messages, ["Saved. Start 15 June, was 13 June. Duration 8 days, was 5. Ends 20 June."]);
});

test("F2: three or more as field names, and the row label follows", () => {
	const name = change("name", "Name", "name", "Acceptance testing", "Testing");
	const type = change("type", "Type", "type", "Project", "Task");
	assert.deepEqual(saved([name, start, duration, type]), {
		messages: ["Saved, 4 changes: name, start, duration, type."],
		withLabel: true
	});
});

test("F3 and F4: nothing changed; a field outside the table is spoken with its value", () => {
	assert.deepEqual(saved([]), { messages: ["Saved, no changes."], withLabel: false });
	assert.deepEqual(saved([progress], { endChanged: false }).messages, ["Saved. Progress 60 percent, was 40."]);
	const priority = change("priority", "Priority", "priority", "high", "normal", false);
	assert.deepEqual(saved([start, duration, change("name", "Name", "name", "B", "A"), priority]).messages,
		["Saved, 3 changes: start, duration, name. Priority high, was normal."]);
});

test("a changed name is followed by the row label; an emptied value says empty", () => {
	assert.equal(saved([change("name", "Name", "name", "Acceptance testing", "Testing")], { endChanged: false }).withLabel, true);
	assert.deepEqual(saved([change("owner", "Owner", "owner", "", "Anna", false)], { endChanged: false }).messages,
		["Saved. Owner empty, was Anna."]);
});

test("Brief and Detailed levels", () => {
	assert.deepEqual(saved([duration], { level: "brief" }), { messages: ["Saved, 1 change: duration."], withLabel: true });
	const end = change("end_date", "End", "end", "20 June", "17 June");
	const detailed = saved([change("name", "Name", "name", "Acceptance testing", "Testing"), start, change("duration", "Duration", "duration", "8 days", "5 days"), end, progress],
		{ level: "detailed" });
	assert.deepEqual(detailed.messages, [
		"Saved, 5 changes. Name Acceptance testing, was Testing. Start 15 June, was 13 June.",
		"Duration 8 days, was 5 days. End 20 June, was 17 June.",
		"Progress 60 percent, was 40."
	]);
});

test("F5 to F9", () => {
	const s = speech();
	assert.equal(describeFormResult({ action: "cancelled" }, s, defaultStrings), "Cancelled. Nothing changed.");
	assert.equal(describeFormResult({ action: "created", name: "Security audit" }, s, defaultStrings), "Created Security audit.");
	assert.equal(describeFormResult({ action: "discarded" }, s, defaultStrings), "New task discarded.");
	assert.equal(describeFormResult({ action: "deleted", name: "Retrospective" }, s, defaultStrings), "Deleted Retrospective.");
	assert.equal(describeFormResult({ action: "deleted", name: "Backend", subtasks: 6, links: 4 }, s, defaultStrings),
		"Deleted Backend and 6 subtasks. 4 links removed.");
	assert.equal(describeFormResult({ action: "deleted", name: "<b>Launch</b>", links: 1 }, s, defaultStrings),
		"Deleted Launch. 1 link removed.");
	assert.equal(describeFormResult({ action: "other" }, s, defaultStrings), "");
});

test("F10: value while the form is open", () => {
	assert.equal(describeFormValue({ changes: [{ label: "Duration", value: "6 days" }], endDate: "18 June" }, defaultStrings),
		"Duration 6 days. Ends 18 June.");
	assert.equal(describeFormValue({ changes: [], endDate: "18 June" }, defaultStrings), "Ends 18 June.");
});
