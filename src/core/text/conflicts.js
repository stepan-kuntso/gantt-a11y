/**
 * Link conflicts (spec C1 to C6, D7). Pure: plain data, no DOM. Nothing is fixed.
 *
 * For a link source A -> target B:
 *   finish_to_start  B must not start before A ends
 *   start_to_start   B must not start before A starts
 *   finish_to_finish B must not end before A ends
 *   start_to_finish  B must not end before A starts
 * A lag moves A's date by the lag before comparing. In every type the
 * target (B) is the task that is "too early", by an amount.
 */
import { fill, taskName } from "./format.js";

const RULES = {
	finish_to_start: { source: "end", target: "start" },
	start_to_start: { source: "start", target: "start" },
	finish_to_finish: { source: "end", target: "end" },
	start_to_finish: { source: "start", target: "end" }
};

/** A stable key for a link's conflict, to compare before and after a change. */
export function conflictKey(conflict) {
	return conflict.link && conflict.link.id !== undefined
		? String(conflict.link.id)
		: [conflict.source.id, conflict.target.id, conflict.type].join("|");
}

/**
 * @param {object} input
 * @param {string|number} input.taskId  only links touching this task are checked
 * @param {Array<{id?, source, target, type: string, lag?: number}>} input.links  type is a link type name
 * @param {(id) => ({id, name, start: Date, end: Date}|null)} input.getTask
 * @param {(date: Date, lag: number) => Date} [input.applyLag]  defaults to ignoring lag
 * @param {(from: Date, to: Date) => number} [input.amountBetween]  in duration units; defaults to days
 * @returns {Array<{type: string, source: object, target: object, link: object, amount: number}>}
 */
export function findConflicts({ taskId, links, getTask, applyLag, amountBetween }) {
	const id = String(taskId);
	return findLinkConflicts({
		links: links.filter((link) => String(link.source) === id || String(link.target) === id),
		getTask, applyLag, amountBetween
	});
}

/**
 * The conflicts of the given links, each link checked once (for the whole
 * chart: one pass over its links).
 * @param {object} input  as for findConflicts, without taskId
 * @returns {Array<{type: string, source: object, target: object, link: object, amount: number}>}
 */
export function findLinkConflicts({ links, getTask, applyLag, amountBetween }) {
	const shift = applyLag || ((date) => date);
	const between = amountBetween || ((from, to) => (to.getTime() - from.getTime()) / 86400000);
	const conflicts = [];
	for (const link of links) {
		const rule = RULES[link.type];
		const source = getTask(link.source);
		const target = getTask(link.target);
		if (!rule || !source || !target) {
			continue;
		}
		const sourceDate = source[rule.source];
		const targetDate = target[rule.target];
		if (!(sourceDate instanceof Date) || !(targetDate instanceof Date)) {
			continue;
		}
		const required = link.lag ? shift(sourceDate, link.lag) : sourceDate;
		if (targetDate.getTime() < required.getTime()) {
			conflicts.push({ type: link.type, source, target, link, amount: Math.max(1, Math.ceil(between(targetDate, required) - 1e-9)) });
		}
	}
	return conflicts;
}

/**
 * Conflict text appended to the result of a change of `taskId` (spec D7).
 *
 * @param {object} input
 * @param {string|number} input.taskId  the task just changed
 * @param {Array} input.conflicts  from findConflicts, after the change
 * @param {Set<string>} [input.before]  conflictKey()s before the change
 * @param {"brief"|"standard"|"detailed"} [input.level="standard"]
 * @param {string} input.unit  duration unit, e.g. "day"
 * @param {object} input.speech
 * @param {object} strings
 * @returns {string}  "" when there is nothing to say
 */
export function describeConflicts({ taskId, conflicts, before, level = "standard", unit, speech }, strings) {
	const c = strings.conflicts;
	if (!conflicts.length) {
		return before && before.size ? c.resolved : "";
	}
	const selfIsLate = (conflict) => String(conflict.target.id) === String(taskId);
	const otherName = (conflict) => taskName(selfIsLate(conflict) ? conflict.source.name : conflict.target.name, strings);
	const amount = (conflict) => speech.duration(conflict.amount, unit);

	if (conflicts.length > 1) {
		const largest = conflicts.reduce((a, b) => (b.amount > a.amount ? b : a));
		return fill(selfIsLate(largest) ? c.several : c.severalOther, {
			count: speech.count(conflicts.length, "conflict"),
			amount: amount(largest),
			other: otherName(largest)
		});
	}
	const conflict = conflicts[0];
	if (level === "brief") {
		return fill(c.brief, { other: otherName(conflict) });
	}
	if (level === "detailed") {
		const lag = Number(conflict.link && conflict.link.lag) || 0;
		const rules = lag > 0 ? c.ruleLag : (lag < 0 ? c.ruleLead : c.rule);
		const rule = fill(rules[conflict.type], {
			other: taskName(conflict.source.name, strings),
			lag: speech.duration(Math.abs(lag), unit)
		});
		return selfIsLate(conflict)
			? fill(c.detailed, { amount: amount(conflict), rule })
			: fill(c.detailedOther, { other: otherName(conflict), amount: amount(conflict), rule });
	}
	return selfIsLate(conflict)
		? fill(c.tooEarlyFor, { amount: amount(conflict), other: otherName(conflict) })
		: fill(c.otherTooEarly, { other: otherName(conflict), amount: amount(conflict) });
}
