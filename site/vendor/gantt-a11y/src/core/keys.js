/**
 * Keys: normalising, speaking, and a registry that refuses taken keys and
 * keys without a modifier. The registry knows nothing about the chart: the
 * adapter gives it three primitives (see docs/ADAPTERS.md, "Keys").
 */

const MODIFIERS = ["shift", "alt", "ctrl", "meta"];

/**
 * Normalizes "Shift + D" to "shift+d" and checks that it has a modifier:
 * a single letter would start inline editing in cell navigation modes.
 * @param {string} key
 * @returns {string}
 */
export function normalizeShortcut(key) {
	const normalized = String(key).toLowerCase().replace(/\s/g, "");
	const parts = normalized.split("+");
	const hasModifier = parts.slice(0, -1).some((part) => MODIFIERS.indexOf(part) !== -1);
	if (!hasModifier || parts.length < 2 || !parts[parts.length - 1]) {
		throw new Error("gantt-a11y: shortcut \"" + key + "\" must combine a modifier (shift, alt, ctrl, meta) with a key");
	}
	return normalized;
}

/**
 * A key as words for speech (spec D13): "shift+l" -> "Shift L",
 * "alt+shift+left" -> "Alt Shift Left". The plus sign may be spoken, so it is dropped.
 * @param {string} key  normalized shortcut
 * @param {object} strings  strings.keys holds the names
 * @returns {string}
 */
export function spokenKey(key, strings) {
	return String(key).split("+").map((part) => {
		if (strings.keys[part]) {
			return strings.keys[part];
		}
		return part.length === 1 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1);
	}).join(" ");
}

/**
 * @param {object} binder  from the adapter
 * @param {(key: string) => boolean} binder.isTaken  is the key already used by the chart or the page?
 * @param {(key: string, handler: Function) => void} binder.add  bind the key on task rows (and cells)
 * @param {(key: string) => void} binder.remove  unbind it
 */
export function createShortcutRegistry(binder) {
	const entries = [];

	return {
		/**
		 * @param {object} entry
		 * @param {string} entry.id  command id, e.g. "dependencies"
		 * @param {string} entry.key  e.g. "shift+d"
		 * @param {string} entry.description  spoken in the help announcement
		 * @param {Function} entry.handler
		 */
		register({ id, key, description, handler }) {
			const shortcut = normalizeShortcut(key);
			for (const own of entries) {
				if (own.key === shortcut) {
					throw new Error("gantt-a11y: shortcut \"" + shortcut + "\" is used twice (" + own.id + ", " + id + ")");
				}
			}
			if (binder.isTaken(shortcut)) {
				throw new Error("gantt-a11y: shortcut \"" + shortcut + "\" is already used; pick another one in options.shortcuts." + id);
			}
			binder.add(shortcut, handler);
			entries.push({ id, key: shortcut, description });
		},

		/** The registered key of a command, or null. */
		keyOf(id) {
			const entry = entries.find((item) => item.id === id);
			return entry ? entry.key : null;
		},

		/** Registered shortcuts in registration order. */
		list() {
			return entries.map((entry) => ({ id: entry.id, key: entry.key, description: entry.description }));
		},

		/** Removes every shortcut registered here. */
		clear() {
			for (const entry of entries) {
				binder.remove(entry.key);
			}
			entries.length = 0;
		}
	};
}
