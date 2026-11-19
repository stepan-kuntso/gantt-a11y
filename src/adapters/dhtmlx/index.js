/**
 * gantt-a11y for dhtmlx-gantt: the engine (src/core) with the dhtmlx adapter.
 */
import { createEngine } from "../../core/engine.js";
import { mergeStrings } from "../../core/strings.js";
import { createDhtmlxAdapter } from "./adapter.js";

const enabled = new WeakSet();

/**
 * Enables screen reader helpers for one dhtmlx-gantt instance.
 * Call after gantt.plugins({ keyboard_navigation: true }).
 * Options: see README, "Options".
 * @returns {{ disable: () => void, refresh: () => void }}
 */
export function enableGanttA11y(gantt, options = {}) {
	if (!gantt || typeof gantt.addShortcut !== "function" || !gantt.ext || !gantt.ext.keyboardNavigation) {
		throw new Error("gantt-a11y: enable the keyboard_navigation plugin first: gantt.plugins({ keyboard_navigation: true })");
	}
	if (enabled.has(gantt)) {
		throw new Error("gantt-a11y: already enabled for this gantt instance");
	}
	const lang = options.locale || mergeStrings(options.strings).locale;
	const adapter = createDhtmlxAdapter(gantt, { lang });
	let engine;
	try {
		engine = createEngine(adapter, options);
	} catch (error) {
		adapter.destroy();
		throw error;
	}
	enabled.add(gantt);

	return {
		disable() {
			if (!enabled.has(gantt)) {
				return;
			}
			adapter.clearPending();
			engine.disable();
			adapter.destroy();
			enabled.delete(gantt);
		},
		/** Re-renders the row labels; changes made through the gantt API need no call. */
		refresh: adapter.refresh
	};
}
