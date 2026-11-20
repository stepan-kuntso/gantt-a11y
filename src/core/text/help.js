/**
 * Spoken keyboard help (spec D13, quick form). Pure: plain data, no DOM.
 * Built from the registered shortcuts, so disabled features and remapped
 * keys are reflected.
 */
import { fill } from "./format.js";

/** Which group each command belongs to; anything else goes to "other". */
export const COMMAND_GROUPS = {
	dependencies: "reading",
	concurrent: "reading",
	endsBefore: "reading",
	startsAfter: "reading",
	whereAmI: "orientation",
	overview: "orientation",
	goToPredecessor: "moving",
	goToSuccessor: "moving",
	conflictList: "moving",
	back: "moving",
	moveEarlier: "changing",
	moveLater: "changing",
	longer: "changing",
	shorter: "changing",
	link: "links",
	linkType: "links",
	unlink: "links"
};

const GROUP_ORDER = ["reading", "orientation", "moving", "changing", "links", "other"];

/** At most four keys per spoken group (D13). */
export const KEYS_PER_GROUP = 4;

/**
 * @param {Array<{id: string, description: string, spokenKey: string}>} commands  registered, in order
 * @param {object} speech
 * @param {object} strings
 * @returns {Array<{text: string, nextCount: number}>}  one page per group
 */
export function helpPages(commands, speech, strings) {
	const groups = new Map(GROUP_ORDER.map((name) => [name, []]));
	for (const command of commands) {
		groups.get(COMMAND_GROUPS[command.id] || "other").push(command);
	}
	// within a group, the order of COMMAND_GROUPS (commands of different features mix)
	const order = Object.keys(COMMAND_GROUPS);
	const rank = (id) => (order.indexOf(id) === -1 ? order.length : order.indexOf(id));
	for (const items of groups.values()) {
		items.sort((a, b) => rank(a.id) - rank(b.id));
	}
	const chunks = [];
	for (const [name, items] of groups) {
		for (let i = 0; i < items.length; i += KEYS_PER_GROUP) {
			chunks.push({ name, items: items.slice(i, i + KEYS_PER_GROUP) });
		}
	}
	return chunks.map((chunk, index) => {
		const head = fill(strings.help.group, {
			group: strings.help.groups[chunk.name] || chunk.name,
			n: speech.number(index + 1),
			total: speech.number(chunks.length)
		});
		const items = chunk.items.map((item) => fill(strings.help.item, { action: item.description, key: item.spokenKey }));
		// the first group says how to go on (P30), at every level: help is asked for
		const next = index === 0 && chunks.length > 1 ? [strings.help.next] : [];
		return { text: [head, ...items, ...next].join(" "), nextCount: index + 1 < chunks.length ? 1 : 0 };
	});
}
