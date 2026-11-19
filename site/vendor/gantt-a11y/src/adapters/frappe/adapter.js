/**
 * The frappe-gantt adapter (docs/ADAPTERS.md), for frappe-gantt 1.2.
 *
 * frappe-gantt draws an SVG chart and has no keyboard navigation, roles or
 * ARIA of its own. This adapter adds a minimal accessible task list next to
 * the chart: role="listbox" with one role="option" per task, a roving
 * tabindex, and Up / Down / Home / End to move between tasks. The engine's
 * keys are bound on that list. The chart's own DOM is not changed.
 *
 * Data: the task array the application passed to `new Gantt(...)`, through
 * its documented fields (id, name, start, end, progress, dependencies) and
 * the public gantt.refresh(tasks). frappe-gantt has only finish-to-start
 * dependencies without lag, no task hierarchy, no milestones or projects, no
 * task form, and no per-task read-only flag; a task's own `readonly: true`
 * field and the adapter option `readonly` are honoured.
 */
import { createLiveRegion } from "../dom/live-region.js";
import { toPlainText } from "../../core/text/format.js";

const DAY = 86400000;
// A message waits this long for focus to land on its option, then falls back
// to the live region; once landed it stays at most LIFETIME_MS (as in the
// dhtmlx adapter, src/adapters/dhtmlx/focus-label.js).
const LANDING_TIMEOUT_MS = 600;
const LIFETIME_MS = 5000;

/** "2026-06-13" or a Date -> local Date at midnight (or the given time). */
function parseDate(value) {
	if (value instanceof Date) {
		return new Date(value.getTime());
	}
	const [datePart, timePart] = String(value).split(" ");
	const [y, m, d] = datePart.split("-").map((n) => parseInt(n, 10));
	const [hh = 0, mm = 0] = timePart ? timePart.split(":").map((n) => parseInt(n, 10)) : [];
	return new Date(y, (m || 1) - 1, d || 1, hh, mm);
}

const pad = (n) => String(n).padStart(2, "0");
const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const isMidnight = (date) => date.getHours() === 0 && date.getMinutes() === 0;

const MODIFIER_ORDER = ["shift", "alt", "ctrl", "meta"];

/** One spelling per key combination: modifiers in a fixed order, then the key. */
function canonicalKey(key) {
	const parts = String(key).toLowerCase().split("+");
	const name = parts.pop();
	return [...MODIFIER_ORDER.filter((m) => parts.indexOf(m) !== -1), name].join("+");
}

/** Key name from a keyboard event, in canonical form: "shift+d", "shift+alt+left". */
function eventKey(event) {
	let key = event.key;
	if (/^Key[A-Z]$/.test(event.code)) {
		key = event.code.slice(3);
	} else if (/^Digit\d$/.test(event.code)) {
		key = event.code.slice(5);
	} else if (key && key.startsWith("Arrow")) {
		key = key.slice(5);
	}
	const parts = [];
	if (event.shiftKey) parts.push("shift");
	if (event.altKey) parts.push("alt");
	if (event.ctrlKey) parts.push("ctrl");
	if (event.metaKey) parts.push("meta");
	parts.push(String(key).toLowerCase());
	return parts.join("+");
}

/**
 * @param {object} input
 * @param {object} input.gantt  a frappe-gantt instance
 * @param {object[]} input.tasks  the task array given to the instance
 * @param {HTMLElement} input.listContainer  where the accessible task list goes
 * @param {string} input.listLabel  accessible name of the list
 * @param {boolean} [input.readonly=false]
 * @param {string} [input.lang]
 */
export function createFrappeAdapter({ gantt, tasks, listContainer, listLabel, readonly = false, lang }) {
	const doc = listContainer.ownerDocument;
	const liveRegion = createLiveRegion(doc.body, lang);
	const keyHandlers = {};
	let rowLabelProvider = null;
	const pending = new Map(); // task id -> {text, landed, timer, lifeTimer}
	let activeId = null;

	const findRaw = (id) => tasks.find((t) => String(t.id) === String(id)) || null;

	function dependencyIds(t) {
		if (Array.isArray(t.dependencies)) {
			return t.dependencies.map(String);
		}
		return typeof t.dependencies === "string"
			? t.dependencies.split(",").map((d) => d.trim()).filter(Boolean)
			: [];
	}

	function toTask(t) {
		const start = parseDate(t.start);
		const lastDay = parseDate(t.end);
		// frappe-gantt treats a date-only end as the whole of that day; the
		// engine works with the moment the task ends (the next midnight).
		const end = isMidnight(lastDay) ? new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1) : lastDay;
		return {
			id: String(t.id),
			name: t.name,
			start,
			end,
			duration: Math.round((end - start) / DAY),
			parent: null,
			type: "task",
			readonly: !!(readonly || t.readonly),
			progress: typeof t.progress === "number" ? t.progress / 100 : undefined
		};
	}

	// ---- the accessible task list ----

	const list = doc.createElement("div");
	list.setAttribute("role", "listbox");
	list.setAttribute("aria-label", listLabel);
	list.setAttribute("data-gantt-a11y-list", "");
	listContainer.appendChild(list);

	function optionOf(id) {
		return list.querySelector(`[role="option"][data-task-id="${CSS.escape(String(id))}"]`);
	}

	function labelOf(id) {
		const text = rowLabelProvider ? rowLabelProvider(String(id)) : null;
		if (text !== null && text !== undefined) {
			return text;
		}
		const raw = findRaw(id);
		return raw ? toPlainText(raw.name) : "";
	}

	// Options are updated in place when the tasks are the same, so the focused
	// option is never replaced: a replaced element would be focused again and
	// read again by the screen reader, before the result of the change.
	function render() {
		if (activeId === null && tasks.length) {
			activeId = String(tasks[0].id);
		}
		const ids = tasks.map((raw) => String(raw.id));
		const existing = Array.from(list.querySelectorAll('[role="option"]')).map((option) => option.getAttribute("data-task-id"));
		if (ids.join("\n") !== existing.join("\n")) {
			const focusedId = adapter.getFocusedTaskId();
			list.textContent = "";
			for (const id of ids) {
				const option = doc.createElement("div");
				option.setAttribute("role", "option");
				option.setAttribute("data-task-id", id);
				list.appendChild(option);
			}
			if (focusedId !== null && optionOf(focusedId)) {
				optionOf(focusedId).focus();
			}
		}
		for (const raw of tasks) {
			const id = String(raw.id);
			const option = optionOf(id);
			option.setAttribute("aria-selected", id === activeId ? "true" : "false");
			option.setAttribute("tabindex", id === activeId ? "0" : "-1");
			option.setAttribute("aria-label", pending.has(id) ? pending.get(id).text : labelOf(id));
			option.textContent = raw.name;
		}
	}

	function setActive(id, focus) {
		activeId = String(id);
		for (const option of list.querySelectorAll('[role="option"]')) {
			const on = option.getAttribute("data-task-id") === activeId;
			option.setAttribute("tabindex", on ? "0" : "-1");
			option.setAttribute("aria-selected", on ? "true" : "false");
		}
		if (focus) {
			const option = optionOf(activeId);
			if (option) {
				option.focus();
			}
		}
	}

	function onKeyDown(event) {
		const option = event.target.closest('[role="option"]');
		if (!option) {
			return;
		}
		const options = Array.from(list.querySelectorAll('[role="option"]'));
		const index = options.indexOf(option);
		const plain = !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey;
		let next = null;
		if (plain && event.key === "ArrowDown") next = options[Math.min(index + 1, options.length - 1)];
		if (plain && event.key === "ArrowUp") next = options[Math.max(index - 1, 0)];
		if (plain && event.key === "Home") next = options[0];
		if (plain && event.key === "End") next = options[options.length - 1];
		if (next) {
			event.preventDefault();
			setActive(next.getAttribute("data-task-id"), true);
			return;
		}
		const handler = keyHandlers[eventKey(event)];
		if (handler) {
			event.preventDefault();
			handler();
		}
	}

	/** Removes a waiting message and gives the option its own label again. */
	function clearPending(id) {
		const message = pending.get(id);
		if (!message) {
			return;
		}
		clearTimeout(message.timer);
		clearTimeout(message.lifeTimer);
		pending.delete(id);
		const option = optionOf(id);
		if (option) {
			option.setAttribute("aria-label", labelOf(id));
		}
	}

	function land(id, message) {
		if (!message.landed) {
			message.landed = true;
			message.lifeTimer = setTimeout(() => pending.get(id) === message && clearPending(id), LIFETIME_MS);
		}
	}

	// A message is the option's name only until focus leaves it.
	function onFocusOut(event) {
		const option = event.target.closest && event.target.closest('[role="option"]');
		const id = option && option.getAttribute("data-task-id");
		const next = event.relatedTarget && event.relatedTarget.closest && event.relatedTarget.closest('[role="option"]');
		if (id && pending.has(id) && pending.get(id).landed && next !== option) {
			clearPending(id);
		}
	}

	function onFocusIn(event) {
		const option = event.target.closest && event.target.closest('[role="option"]');
		if (option) {
			const id = option.getAttribute("data-task-id");
			setActive(id, false);
			if (pending.has(id)) {
				land(id, pending.get(id));
			}
		}
	}

	function onWindowBlur() {
		for (const [id, message] of Array.from(pending)) {
			if (message.landed) {
				clearPending(id);
			}
		}
	}

	list.addEventListener("keydown", onKeyDown);
	list.addEventListener("focusout", onFocusOut);
	list.addEventListener("focusin", onFocusIn);
	doc.defaultView && doc.defaultView.addEventListener("blur", onWindowBlur);

	function refreshChart() {
		gantt.refresh(tasks);
		render();
	}

	const adapter = {
		// ---- data ----
		getTasks: () => tasks.map(toTask),
		getTask: (id) => (findRaw(id) ? toTask(findRaw(id)) : null),
		getLinks() {
			const links = [];
			for (const t of tasks) {
				for (const dep of dependencyIds(t)) {
					links.push({ id: `${dep}->${t.id}`, source: dep, target: String(t.id), type: "finish_to_start", lag: 0, readonly: !!readonly });
				}
			}
			return links;
		},
		getChildIds: () => [],
		getAncestorIds: () => [],
		getDescendantIds: () => [],
		isTaskVisible: (id) => !!findRaw(id),
		getDurationUnit: () => "day",
		getDurationStep: () => 1,
		durationBetween: (start, end) => (end - start) / DAY,
		endDate: (start, duration) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + duration, start.getHours(), start.getMinutes()),
		addDays: (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes()),
		typeLabel: (type) => type,

		// ---- changes ----
		updateTask(id, { start, end }) {
			const raw = findRaw(id);
			raw.start = formatDate(start);
			const lastDay = isMidnight(end) ? new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1) : end;
			raw.end = formatDate(lastDay);
			refreshChart();
		},
		// frappe-gantt has finish-to-start dependencies only
		canLink: ({ type }) => type === "finish_to_start",
		addLink({ source, target, type }) {
			if (type !== "finish_to_start") {
				return null; // frappe-gantt has finish-to-start dependencies only
			}
			const raw = findRaw(target);
			raw.dependencies = [...dependencyIds(raw), String(source)];
			refreshChart();
			return `${source}->${target}`;
		},
		removeLink(id) {
			const [source, target] = String(id).split("->");
			const raw = findRaw(target);
			if (!raw) {
				return false;
			}
			raw.dependencies = dependencyIds(raw).filter((dep) => dep !== source);
			refreshChart();
			return true;
		},

		// ---- focus and speech ----
		getFocusedTaskId() {
			const active = doc.activeElement;
			const option = active && active.closest && active.closest('[data-gantt-a11y-list] [role="option"]');
			return option && list.contains(option) ? option.getAttribute("data-task-id") : null;
		},
		focusTask(id) {
			if (!optionOf(id)) {
				return { moved: false };
			}
			setActive(id, true);
			return { moved: true };
		},
		announce: (text, options) => liveRegion.announce(text, options),
		// The message is always followed by the option's own label (the task
		// name). Options are not re-rendered, so `refresh` needs no work here.
		announceOnFocus(id, text, { fallback = true } = {}) {
			const key = String(id);
			// The focused option is not re-rendered by an edit, so nothing would
			// read it again: speak through the live region instead.
			if (String(adapter.getFocusedTaskId()) === key) {
				liveRegion.announce(text);
				return;
			}
			clearPending(key);
			const message = { text: text + " " + labelOf(key), landed: false, timer: null, lifeTimer: null };
			pending.set(key, message);
			const option = optionOf(key);
			if (option) {
				option.setAttribute("aria-label", message.text);
			}
			message.timer = setTimeout(() => {
				if (pending.get(key) !== message || message.landed) {
					return;
				}
				if (adapter.getFocusedTaskId() === key) {
					land(key, message);
					return;
				}
				clearPending(key);
				if (fallback) {
					liveRegion.announce(text);
				}
			}, LANDING_TIMEOUT_MS);
		},

		cancelOnFocus(id) {
			clearPending(String(id));
		},

		// ---- keys ----
		keys: {
			isTaken: (key) => canonicalKey(key) in keyHandlers,
			add: (key, handler) => { keyHandlers[canonicalKey(key)] = handler; },
			remove: (key) => { delete keyHandlers[canonicalKey(key)]; }
		},

		// ---- the row label ----
		setRowLabel(provider) {
			rowLabelProvider = provider;
			render();
		},

		/** Call after the chart changed outside the keyboard (dragging a bar). */
		refresh: render,

		destroy() {
			list.removeEventListener("keydown", onKeyDown);
			list.removeEventListener("focusout", onFocusOut);
			list.removeEventListener("focusin", onFocusIn);
			doc.defaultView && doc.defaultView.removeEventListener("blur", onWindowBlur);
			for (const id of Array.from(pending.keys())) {
				clearPending(id);
			}
			list.remove();
			liveRegion.destroy();
		}
	};

	render();
	return adapter;
}
