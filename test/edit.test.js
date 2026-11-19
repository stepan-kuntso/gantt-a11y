import { test } from "node:test";
import assert from "node:assert/strict";

import { describeEdit, describeMinimum, describeRefusal, editBlocker, nextBurst, planDuration, planMove } from "../src/core/text/edit.js";
import { defaultStrings } from "../src/core/strings.js";
import { day, speech } from "./helpers.js";

const DAY = 86400000;
const addDays = (date, days) => new Date(date.getTime() + days * DAY);
const endDate = (start, duration) => addDays(start, duration);

function edit(burst, task, extra = {}) {
	return describeEdit({ burst, task, isMilestone: false, level: "standard", weekday: true, unit: "day", speech: speech(), ...extra }, defaultStrings);
}
const press = (change) => nextBurst(null, 4, change, 0, 1000);

test("editBlocker: read-only first, then project, then milestone for duration only", () => {
	const facts = { readonly: false, isProject: false, isMilestone: false };
	assert.equal(editBlocker({}, facts, "move"), null);
	assert.equal(editBlocker({}, { ...facts, readonly: true, isProject: true }, "move"), "readonly");
	assert.equal(editBlocker({}, { ...facts, isProject: true }, "duration"), "project");
	assert.equal(editBlocker({}, { ...facts, isMilestone: true }, "duration"), "milestone");
	assert.equal(editBlocker({}, { ...facts, isMilestone: true }, "move"), null);
});

test("planMove and planDuration", () => {
	const moved = planMove({ start: day(13), duration: 5 }, 1, addDays, endDate);
	assert.equal(moved.start.getTime(), day(14).getTime());
	assert.equal(moved.end.getTime(), day(19).getTime());
	assert.equal(planDuration({ start: day(13), duration: 5 }, 1, 1, endDate).duration, 6);
	assert.equal(planDuration({ start: day(13), duration: 1 }, -1, 1, endDate), null);
	assert.equal(planDuration({ start: day(13), duration: 2 }, -5, 1, endDate).duration, 1);
});

test("nextBurst keeps a running total for one task within the window", () => {
	let burst = nextBurst(null, 4, { days: 1 }, 0, 1000);
	burst = nextBurst(burst, 4, { days: 1 }, 500, 1000);
	burst = nextBurst(burst, 4, { durationDelta: -1 }, 900, 1000);
	assert.deepEqual(burst, { id: 4, days: 2, durationDelta: -1, moves: 2, resizes: 1, at: 900 });
	assert.equal(nextBurst(burst, 4, { days: 1 }, 2000, 1000).days, 1);
	assert.equal(nextBurst(burst, 5, { days: 1 }, 950, 1000).days, 1);
});

test("E1: one move: new start and end with weekdays, last day of work", () => {
	assert.equal(edit(press({ days: 1 }), { start: day(14), end: day(19), duration: 5 }),
		"Starts Sunday 14 June, ends Thursday 18 June.");
});

test("E2 and D9: running total, opposite directions net out", () => {
	let burst = null;
	for (let i = 0; i < 10; i++) {
		burst = nextBurst(burst, 4, { days: 1 }, i * 100, 1000);
	}
	assert.equal(edit(burst, { start: day(23), end: day(28), duration: 5 }),
		"10 days later. Starts Tuesday 23 June, ends Saturday 27 June.");
	burst = nextBurst(nextBurst(null, 4, { days: 1 }, 0, 1000), 4, { days: -1 }, 100, 1000);
	assert.equal(edit(burst, { start: day(13), end: day(18), duration: 5 }), "Back where it started. 13 to 17 June.");
});

test("E3: duration; a burst says how much longer; minimum inside a burst", () => {
	assert.equal(edit(press({ durationDelta: 1 }), { start: day(13), end: day(19), duration: 6 }),
		"6 days. Ends Thursday 18 June.");
	let burst = null;
	for (let i = 0; i < 3; i++) {
		burst = nextBurst(burst, 4, { durationDelta: -1 }, i * 100, 1000);
	}
	assert.equal(edit(burst, { start: day(13), end: day(14), duration: 1 }, { atMinimum: true }),
		"3 days shorter. 1 day, the minimum. Ends Saturday 13 June.");
});

test("move and resize in one burst", () => {
	let burst = nextBurst(null, 4, { days: -1 }, 0, 1000);
	burst = nextBurst(burst, 4, { durationDelta: -1 }, 100, 1000);
	assert.equal(edit(burst, { start: day(12), end: day(16), duration: 4 }),
		"Starts Friday 12 June, ends Monday 15 June.");
	burst = nextBurst(burst, 4, { days: -1 }, 200, 1000);
	burst = nextBurst(burst, 4, { durationDelta: -1 }, 300, 1000);
	assert.equal(edit(burst, { start: day(11), end: day(14), duration: 3 }),
		"2 days earlier. 2 days shorter. Starts Thursday 11 June, ends Saturday 13 June.");
});

test("Brief and Detailed levels, milestones", () => {
	assert.equal(edit(press({ days: 1 }), { start: day(14), end: day(19), duration: 5 }, { level: "brief", weekday: false }),
		"14 to 18 June.");
	assert.equal(edit(press({ days: 1 }), { start: day(14), end: day(19), duration: 5 }, { level: "detailed" }),
		"1 day later. Starts Sunday 14 June, ends Thursday 18 June.");
	assert.equal(edit(press({ durationDelta: 1 }), { start: day(13), end: day(19), duration: 6 }, { level: "brief", weekday: false }),
		"6 days.");
	assert.equal(edit(press({ days: 1 }), { start: day(21), end: day(21), duration: 0 }, { isMilestone: true }),
		"On Sunday 21 June.");
});

test("E4 to E7: refusals without the task name", () => {
	assert.equal(describeMinimum(1, "day", speech(), defaultStrings), "Already 1 day, the minimum.");
	assert.equal(describeRefusal("readonly", "standard", defaultStrings), "Read-only. Not changed.");
	assert.equal(describeRefusal("readonly", "brief", defaultStrings), "Read-only.");
	assert.equal(describeRefusal("project", "standard", defaultStrings), "Not changed. A project takes its dates from its subtasks.");
	assert.equal(describeRefusal("milestone", "standard", defaultStrings), "A milestone has no duration.");
});

test("default end date is the one gantt shows", () => {
	assert.equal(edit(press({ days: 1 }), { start: day(14), end: day(19), duration: 5 }, { speech: speech({ endDates: "gantt" }) }),
		"Starts Sunday 14 June, ends Friday 19 June.");
});
