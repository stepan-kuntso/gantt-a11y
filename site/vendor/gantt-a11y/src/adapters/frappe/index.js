/**
 * gantt-a11y for frappe-gantt (experimental): the engine (src/core) with the
 * frappe adapter.
 */
import { createEngine } from "../../core/engine.js";
import { mergeStrings } from "../../core/strings.js";
import { createFrappeAdapter } from "./adapter.js";

const enabled = new WeakSet();

/**
 * Enables screen reader helpers for one frappe-gantt instance.
 * @param {object} gantt  a frappe-gantt instance
 * @param {object} options  as for enableGanttA11y (README, "Options"), plus:
 * @param {object[]} options.tasks  the task array given to the instance
 * @param {HTMLElement} options.listContainer  where the accessible task list goes
 * @param {string} [options.listLabel]  accessible name of the list (default: strings.common.taskList)
 * @param {boolean} [options.readonly]  the whole chart is read-only for the keys
 * @returns {{ disable: () => void, refresh: () => void }}
 */
export function enableFrappeGanttA11y(gantt, options = {}) {
	const { tasks, listContainer, listLabel, readonly } = options;
	if (!gantt || !Array.isArray(tasks) || !listContainer) {
		throw new Error("gantt-a11y: enableFrappeGanttA11y(gantt, { tasks, listContainer }) needs the chart, its task array and a container for the task list");
	}
	if (enabled.has(gantt)) {
		throw new Error("gantt-a11y: already enabled for this gantt instance");
	}
	const strings = mergeStrings(options.strings);
	const lang = options.locale || strings.locale;
	const adapter = createFrappeAdapter({ gantt, tasks, listContainer, listLabel: listLabel || strings.common.taskList, readonly, lang });
	let engine;
	try {
		// frappe-gantt has no task form; links are finish to start only.
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
			engine.disable();
			adapter.destroy();
			enabled.delete(gantt);
		},
		/** Call from on_date_change / on_progress_change so the task list follows the chart. */
		refresh: adapter.refresh
	};
}
