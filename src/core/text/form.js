/**
 * Task form (lightbox) texts (spec F1 to F10, D8). Pure: plain data, no DOM.
 */
import { fill, taskName } from "./format.js";

function isEmpty(value) {
	return value === null || value === undefined || value === "";
}

/**
 * Compares two field values the way a user would: dates by time,
 * numbers and strings by their text, empty values as equal.
 * @returns {boolean}
 */
export function sameValue(a, b) {
	if (isEmpty(a) && isEmpty(b)) {
		return true;
	}
	if (a instanceof Date || b instanceof Date) {
		return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
	}
	return String(a) === String(b);
}

/**
 * Lists the fields whose values differ.
 * @param {object} before  task fields before saving
 * @param {object} after   task fields after saving
 * @param {string[]} fields  field names to compare, in announcement order
 * @returns {Array<{field: string, from: *, to: *}>}
 */
export function diffFields(before, after, fields) {
	const changes = [];
	for (const field of fields) {
		if (!sameValue(before[field], after[field])) {
			changes.push({ field, from: before[field], to: after[field] });
		}
	}
	return changes;
}

function changeSentence(change, strings) {
	return fill(strings.form.change, {
		field: change.label,
		to: change.to === "" ? strings.common.emptyValue : change.to,
		from: change.from === "" ? strings.common.emptyValue : change.from
	});
}

/**
 * The result of saving the form, as one or more messages (D8).
 *
 * Standard: up to two changed table fields with new and old values, then
 * "Ends ..." if the end moved; three or more as a list of field names, and the
 * row label must follow (it carries the values). Fields that are not table
 * columns are always spoken with their values and are not counted.
 * Brief: the count and the field names. Detailed: every change with values
 * (end date included), at most two per message.
 *
 * @param {object} input
 * @param {Array<{field, label, listLabel, to: string, from: string, isColumn: boolean}>} input.changes
 *        values formatted for speech; `from` already shortened where the level wants it
 * @param {string} [input.endDate]  "20 June", spoken when the end moved
 * @param {boolean} [input.endChanged]
 * @param {"brief"|"standard"|"detailed"} input.level
 * @param {object} input.speech
 * @param {object} strings
 * @returns {{messages: string[], withLabel: boolean}}
 */
export function describeSaved({ changes, endDate, endChanged, level, speech }, strings) {
	const f = strings.form;
	if (!changes.length) {
		return { messages: [f.noChanges], withLabel: false };
	}
	const nameChanged = changes.some((change) => change.field === "name");
	const counted = changes.filter((change) => change.isColumn);
	const extra = changes.filter((change) => !change.isColumn);
	const ends = endChanged && endDate ? fill(f.ends, { date: endDate }) : "";

	if (level === "brief") {
		const list = speech.list(changes.map((change) => change.listLabel));
		return { messages: [fill(f.savedCount, { count: speech.count(changes.length, "change"), list })], withLabel: true };
	}
	if (level === "detailed") {
		const sentences = changes.map((change) => changeSentence(change, strings));
		const messages = [];
		for (let i = 0; i < sentences.length; i += 2) {
			messages.push(sentences.slice(i, i + 2).join(" "));
		}
		messages[0] = (changes.length > 2 ? fill(f.savedCountOnly, { count: speech.count(changes.length, "change") }) : f.saved)
			+ " " + messages[0];
		return { messages, withLabel: nameChanged };
	}
	if (counted.length <= 2) {
		const parts = [f.saved, ...changes.map((change) => changeSentence(change, strings))];
		if (ends && counted.length) {
			parts.push(ends);
		}
		return { messages: [parts.join(" ")], withLabel: nameChanged };
	}
	const parts = [fill(f.savedCount, {
		count: speech.count(counted.length, "change"),
		list: speech.list(counted.map((change) => change.listLabel))
	})];
	parts.push(...extra.map((change) => changeSentence(change, strings)));
	return { messages: [parts.join(" ")], withLabel: true };
}

/**
 * Other form results.
 * @param {object} result
 * @param {"cancelled"|"created"|"discarded"|"deleted"} result.action
 * @param {*} [result.name]
 * @param {number} [result.subtasks]  deleted together with the task
 * @param {number} [result.links]  removed together with the task
 * @param {object} speech
 * @param {object} strings
 * @returns {string}
 */
export function describeFormResult({ action, name, subtasks = 0, links = 0 }, speech, strings) {
	const f = strings.form;
	switch (action) {
		case "cancelled":
			return f.cancelled;
		case "created":
			return fill(f.created, { name: taskName(name, strings) });
		case "discarded":
			return f.discarded;
		case "deleted": {
			const plain = taskName(name, strings);
			let text = subtasks
				? fill(f.deletedWithSubtasks, { name: plain, subtasks: speech.count(subtasks, "subtask") })
				: fill(f.deleted, { name: plain });
			if (links) {
				text += " " + fill(f.linksRemoved, { links: speech.count(links, "link") });
			}
			return text;
		}
		default:
			return "";
	}
}

/**
 * A value changed while the form is open (F10): "Duration 6 days. Ends 18 June."
 * @param {object} input
 * @param {Array<{label: string, value: string}>} input.changes
 * @param {string} [input.endDate]
 * @param {object} strings
 * @returns {string}
 */
export function describeFormValue({ changes, endDate }, strings) {
	const parts = changes.map((change) => fill(strings.form.value, {
		field: change.label,
		value: change.value === "" ? strings.common.emptyValue : change.value
	}));
	if (endDate) {
		parts.push(fill(strings.form.ends, { date: endDate }));
	}
	return parts.join(" ");
}
