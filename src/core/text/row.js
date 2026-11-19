/**
 * The task row label (spec R1, section 5, D1, D5). Pure: plain data, no DOM.
 * The level of nesting is not spoken: it reaches the user through aria-level,
 * which the library sets, so the screen reader's own settings decide (P9).
 */
import { fill, taskName } from "./format.js";

export const DEFAULT_ROW_FIELDS = ["name", "dates", "progress"];

/**
 * @param {object} input
 * @param {object} input.task  {name, start, end, duration, progress}
 * @param {"task"|"milestone"|"project"} input.kind
 * @param {string[]} input.fields  in order: "name", "parent", "dates", "progress", "links"
 * @param {"brief"|"standard"|"detailed"} input.level
 * @param {*} [input.parentName]  for "parent"; null at the top level
 * @param {number} [input.childCount]  projects: all tasks inside
 * @param {{predecessors: number, successors: number}} [input.linkCounts]  for "links"
 * @param {number} [input.conflictsInside]  a collapsed project hiding conflicts (D5)
 * @param {string} input.unit  duration unit, e.g. "day"
 * @param {object} input.speech
 * @param {object} strings
 * @returns {string}
 */
export function describeRow({ task, kind, fields, level, parentName, childCount = 0, linkCounts, conflictsInside = 0, unit, speech }, strings) {
	const r = strings.rowLabel;
	const parts = [];
	const scheduled = task.start instanceof Date && task.end instanceof Date;

	for (const field of fields) {
		switch (field) {
			case "name":
				parts.push(fill(r.name, { name: taskName(task.name, strings) }));
				break;
			case "parent":
				if (parentName !== null && parentName !== undefined) {
					parts.push(fill(r.parent, { name: taskName(parentName, strings) }));
				}
				break;
			case "dates":
				parts.push(datesText({ task, kind, level, childCount, scheduled, unit, speech }, strings));
				break;
			case "progress":
				if (typeof task.progress === "number" && kind !== "milestone" && scheduled) {
					parts.push(fill(r.progress, { value: speech.number(Math.round(task.progress * 100)) }));
				}
				break;
			case "links":
				if (linkCounts && linkCounts.predecessors) {
					parts.push(fill(strings.dependencies.dependsOnCount, { count: speech.number(linkCounts.predecessors) }));
				}
				if (linkCounts && linkCounts.successors) {
					parts.push(fill(strings.dependencies.requiredByCount, { count: speech.number(linkCounts.successors) }));
				}
				break;
			default:
				break;
		}
	}
	if (conflictsInside) {
		parts.push(fill(r.conflictsInside, { count: speech.count(conflictsInside, "conflict") }));
	}
	return parts.filter(Boolean).join(" ");
}

function datesText({ task, kind, level, childCount, scheduled, unit, speech }, strings) {
	const r = strings.rowLabel;
	if (!scheduled) {
		return r.notScheduled;
	}
	const end = speech.end(task.start, task.end);
	if (kind === "milestone") {
		return fill(r.milestone, { date: speech.date(task.start) });
	}
	if (kind === "project") {
		return fill(r.project, { range: speech.range(task.start, end), count: speech.count(childCount, "task") });
	}
	if (task.start.getTime() === task.end.getTime() || !Number(task.duration)) {
		return fill(r.noDuration, { date: speech.date(task.start) });
	}
	const duration = speech.duration(task.duration, unit);
	if (level === "brief") {
		return fill(r.spanBrief, { start: speech.date(task.start), duration });
	}
	if (level === "detailed") {
		return fill(r.spanDetailed, { start: speech.date(task.start), end: speech.date(end), duration });
	}
	return fill(r.span, { range: speech.range(task.start, end), duration });
}
