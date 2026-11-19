/**
 * Orientation on demand (spec S2, R12, C5, D10): the chart summary, where am
 * I, the list of link conflicts, and the way back after jumps. Pure: plain
 * data, no DOM.
 */
import { fill, taskName } from "./format.js";
import { describeConflicts } from "./conflicts.js";

const scheduled = (task) => task.start instanceof Date && task.end instanceof Date;

/**
 * The chart summary (S2): "11 tasks. 1 to 23 June. No conflicts."
 *
 * @param {object} input
 * @param {Array<{name, start, end, type}>} input.tasks  all tasks
 * @param {number} input.shown  tasks that have a row now (not collapsed or filtered out)
 * @param {Array<{amount: number, source: object, target: object}>} input.conflicts  all link conflicts
 * @param {"brief"|"standard"|"detailed"} input.level
 * @param {string} input.unit
 * @param {object} input.speech
 * @param {object} strings
 * @returns {string}
 */
export function describeSummary({ tasks, shown, conflicts, level, unit, speech }, strings) {
	const o = strings.overview;
	if (!tasks.length) {
		return o.empty;
	}
	const parts = [];
	const count = speech.count(tasks.length, "task");
	parts.push(shown < tasks.length ? fill(o.tasksShown, { count, shown: speech.number(shown) }) : fill(o.tasks, { count }));
	if (level === "detailed") {
		const projects = tasks.filter((t) => t.type === "project").length;
		const milestones = tasks.filter((t) => t.type === "milestone").length;
		if (projects || milestones) {
			const kinds = [];
			if (projects) {
				kinds.push(speech.count(projects, "project"));
			}
			if (milestones) {
				kinds.push(speech.count(milestones, "milestone"));
			}
			parts.push(fill(o.kinds, { list: speech.list(kinds) }));
		}
	}
	const dated = tasks.filter(scheduled);
	if (dated.length) {
		// one pass: Math.min(...list) fails on very long lists
		const start = new Date(dated.reduce((min, t) => Math.min(min, +t.start), Infinity));
		const lastEnd = dated.reduce((a, b) => (+b.end > +a.end ? b : a));
		const end = speech.end(lastEnd.start, lastEnd.end);
		parts.push(fill(o.span, { range: speech.range(start, end) }));
	}
	if (conflicts.length) {
		parts.push(fill(o.conflicts, { count: speech.count(conflicts.length, "conflict") }));
		if (level === "detailed") {
			const largest = conflicts.reduce((a, b) => (b.amount > a.amount ? b : a));
			parts.push(fill(o.largest, {
				name: taskName(largest.target.name, strings),
				amount: speech.duration(largest.amount, unit),
				other: taskName(largest.source.name, strings)
			}));
		}
	} else if (level !== "brief") {
		parts.push(o.noConflicts);
	}
	const unscheduled = tasks.length - dated.length;
	if (unscheduled && level !== "brief") {
		parts.push(fill(o.unscheduled, { count: speech.count(unscheduled, "task") }));
	}
	return parts.join(" ");
}

/**
 * Where am I (R12): "Testing. In Website redesign. Level 2, 3 of 10."
 * Ancestors nearest first; position among the siblings that have a row.
 *
 * @param {object} input
 * @param {string} input.name
 * @param {string[]} input.ancestors  names, nearest first
 * @param {number} input.index  zero-based position among the shown siblings
 * @param {number} input.total  shown siblings, the task included
 * @param {"brief"|"standard"|"detailed"} input.level
 * @param {number} [input.subtasks]  tasks inside (Detailed level)
 * @param {object} input.speech
 * @param {object} strings
 * @returns {string}
 */
export function describeWhere({ name, ancestors, index, total, level, subtasks = 0, speech }, strings) {
	const w = strings.whereAmI;
	const parts = [fill(w.task, { name: taskName(name, strings) })];
	const shownAncestors = level === "brief" ? ancestors.slice(0, 1) : ancestors;
	const position = { n: speech.number(index + 1), total: speech.number(total) };
	if (shownAncestors.length) {
		const items = shownAncestors.map((ancestor, i) => fill(i === 0 ? w.ancestorFirst : w.ancestorNext, { name: taskName(ancestor, strings) }));
		parts.push(fill(w.ancestors, { list: items.join(", ") }));
		if (level !== "brief") {
			parts.push(fill(w.position, { level: speech.number(ancestors.length + 1), ...position }));
		}
	} else if (level !== "brief") {
		parts.push(fill(w.topLevel, position));
	}
	if (level === "detailed" && subtasks) {
		parts.push(fill(w.inside, { count: speech.count(subtasks, "subtask") }));
	}
	return parts.join(" ");
}

/**
 * Link conflicts of the whole chart, each once, largest first, then by the
 * name of the task that is too early.
 * @param {Array} conflicts  from findConflicts for every task, duplicates allowed
 * @param {(conflict) => string} key  conflictKey
 */
export function uniqueConflicts(conflicts, key, locale) {
	const seen = new Map();
	for (const conflict of conflicts) {
		const k = key(conflict);
		if (!seen.has(k)) {
			seen.set(k, conflict);
		}
	}
	return [...seen.values()].sort((a, b) => b.amount - a.amount
		|| String(a.target.name).localeCompare(String(b.target.name), locale));
}

/**
 * One item of the conflict list, spoken before the row label of the task
 * that is too early (C3 full form): "1 of 2. Conflict. 2 days too early:
 * must not start before Implementation ends."
 */
export function describeConflictItem({ conflict, index, total, unit, speech }, strings) {
	const text = describeConflicts({ taskId: conflict.target.id, conflicts: [conflict], level: "detailed", unit, speech }, strings);
	if (total <= 1) {
		return text;
	}
	return fill(strings.conflictList.item, { n: speech.number(index + 1), total: speech.number(total), conflict: text });
}
