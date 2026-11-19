/**
 * Creating and removing links from the keyboard (stage 7; refusals follow
 * spec D11: what did not happen, then why). Pure: plain data, no DOM.
 */
import { fill, taskName } from "./format.js";
import { DEFAULT_LINK_TYPE, LINK_TYPES, spokenLinkType } from "./dependencies.js";

/**
 * Would a link source -> target close a loop? True if the target already
 * leads to the source along existing links.
 * @param {string|number} sourceId
 * @param {string|number} targetId
 * @param {Array<{source, target}>} links
 * @returns {boolean}
 */
export function wouldCreateLoop(sourceId, targetId, links) {
	const next = new Map();
	for (const link of links) {
		const from = String(link.source);
		if (!next.has(from)) {
			next.set(from, []);
		}
		next.get(from).push(String(link.target));
	}
	const goal = String(sourceId);
	const seen = new Set();
	const queue = [String(targetId)];
	while (queue.length) {
		const id = queue.shift();
		if (id === goal) {
			return true;
		}
		if (seen.has(id)) {
			continue;
		}
		seen.add(id);
		queue.push(...(next.get(id) || []));
	}
	return false;
}

/**
 * Why a link source -> target cannot be created, or null.
 * Checks in order: read-only, same task, existing link, loop, the
 * application's own rule (passed in as `allowed`).
 * @returns {"readonly"|"same"|"exists"|"loop"|"notAllowed"|null}
 */
export function linkBlocker({ sourceId, targetId, links, readonly, allowed }) {
	if (readonly) {
		return "readonly";
	}
	if (String(sourceId) === String(targetId)) {
		return "same";
	}
	if (links.some((link) => String(link.source) === String(sourceId) && String(link.target) === String(targetId))) {
		return "exists";
	}
	if (wouldCreateLoop(sourceId, targetId, links)) {
		return "loop";
	}
	if (!allowed) {
		return "notAllowed";
	}
	return null;
}

/** The type after `current` in the order finish to start, start to start, ... */
export function nextLinkType(current) {
	const index = LINK_TYPES.indexOf(current);
	return LINK_TYPES[(index + 1) % LINK_TYPES.length];
}

/**
 * Texts of the link commands. The focused task is "this".
 * @param {object} input
 * @param {"marked"|"type"|"cancelled"|"created"|"blocked"|"confirmRemove"|"removed"|"noContext"|"noSource"|"notRemoved"} input.result
 * @param {string} [input.key]  noSource: the spoken link key
 * @param {*} [input.name]  source name (marked, created, loop), or the other task (remove)
 * @param {string} [input.type]  link type name
 * @param {"readonly"|"exists"|"loop"|"notAllowed"|"failed"} [input.reason]
 * @param {"predecessor"|"successor"} [input.direction]  remove: how the other task relates to this one
 * @param {object} strings
 * @returns {string}
 */
export function describeLinkCommand({ result, name, type, reason, direction, key }, strings) {
	const l = strings.links;
	const plain = taskName(name, strings);
	switch (result) {
		case "marked":
			return fill(l.marked, { name: plain });
		case "type":
			return fill(l.type, { type: strings.linkTypes[type] || type });
		case "cancelled":
			return l.cancelled;
		case "created": {
			const typeText = spokenLinkType(type, strings);
			return fill(typeText ? l.createdTyped : l.created, { name: plain, type: typeText });
		}
		case "blocked":
			if (reason === "readonly") {
				return strings.edit.readonly;
			}
			return fill(l.notCreated[reason] || l.notCreated.failed, { name: plain });
		case "confirmRemove":
			return fill(direction === "successor" ? l.confirmRemoveSuccessor : l.confirmRemovePredecessor, { name: plain });
		case "removed":
			return fill(direction === "successor" ? l.removedSuccessor : l.removedPredecessor, { name: plain });
		case "notRemoved":
			return reason === "readonly" ? strings.edit.readonly : l.notRemoved;
		case "noContext":
			return l.noContext;
		case "noSource":
			return fill(l.noSource, { key });
		default:
			return "";
	}
}

export { DEFAULT_LINK_TYPE };
