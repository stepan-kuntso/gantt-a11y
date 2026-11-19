/**
 * Dependency announcement (spec R2 to R7, D2). Pure: plain data, no DOM.
 * Linked tasks are {name, type, start, end, conflict}, where `type` is a
 * link type name such as "finish_to_start".
 */
import { fill, shortName, taskName } from "./format.js";

export const DEFAULT_LINK_TYPE = "finish_to_start";

/** Link type names, in the order used when cycling through them. */
export const LINK_TYPES = ["finish_to_start", "start_to_start", "finish_to_finish", "start_to_finish"];

/**
 * The spoken type of a link, or "" when it is the default or unknown
 * (finish to start is not spoken, spec 2.6), unless `always` is set.
 * @param {string|null} type  link type name
 */
export function spokenLinkType(type, strings, always = false) {
	if (!type || !strings.linkTypes[type]) {
		return "";
	}
	return always || type !== DEFAULT_LINK_TYPE ? strings.linkTypes[type] : "";
}

/**
 * Orders linked tasks the way they are read and visited (spec D2, D10):
 * tasks in conflict first, then the one that decides the schedule:
 * for predecessors the one that ends last, for successors the one that starts first.
 * Stable for equal keys.
 * @param {Array<{conflict?: boolean, start?: Date, end?: Date}>} items
 * @param {"predecessor"|"successor"} direction
 * @returns {Array}
 */
export function orderLinked(items, direction) {
	const time = (date, fallback) => (date instanceof Date ? date.getTime() : fallback);
	return items
		.map((item, index) => ({ item, index }))
		.sort((a, b) => {
			const conflict = (b.item.conflict ? 1 : 0) - (a.item.conflict ? 1 : 0);
			if (conflict) {
				return conflict;
			}
			const byDate = direction === "predecessor"
				? time(b.item.end, -Infinity) - time(a.item.end, -Infinity)
				: time(a.item.start, Infinity) - time(b.item.start, Infinity);
			return byDate || a.index - b.index;
		})
		.map((entry) => entry.item);
}

/**
 * Splits names after the first page into page sentences:
 * "4 to 6 of 8: A, B, C." ... "7 and 8 of 8: D, E. End of list."
 * @param {string[]} names  all names in order
 * @param {number} startIndex  index of the first name not yet spoken
 * @param {number} size
 * @param {object} speech
 * @param {object} strings
 * @returns {Array<{text: string, nextCount: number}>}
 */
export function namePages(names, startIndex, size, speech, strings) {
	const pages = [];
	for (let from = startIndex; from < names.length; from += size) {
		const chunk = names.slice(from, from + size);
		const to = from + chunk.length;
		const template = chunk.length === 1 ? strings.pages.pageOfOne
			: (chunk.length === 2 ? strings.pages.pageOfTwo : strings.pages.page);
		let text = fill(template, {
			from: speech.number(from + 1),
			to: speech.number(to),
			total: speech.number(names.length),
			list: speech.list(chunk)
		});
		if (to >= names.length) {
			text += " " + strings.common.endOfList;
		}
		pages.push({ text, nextCount: Math.min(size, names.length - to) });
	}
	return pages;
}

/**
 * One direction of the announcement.
 * @returns {{first: string, countOnly: string, pages: Array<{text, nextCount}>, firstNextCount: number}|null}
 */
function section(direction, items, { limit, summaryFrom, alwaysTypes, speech, strings }) {
	const d = strings.dependencies;
	const prefix = direction === "predecessor" ? "dependsOn" : "requiredBy";
	const n = items.length;
	if (!n) {
		return null;
	}
	const names = items.map((item) => shortName(taskName(item.name, strings)));
	const types = items.map((item) => spokenLinkType(item.type, strings, alwaysTypes));
	const count = speech.number(n);
	const countOnly = fill(d[prefix + "Count"], { count });

	if (n === 1) {
		const item = types[0] ? fill(d.itemTyped, { name: names[0], type: types[0] }) : fill(d.item, { name: names[0] });
		return { first: fill(d[prefix + "One"], { item }), countOnly, pages: [], firstNextCount: 0 };
	}
	if (n <= limit) {
		if (types.some(Boolean)) {
			const sentences = names.map((name, i) => (types[i]
				? fill(d.itemTypedSentence, { name, type: types[i] })
				: fill(d.itemSentence, { name })));
			return { first: countOnly + " " + sentences.join(" "), countOnly, pages: [], firstNextCount: 0 };
		}
		return { first: fill(d[prefix + "List"], { count, list: speech.list(names) }), countOnly, pages: [], firstNextCount: 0 };
	}
	if (n < summaryFrom) {
		const first = fill(d[prefix + "First"], { count, shown: speech.number(limit), list: speech.list(names.slice(0, limit)) });
		return { first, countOnly, pages: namePages(names, limit, limit, speech, strings), firstNextCount: Math.min(limit, n - limit) };
	}
	// Many: the deciding task and the conflicts instead of names (spec D2).
	const decider = direction === "predecessor"
		? items.reduce((best, item) => (item.end > (best.end || 0) ? item : best), items[0])
		: items.reduce((best, item) => (item.start < (best.start || Infinity) ? item : best), items[0]);
	const date = direction === "predecessor"
		? speech.date(speech.end(decider.start, decider.end))
		: speech.date(decider.start);
	let first = fill(d[prefix + "Summary"], { count, name: shortName(taskName(decider.name, strings)), date });
	const conflicted = items.filter((item) => item.conflict);
	if (conflicted.length) {
		first += " " + fill(d.inConflict, {
			count: speech.number(conflicted.length),
			list: speech.list(conflicted.slice(0, limit).map((item) => shortName(taskName(item.name, strings))))
		});
	}
	return { first, countOnly, pages: namePages(names, 0, limit, speech, strings), firstNextCount: Math.min(limit, n) };
}

/**
 * Builds the dependency announcement as pages: the first is spoken on the
 * first press, the others on further presses of the same key (spec D2).
 *
 * @param {object} input
 * @param {Array<{name, type, start, end, conflict}>} input.predecessors  in reading order
 * @param {Array<{name, type, start, end, conflict}>} input.successors
 * @param {number} input.limit  names before paging (3, or 5 at the Detailed level)
 * @param {number} [input.summaryFrom=10]  from this count, no names on the first press
 * @param {boolean} [input.alwaysTypes=false]  speak finish to start too
 * @param {object} input.speech  from createSpeech
 * @param {object} input.strings
 * @returns {Array<{text: string, nextCount: number}>}  nextCount: names on the next page
 */
export function dependencyPages({ predecessors, successors, limit, summaryFrom = 10, alwaysTypes = false, speech, strings }) {
	const options = { limit, summaryFrom, alwaysTypes, speech, strings };
	const pred = section("predecessor", predecessors, options);
	const succ = section("successor", successors, options);
	if (!pred && !succ) {
		return [{ text: strings.dependencies.none, nextCount: 0 }];
	}
	const paged = (pred && pred.pages.length) || (succ && succ.pages.length);
	if (!paged) {
		return [{ text: [pred && pred.first, succ && succ.first].filter(Boolean).join(" "), nextCount: 0 }];
	}
	// One direction is long: its first page, then the other direction
	// in full if it is short, or as a count if it is long too.
	const lead = pred || succ;
	const other = pred ? succ : null;
	let text = lead.first;
	if (other) {
		text += " " + (other.pages.length ? other.countOnly : other.first);
	}
	const pages = [{ text, nextCount: lead.firstNextCount }];
	pages.push(...lead.pages);
	if (other && other.pages.length) {
		pages[pages.length - 1].nextCount = other.firstNextCount || 1;
		pages.push({ text: other.first, nextCount: other.firstNextCount });
		pages.push(...other.pages);
	}
	return pages;
}
