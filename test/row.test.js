import { test } from "node:test";
import assert from "node:assert/strict";

import { describeRow } from "../src/core/text/row.js";
import { defaultStrings } from "../src/core/strings.js";
import { day, speech } from "./helpers.js";

const testing = { name: "Testing", start: day(13), end: day(18), duration: 5, progress: 0.4 };

function row(task, extra = {}) {
	return describeRow({ task, kind: "task", fields: ["name", "dates", "progress"], level: "standard", unit: "day", speech: speech(), ...extra }, defaultStrings);
}

test("R1 at the three levels", () => {
	assert.equal(row(testing), "Testing. 13 to 17 June, 5 days. 40 percent done.");
	assert.equal(row(testing, { level: "brief" }), "Testing. 13 June, 5 days. 40 percent done.");
	assert.equal(row(testing, { level: "detailed", fields: ["name", "parent", "dates", "progress"], parentName: "Backend" }),
		"Testing. In Backend. Start 13 June. End 17 June. 5 days. 40 percent done.");
});

test("Gantt's own end date by default", () => {
	assert.equal(row(testing, { speech: speech({ endDates: "gantt" }) }), "Testing. 13 to 18 June, 5 days. 40 percent done.");
});

test("D5: no dates, zero duration, milestone, project, collapsed project with conflicts", () => {
	assert.equal(row({ name: "Translation" }), "Translation. Not scheduled.");
	assert.equal(row({ name: "Sign-off", start: day(20), end: day(20), duration: 0 }), "Sign-off. 20 June, no duration.");
	assert.equal(row({ name: "Go-live", start: day(20), end: day(20), duration: 0, progress: 0 }, { kind: "milestone" }),
		"Go-live. Milestone, 20 June.");
	const project = { name: "Website redesign", start: day(1), end: day(23), duration: 22, progress: 0.35 };
	assert.equal(row(project, { kind: "project", childCount: 10 }), "Website redesign. Project, 1 to 22 June, 10 tasks. 35 percent done.");
	assert.equal(row(project, { kind: "project", childCount: 10, conflictsInside: 2 }),
		"Website redesign. Project, 1 to 22 June, 10 tasks. 35 percent done. 2 conflicts inside.");
});

test("optional fields: parent only when set and not top level, link counts, custom order", () => {
	assert.equal(row(testing, { fields: ["name", "parent", "dates"], parentName: null }), "Testing. 13 to 17 June, 5 days.");
	assert.equal(row(testing, { fields: ["name", "dates", "links"], linkCounts: { predecessors: 1, successors: 2 } }),
		"Testing. 13 to 17 June, 5 days. Depends on 1. Required by 2.");
	assert.equal(row(testing, { fields: ["dates", "name"] }), "13 to 17 June, 5 days. Testing.");
	assert.equal(row({ ...testing, progress: undefined }), "Testing. 13 to 17 June, 5 days.");
	assert.equal(row({ ...testing, name: "<b>QA</b> &amp; tests" }), "QA & tests. 13 to 17 June, 5 days. 40 percent done.");
});
