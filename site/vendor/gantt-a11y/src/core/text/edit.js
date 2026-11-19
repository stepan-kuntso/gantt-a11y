/**
 * Keyboard editing without the form (spec E1 to E7, D9, D11).
 * Pure: plain data, date arithmetic passed in, no DOM.
 */
import { fill } from "./format.js";

/**
 * Why a task cannot be edited from the keyboard, or null if it can.
 * @param {object} task
 * @param {{readonly: boolean, isProject: boolean, isMilestone: boolean}} facts
 * @param {"move"|"duration"} action
 * @returns {"readonly"|"project"|"milestone"|null}
 */
export function editBlocker(task, facts, action) {
	if (facts.readonly) {
		return "readonly";
	}
	if (facts.isProject) {
		return "project";
	}
	if (action === "duration" && facts.isMilestone) {
		return "milestone";
	}
	return null;
}

/**
 * New dates after moving a task by whole calendar days; duration is kept.
 * @param {{start: Date, duration: number}} task
 * @param {number} days  negative moves earlier
 * @param {(date: Date, days: number) => Date} addDays
 * @param {(start: Date, duration: number) => Date} endDate
 * @returns {{start: Date, end: Date, duration: number}}
 */
export function planMove(task, days, addDays, endDate) {
	const start = addDays(task.start, days);
	return { start: start, end: endDate(start, task.duration), duration: task.duration };
}

/**
 * New duration after a step; never below `min` (the form does the same).
 * Returns null when the duration cannot change.
 * @returns {{start: Date, end: Date, duration: number}|null}
 */
export function planDuration(task, step, min, endDate) {
	const duration = Math.max(min, Number(task.duration) + step);
	if (duration === Number(task.duration)) {
		return null;
	}
	return { start: task.start, end: endDate(task.start, duration), duration };
}

/**
 * Key presses on one task within `windowMs` of each other form a burst;
 * the announcement describes the running total (spec D9).
 * @param {object|null} burst  {id, days, durationDelta, moves, resizes, at}
 * @param {string|number} id
 * @param {{days?: number, durationDelta?: number}} change  this press
 * @param {number} now  ms
 * @param {number} windowMs
 * @returns {{id, days: number, durationDelta: number, moves: number, resizes: number, at: number}}
 */
export function nextBurst(burst, id, change, now, windowMs) {
	const same = burst && String(burst.id) === String(id) && now - burst.at <= windowMs;
	const base = same ? burst : { days: 0, durationDelta: 0, moves: 0, resizes: 0 };
	const days = change.days || 0;
	const durationDelta = change.durationDelta || 0;
	return {
		id,
		days: base.days + days,
		durationDelta: base.durationDelta + durationDelta,
		moves: base.moves + (days ? 1 : 0),
		resizes: base.resizes + (durationDelta ? 1 : 0),
		at: now
	};
}

/**
 * Text for a refused edit (D11): what did not happen, then why.
 * @param {"readonly"|"project"|"milestone"} reason
 * @param {"brief"|"standard"|"detailed"} level
 * @param {object} strings
 * @returns {string}
 */
export function describeRefusal(reason, level, strings) {
	if (reason === "readonly" && level === "brief") {
		return strings.edit.readonlyBrief;
	}
	return strings.edit[reason] || "";
}

/**
 * Text after a move or a duration change (E1 to E3, D9).
 *
 * @param {object} input
 * @param {{days, durationDelta, moves, resizes}} input.burst  running total including this press
 * @param {{start: Date, end: Date, duration: number}} input.task  after the change
 * @param {boolean} input.isMilestone
 * @param {boolean} [input.atMinimum]  the duration could not go lower on this press
 * @param {"brief"|"standard"|"detailed"} input.level
 * @param {boolean} input.weekday  weekday in dates
 * @param {string} input.unit  duration unit, e.g. "day"
 * @param {object} input.speech
 * @param {object} strings
 * @returns {string}
 */
export function describeEdit({ burst, task, isMilestone, atMinimum = false, level, weekday, unit, speech }, strings) {
	const e = strings.edit;
	const end = speech.end(task.start, task.end);
	const range = speech.range(task.start, end);
	const duration = speech.duration(task.duration, unit);
	const parts = [];

	// Moves that net out to zero (D9, point 5).
	if (burst.moves && burst.days === 0 && !burst.durationDelta) {
		return fill(e.back, { range });
	}
	// Size of the change: from the second press of a burst on, always at Detailed.
	const showDelta = (presses) => level !== "brief" && (presses > 1 || level === "detailed");
	if (burst.days && showDelta(burst.moves)) {
		parts.push(fill(burst.days > 0 ? e.later : e.earlier, { delta: speech.count(Math.abs(burst.days), "day") }));
	}
	if (burst.durationDelta && showDelta(burst.resizes)) {
		parts.push(fill(burst.durationDelta > 0 ? e.longer : e.shorter,
			{ delta: speech.duration(Math.abs(burst.durationDelta), unit) }));
	}

	if (burst.moves) {
		if (isMilestone) {
			parts.push(fill(e.milestoneMoved, { date: speech.date(task.start, { weekday }) }));
		} else if (level === "brief") {
			parts.push(fill(e.movedBrief, { range }));
		} else {
			parts.push(fill(e.moved, {
				start: speech.date(task.start, { weekday }),
				end: speech.date(end, { weekday })
			}));
		}
		return parts.join(" ");
	}
	if (level === "brief") {
		parts.push(fill(e.durationBrief, { duration }));
	} else {
		parts.push(fill(atMinimum ? e.durationAtMinimum : e.duration, { duration, end: speech.date(end, { weekday }) }));
	}
	return parts.join(" ");
}

/** "Already 1 day, the minimum." (E4) */
export function describeMinimum(duration, unit, speech, strings) {
	return fill(strings.edit.minimum, { duration: speech.duration(duration, unit) });
}
