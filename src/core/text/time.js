/**
 * Time queries about one task (spec R8 to R11, D6). Pure: plain data, no DOM.
 */
import { fill, shortName, taskName } from "./format.js";
import { namePages } from "./dependencies.js";

function hasDates(task) {
	return task && task.start instanceof Date && task.end instanceof Date;
}

function isZeroLength(task) {
	return task.start.getTime() === task.end.getTime();
}

/**
 * Two date ranges overlap if they share time. A zero-length task
 * (milestone) overlaps a range it lies inside, including its edges.
 */
export function overlaps(a, b) {
	const start = Math.max(a.start.getTime(), b.start.getTime());
	const end = Math.min(a.end.getTime(), b.end.getTime());
	return start < end || ((isZeroLength(a) || isZeroLength(b)) && start <= end);
}

/**
 * How another task overlaps the focused one (spec D6):
 * "whole" (covers all of it), "first" (its beginning), "last" (its end),
 * "middle" (lies inside), or "milestone".
 * @returns {{kind: string, start: Date, end: Date}}
 */
export function overlapExtent(task, other) {
	const start = new Date(Math.max(task.start.getTime(), other.start.getTime()));
	const end = new Date(Math.min(task.end.getTime(), other.end.getTime()));
	if (isZeroLength(other)) {
		return { kind: "milestone", start, end };
	}
	const coversStart = other.start <= task.start;
	const coversEnd = other.end >= task.end;
	const kind = coversStart && coversEnd ? "whole" : (coversStart ? "first" : (coversEnd ? "last" : "middle"));
	return { kind, start, end };
}

/**
 * @param {object} input
 * @param {object} input.task  the task asked about
 * @param {object[]} input.tasks  candidates; tasks without dates are skipped
 * @param {"concurrent"|"before"|"after"} input.relation
 * @param {Array<string|number>} [input.excludeIds]  e.g. its parents and subtasks
 * @returns {object[]}  concurrent: whole-time overlaps first, then longest overlap;
 *                      before/after: nearest first
 */
export function findTasksInTime({ task, tasks, relation, excludeIds = [] }) {
	if (!hasDates(task)) {
		return [];
	}
	const excluded = new Set(excludeIds.map(String));
	excluded.add(String(task.id));
	const candidates = tasks.filter((other) => hasDates(other) && !excluded.has(String(other.id)));

	switch (relation) {
		case "concurrent": {
			const rank = { whole: 0, first: 1, last: 1, middle: 1, milestone: 2 };
			return candidates
				.filter((other) => overlaps(task, other))
				.map((other, index) => ({ other, index, extent: overlapExtent(task, other) }))
				.sort((a, b) => (rank[a.extent.kind] - rank[b.extent.kind])
					|| ((b.extent.end - b.extent.start) - (a.extent.end - a.extent.start))
					|| (a.index - b.index))
				.map((entry) => entry.other);
		}
		case "before":
			return candidates
				.filter((other) => other.end <= task.start && !overlaps(task, other))
				.sort((a, b) => b.end - a.end);
		case "after":
			return candidates
				.filter((other) => other.start >= task.end && !overlaps(task, other))
				.sort((a, b) => a.start - b.start);
		default:
			return [];
	}
}

/** "Documentation, first 2 days" / "milestone Go-live, on 15 June" */
function concurrentItem(task, other, { speech, strings, unit, durationBetween }, sentence) {
	const t = strings.time;
	const name = shortName(taskName(other.name, strings));
	const extent = overlapExtent(task, other);
	if (extent.kind === "milestone") {
		return fill(sentence ? t.milestoneItemSentence : t.milestoneItem, { name, date: speech.date(other.start) });
	}
	let text;
	if (extent.kind === "whole") {
		text = t.whole;
	} else {
		const amount = Math.max(1, Math.round(durationBetween(extent.start, extent.end)));
		if (extent.kind === "middle") {
			text = fill(t.middle, { duration: speech.duration(amount, unit) });
		} else if (amount === 1 && strings.unitNames[unit]) {
			text = fill(extent.kind === "first" ? t.firstOne : t.lastOne, { unit: strings.unitNames[unit] });
		} else {
			text = fill(extent.kind === "first" ? t.first : t.last, { duration: speech.duration(amount, unit) });
		}
	}
	return fill(sentence ? t.itemSentence : t.item, { name, extent: text });
}

/**
 * Pages for "tasks at the same time" (R8 to R10).
 * @param {object} input
 * @param {object} input.task
 * @param {object[]} input.found  from findTasksInTime(..., "concurrent")
 * @param {number} input.limit
 * @param {string} input.unit  duration unit, e.g. "day"
 * @param {(start: Date, end: Date) => number} input.durationBetween
 * @param {object} input.speech
 * @param {object} strings
 * @returns {Array<{text: string, nextCount: number}>}
 */
export function concurrentPages({ task, found, limit, unit, durationBetween, speech }, strings) {
	const t = strings.time;
	const options = { speech, strings, unit, durationBetween };
	if (!found.length) {
		return [{ text: t.concurrentNone, nextCount: 0 }];
	}
	const count = speech.count(found.length, "task");
	if (found.length === 1) {
		return [{ text: fill(t.concurrentOne, { count, item: concurrentItem(task, found[0], options, false) }), nextCount: 0 }];
	}
	if (found.length <= limit) {
		const items = found.map((other) => concurrentItem(task, other, options, true)).join(" ");
		return [{ text: fill(t.concurrentFew, { count, items }), nextCount: 0 }];
	}
	// Many: group by kind of overlap (D6).
	const whole = found.filter((other) => overlapExtent(task, other).kind === "whole");
	const partly = found.filter((other) => overlapExtent(task, other).kind !== "whole");
	const parts = [fill(t.concurrentMany, { count })];
	if (whole.length) {
		parts.push(fill(t.concurrentWhole, {
			count: speech.number(whole.length),
			list: speech.list(whole.slice(0, limit).map((other) => shortName(taskName(other.name, strings))))
		}));
	}
	if (partly.length) {
		parts.push(fill(t.concurrentPartly, { count: speech.number(partly.length) }));
	}
	const pages = [{ text: parts.join(" "), nextCount: Math.min(limit, partly.length) }];
	for (let from = 0; from < partly.length; from += limit) {
		const chunk = partly.slice(from, from + limit);
		const to = from + chunk.length;
		let text = fill(t.partlyPage, {
			from: speech.number(from + 1),
			to: speech.number(to),
			total: speech.number(partly.length),
			items: chunk.map((other) => concurrentItem(task, other, options, true)).join(" ")
		});
		if (to >= partly.length) {
			text += " " + strings.common.endOfList;
		}
		pages.push({ text, nextCount: Math.min(limit, partly.length - to) });
	}
	return pages;
}

/**
 * Pages for "end before this starts" / "start after this ends" (R11):
 * the count and the nearest task, then the others on further presses.
 * @returns {Array<{text: string, nextCount: number}>}
 */
export function beforeAfterPages({ found, relation, limit, speech }, strings) {
	const t = strings.time;
	if (!found.length) {
		return [{ text: relation === "before" ? t.beforeNone : t.afterNone, nextCount: 0 }];
	}
	const nearest = found[0];
	const date = relation === "before"
		? speech.date(speech.end(nearest.start, nearest.end))
		: speech.date(nearest.start);
	const text = fill(speech.plural(found.length, relation === "before" ? t.before : t.after), {
		count: speech.count(found.length, "task"),
		name: shortName(taskName(nearest.name, strings)),
		date
	});
	const names = found.map((task) => shortName(taskName(task.name, strings)));
	return [{ text, nextCount: Math.min(limit, found.length - 1) }, ...namePages(names, 1, limit, speech, strings)];
}
