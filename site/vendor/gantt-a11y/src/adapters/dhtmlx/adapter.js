/**
 * The dhtmlx-gantt adapter: everything the engine needs (docs/ADAPTERS.md),
 * implemented with the public, typed API of dhtmlx-gantt 10.0.4.
 */
import { createLiveRegion } from "../dom/live-region.js";
import { createFocusLabels } from "./focus-label.js";

// Keyboard navigation scopes where a task is focused: the row (default)
// and the cell (gantt.config.keyboard_navigation_cells = true).
const TASK_SCOPES = ["taskRow", "taskCell"];

// Lightbox controls that edit start date / duration / end date.
const TIME_CONTROLS = { duration: true, duration_optional: true, time: true, time_optional: true };

// Live values in the form: wait until the user stops pressing keys / buttons.
const LIVE_VALUE_DEBOUNCE_MS = 350;

// gantt field names <-> the engine's names
const TO_ENGINE_FIELD = { text: "name", start_date: "start", end_date: "end" };
const engineField = (field) => TO_ENGINE_FIELD[field] || field;

/** sections, project_sections, milestone_sections, ... in one list */
function allSections(lightboxConfig) {
	const result = [];
	for (const key in lightboxConfig || {}) {
		if (Array.isArray(lightboxConfig[key])) {
			result.push(...lightboxConfig[key]);
		}
	}
	return result;
}

/**
 * @param {object} gantt
 * @param {object} options
 * @param {string} [options.lang]  lang of the live region
 */
export function createDhtmlxAdapter(gantt, { lang } = {}) {
	const liveRegion = createLiveRegion(document.body, lang);
	const focusLabels = createFocusLabels(gantt, (text) => liveRegion.announce(text));
	const isRoot = (id) => id === undefined || id === null || String(id) === String(gantt.config.root_id) || !gantt.isTaskExists(id);

	function linkTypeName(value) {
		for (const key in gantt.config.links) {
			if (String(gantt.config.links[key]) === String(value)) {
				return key;
			}
		}
		return null;
	}

	function typeName(value) {
		if (value === gantt.config.types.project) {
			return "project";
		}
		return value === gantt.config.types.milestone ? "milestone" : "task";
	}

	function toTask(t) {
		const parent = t.parent !== undefined ? t.parent : gantt.getParent(t.id);
		return {
			id: t.id,
			name: t.text,
			start: t.start_date,
			end: t.end_date,
			duration: t.duration,
			parent: isRoot(parent) ? null : parent,
			type: typeName(t.type),
			readonly: !!gantt.isReadonly(t),
			progress: t.progress
		};
	}

	function toLink(l) {
		return {
			id: l.id,
			source: l.source,
			target: l.target,
			type: linkTypeName(l.type),
			lag: Number(l.lag) || 0,
			readonly: !!gantt.isReadonly(l)
		};
	}

	/** Custom lightbox fields: a string map_to, or the values of an object map_to. */
	function sectionFields() {
		const result = [];
		for (const section of allSections(gantt.config.lightbox)) {
			const mapTo = section.map_to;
			const fields = typeof mapTo === "string" ? (mapTo === "auto" ? [] : [mapTo])
				: (mapTo && typeof mapTo === "object" ? Object.values(mapTo) : []);
			for (const field of fields) {
				if (typeof field === "string" && field && !result.some((item) => item.field === field)) {
					result.push({ field, section });
				}
			}
		}
		return result;
	}

	function formSnapshot(id) {
		return snapshotOf(gantt.getTask(id));
	}

	/** A task object as the form edits it (the stored task, or the form's copy). */
	function snapshotOf(t) {
		const snapshot = toTask(t);
		for (const { field } of sectionFields()) {
			if (!TO_ENGINE_FIELD[field] && !(field in snapshot)) {
				snapshot[field] = t[field] instanceof Date ? new Date(t[field]) : t[field];
			}
		}
		for (const key of ["start", "end"]) {
			if (snapshot[key] instanceof Date) {
				snapshot[key] = new Date(snapshot[key]);
			}
		}
		return snapshot;
	}

	let rowLabelTemplate = null;
	let rowLabelPrevious = null;

	function rerender() {
		try {
			gantt.render();
		} catch (error) {
			// not initialised yet: the labels are built on the first render
		}
	}

	const adapter = {
		// ---- data ----
		getTasks() {
			const tasks = [];
			gantt.eachTask((t) => {
				tasks.push(toTask(t));
			});
			return tasks;
		},
		getTask(id) {
			return gantt.isTaskExists(id) ? toTask(gantt.getTask(id)) : null;
		},
		getLinks() {
			return gantt.getLinks().map(toLink);
		},
		getChildIds(id) {
			return gantt.getChildren(id).slice();
		},
		getAncestorIds(id) {
			const ids = [];
			gantt.eachParent((parent) => {
				ids.push(parent.id);
			}, id);
			return ids;
		},
		getDescendantIds(id) {
			const ids = [];
			gantt.eachTask((child) => {
				ids.push(child.id);
			}, id);
			return ids;
		},
		isTaskVisible(id) {
			return gantt.isTaskExists(id) && gantt.isTaskVisible(id);
		},
		getDurationUnit() {
			return gantt.config.duration_unit;
		},
		getDurationStep() {
			return gantt.config.duration_step;
		},
		durationBetween(start, end) {
			return gantt.calculateDuration({ start_date: start, end_date: end });
		},
		endDate(start, duration, taskId) {
			const config = { start_date: start, duration };
			if (taskId !== undefined && gantt.isTaskExists(taskId)) {
				config.task = gantt.getTask(taskId);
			}
			return gantt.calculateEndDate(config);
		},
		addDays(date, days) {
			return gantt.date.add(date, days, "day");
		},
		typeLabel(type) {
			return gantt.locale.labels["type_" + (gantt.config.types[type] || type)] || type;
		},

		// ---- changes ----
		// The stored task is not touched: the new values go to gantt.updateTask as
		// a copy (its documented newState argument), so onBeforeTaskUpdate can
		// refuse them and the stored task stays as it was. The engine reads the
		// task again afterwards.
		updateTask(id, { start, end, duration }) {
			gantt.updateTask(id, { ...gantt.getTask(id), start_date: start, end_date: end, duration });
		},
		canLink({ source, target, type }) {
			return !!gantt.isLinkAllowed({ source, target, type: gantt.config.links[type] });
		},
		addLink({ source, target, type }) {
			const id = gantt.addLink({ source, target, type: gantt.config.links[type] });
			return id !== undefined && id !== null && gantt.isLinkExists(id) ? id : null;
		},
		removeLink(id) {
			gantt.deleteLink(id);
			return !gantt.isLinkExists(id);
		},

		// ---- focus and speech ----
		getFocusedTaskId() {
			const node = gantt.ext.keyboardNavigation.getActiveNode();
			if (!node || node.id === undefined || !gantt.isTaskExists(node.id)) {
				return null;
			}
			return node.id;
		},
		focusTask(id) {
			// gantt.open re-renders and refocuses the current row even when the
			// parent is already open, so parents are opened only when needed.
			if (!gantt.isTaskVisible(id)) {
				gantt.eachParent((parent) => {
					gantt.open(parent.id);
				}, id);
			}
			if (!gantt.isTaskVisible(id)) {
				return { moved: false };
			}
			gantt.showTask(id);
			const node = gantt.ext.keyboardNavigation.getActiveNode();
			if (node && node.type === "taskCell") {
				gantt.ext.keyboardNavigation.focus({ type: "taskCell", id, column: node.column });
			} else {
				gantt.ext.keyboardNavigation.focus({ type: "taskRow", id });
			}
			return { moved: true };
		},
		announce(text, options) {
			liveRegion.announce(text, options);
		},
		announceOnFocus(id, text, options) {
			focusLabels.announceOnFocus(id, text, options);
		},
		cancelOnFocus(id) {
			focusLabels.cancel(id);
		},

		// ---- keys ----
		keys: {
			isTaken: (key) => TASK_SCOPES.some((scope) => !!gantt.getShortcutHandler(key, scope)),
			add: (key, handler) => TASK_SCOPES.forEach((scope) => gantt.addShortcut(key, handler, scope)),
			remove: (key) => TASK_SCOPES.forEach((scope) => gantt.removeShortcut(key, scope))
		},

		// ---- the task form ----
		formFields() {
			const fields = [];
			for (const { field, section } of sectionFields()) {
				if (TO_ENGINE_FIELD[field] || ["duration", "progress", "type", "parent"].indexOf(field) !== -1) {
					continue;
				}
				const label = section.label || gantt.locale.labels["section_" + section.name] || field;
				fields.push({ key: field, label: String(label).replace(/<[^>]*>/g, " ").trim() });
			}
			return fields;
		},
		columnFields() {
			return (gantt.config.columns || []).map((column) => engineField(column.name));
		},
		formSnapshot,
		onForm(listener) {
			const eventIds = [];
			const live = { id: null, box: null, timer: null };
			const on = (name, handler) => {
				eventIds.push(gantt.attachEvent(name, function () {
					handler.apply(this, arguments);
					// gantt combines handler results with &&: undefined would cancel the action
					return true;
				}));
			};

			function readTimeSection() {
				const task = gantt.isTaskExists(live.id) ? gantt.getTask(live.id) : {};
				for (const section of allSections(gantt.config.lightbox)) {
					if (!TIME_CONTROLS[section.type]) {
						continue;
					}
					const state = gantt.getLightboxSection(section.name);
					if (!state) {
						continue;
					}
					const value = state.getValue(task);
					if (value && value.start_date) {
						return { start: value.start_date, duration: value.duration, end: value.end_date };
					}
				}
				return null;
			}
			function scheduleRead() {
				clearTimeout(live.timer);
				live.timer = setTimeout(() => listener({ type: "values", values: readTimeSection() }), LIVE_VALUE_DEBOUNCE_MS);
			}
			function stopLive() {
				clearTimeout(live.timer);
				if (live.box) {
					for (const type of ["click", "change", "keyup"]) {
						live.box.removeEventListener(type, scheduleRead);
					}
				}
				live.id = null;
				live.box = null;
			}

			on("onLightbox", (id) => {
				stopLive();
				live.id = id;
				live.box = gantt.getLightbox();
				for (const type of ["click", "change", "keyup"]) {
					live.box.addEventListener(type, scheduleRead);
				}
				listener({ type: "open", id, values: readTimeSection() });
			});
			// The task in gantt.getTask(id) is still unmodified here (see the
			// onLightboxSave description in the dhtmlx-gantt types).
			// "after" is the form's copy with the new values: the result can then be
			// put into the row label before the library re-renders and focuses the row.
			// A task created from the keyboard (Control+Enter) that is cancelled is
			// removed; focus then goes back to the row it was created from. The
			// record lasts until that task's form closes, saved or not: a saved task
			// opened again later is not new.
			const created = new Map(); // String(new task id) -> id of the row focused when it was created
			on("onLightboxSave", (id, task, isNew) => {
				listener({ type: "save", id, isNew: !!isNew, before: isNew ? null : formSnapshot(id), after: task ? snapshotOf({ ...task, id }) : null });
				created.delete(String(id));
			});
			on("onTaskCreated", (task) => {
				created.set(String(task.id), adapter.getFocusedTaskId());
			});
			on("onLightboxCancel", (id) => {
				const isNew = created.has(String(id));
				listener({ type: "cancel", id, isNew, returnTo: isNew ? created.get(String(id)) : null });
				created.delete(String(id));
			});
			on("onLightboxDelete", (id) => listener({ type: "delete", id }));
			on("onAfterLightbox", () => {
				if (live.id !== null) {
					created.delete(String(live.id));
				}
				stopLive();
				listener({ type: "close" });
			});

			return () => {
				stopLive();
				while (eventIds.length) {
					gantt.detachEvent(eventIds.pop());
				}
			};
		},

		// ---- the row label ----
		/**
		 * The library builds each row's accessible name from the public template
		 * gantt.templates.tooltip_text; the provider replaces it (null restores it).
		 */
		setRowLabel(provider) {
			if (provider) {
				rowLabelPrevious = gantt.templates.tooltip_text;
				const previous = rowLabelPrevious;
				// stays usable in a chain the application built on it, after removal
				const own = function (start, end, task) {
					const text = rowLabelTemplate === own && task && gantt.isTaskExists(task.id) ? provider(task.id) : null;
					return text === null || text === undefined ? previous.apply(this, arguments) : text;
				};
				rowLabelTemplate = own;
				gantt.templates.tooltip_text = own;
			} else if (rowLabelTemplate) {
				if (gantt.templates.tooltip_text === rowLabelTemplate) {
					gantt.templates.tooltip_text = rowLabelPrevious;
				}
				rowLabelTemplate = null;
				rowLabelPrevious = null;
			}
			rerender();
		},

		/** Re-renders the chart, and with it the row labels. */
		refresh: rerender,

		// ---- teardown ----
		/** Pending row-label messages wrap the current template: remove them first. */
		clearPending() {
			focusLabels.destroy();
		},
		destroy() {
			focusLabels.destroy();
			liveRegion.destroy();
		}
	};
	return adapter;
}
