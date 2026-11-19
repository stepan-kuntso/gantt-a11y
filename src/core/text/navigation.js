/**
 * Moving along links (spec N1 to N5, D10). Pure: plain data, no DOM.
 */
import { fill, taskName } from "./format.js";
import { spokenLinkType } from "./dependencies.js";

/**
 * Tasks linked to `taskId` in one direction, in link order.
 * @param {string|number} taskId
 * @param {Array<{id, source, target, type}>} links
 * @param {"predecessor"|"successor"} direction
 * @returns {Array<{id: string|number, type: string, link: object}>}
 */
export function linkedTasks(taskId, links, direction) {
	const result = [];
	for (const link of links) {
		if (direction === "predecessor" && String(link.target) === String(taskId)) {
			result.push({ id: link.source, type: link.type, link });
		}
		if (direction === "successor" && String(link.source) === String(taskId)) {
			result.push({ id: link.target, type: link.type, link });
		}
	}
	return result;
}

/**
 * Which item to visit next. Pressing the key again on the task we jumped to
 * continues around the origin's list when the origin has several linked tasks;
 * with a single one it walks on along the chain from the focused task.
 * Anything else starts from the focused task.
 *
 * @param {object|null} previous  {direction, originId, landedId, index} from the last jump
 * @param {string|number} focusedId
 * @param {"predecessor"|"successor"} direction
 * @param {number} total  number of linked tasks of the origin
 * @returns {{originId: string|number, index: number}}
 */
export function nextJump(previous, focusedId, direction, total) {
	if (previous && previous.direction === direction && String(previous.landedId) === String(focusedId) && total > 1) {
		return { originId: previous.originId, index: (previous.index + 1) % total };
	}
	return { originId: focusedId, index: 0 };
}

/**
 * What is said before the target row's own label:
 * "2 of 5. Launch depends on this." / "Testing depends on this."
 * @param {object} input
 * @param {"predecessor"|"successor"} input.direction
 * @param {number} input.index  zero-based
 * @param {number} input.total
 * @param {string|null} input.type  link type name of the link used
 * @param {*} input.origin  name of the task the jump started from
 * @param {boolean} [input.alwaysTypes]
 * @param {object} input.speech
 * @param {object} strings
 * @returns {string}
 */
export function describeJump({ direction, index, total, type, origin, alwaysTypes = false, speech }, strings) {
	const nav = strings.navigation;
	const typeText = spokenLinkType(type, strings, alwaysTypes);
	const originName = taskName(origin, strings);
	if (total <= 1) {
		const template = direction === "predecessor"
			? (typeText ? nav.onlyPredecessorTyped : nav.onlyPredecessor)
			: (typeText ? nav.onlySuccessorTyped : nav.onlySuccessor);
		return fill(template, { origin: originName, type: typeText });
	}
	const params = { n: speech.number(index + 1), total: speech.number(total), type: typeText };
	const position = fill(typeText ? nav.positionTyped : nav.position, params);
	return fill(direction === "predecessor" ? nav.jumpedToPredecessor : nav.jumpedToSuccessor,
		{ position, origin: originName });
}

/** "Depends on nothing." / "Nothing depends on this." */
export function describeNoJump(direction, strings) {
	return direction === "predecessor" ? strings.navigation.noPredecessors : strings.navigation.noSuccessors;
}

/**
 * "2 of 5, Budget approval, is filtered out. Focus did not move."
 * @returns {string}
 */
export function describeUnreachable({ index, total, name, speech }, strings) {
	const nav = strings.navigation;
	const plainName = taskName(name, strings);
	if (total <= 1) {
		return fill(nav.filteredOutOnly, { name: plainName });
	}
	const position = fill(nav.position, { n: speech.number(index + 1), total: speech.number(total) });
	return fill(nav.filteredOut, { position, name: plainName });
}
