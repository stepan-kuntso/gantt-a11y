/**
 * An adapter over plain arrays, without a chart and without a DOM.
 * It shows the smallest working adapter (docs/ADAPTERS.md) and lets the
 * engine be tested on its own.
 *
 * It behaves like a real adapter where tests could otherwise only check
 * that a method was called: announceOnFocus changes what the task's row is
 * called (label(id)), the message is removed when focus moves on or is
 * cancelled, and focusTask fails for tasks in `unreachable` (filtered out).
 */
const DAY = 86400000;

/**
 * rules: what an application's onBefore* handlers would do to a write.
 *   updateTask(id, values) -> false (refuse) | values to store instead | undefined (as given)
 *   addLink(link) -> false: the call still returns an id, but nothing is stored
 *   removeLink(id) -> false: the call still returns true, but the link stays
 * Like a library, the adapter reports success by its return value only; the
 * engine has to read the data again to know what was stored.
 */
export function createMemoryAdapter({ tasks, links, focused = null, durationUnit = "day", rules = {}, unreachable = [] }) {
	const state = { tasks: tasks.map((t) => ({ ...t })), links: links.map((l) => ({ ...l })), focused, nextLinkId: 1000 };
	const spoken = [];
	const timing = []; // {text, delay}: when each live-region text would be spoken
	const messages = new Map(); // String(task id) -> text waiting in the row label
	const blocked = new Set(unreachable.map(String));
	const keys = {};
	let formListener = null;
	let rowLabel = null;

	// an index by id, as a library has one (a linear search would make large
	// charts slow in the tests, not in the engine)
	let index = null;
	const find = (id) => {
		if (!index || index.size !== state.tasks.length) {
			index = new Map(state.tasks.map((t) => [String(t.id), t]));
		}
		return index.get(String(id)) || null;
	};
	const children = (id) => state.tasks.filter((t) => String(t.parent) === String(id)).map((t) => t.id);
	const descendants = (id) => children(id).flatMap((child) => [child, ...descendants(child)]);

	/** Focus moves on: messages in other rows' labels are removed. */
	function moveFocus(id) {
		for (const key of Array.from(messages.keys())) {
			if (key !== String(id)) {
				messages.delete(key);
			}
		}
		state.focused = id;
	}

	/** What the row is called: a waiting message, then its own label (the row label feature, or the name). */
	function label(id) {
		const own = (rowLabel && rowLabel(id)) || (find(id) ? find(id).name : "");
		return messages.has(String(id)) ? messages.get(String(id)) + " " + own : own;
	}

	const adapter = {
		getTasks: () => state.tasks.map((t) => ({ ...t })),
		getTask: (id) => (find(id) ? { ...find(id) } : null),
		getLinks: () => state.links.map((l) => ({ ...l })),
		getChildIds: children,
		getAncestorIds(id) {
			const ids = [];
			let task = find(id);
			while (task && task.parent !== null && task.parent !== undefined) {
				ids.push(task.parent);
				task = find(task.parent);
			}
			return ids;
		},
		getDescendantIds: descendants,
		isTaskVisible: (id) => !!find(id),
		getDurationUnit: () => durationUnit,
		getDurationStep: () => 1,
		durationBetween: (start, end) => (end - start) / DAY,
		endDate: (start, duration) => new Date(start.getTime() + duration * DAY),
		addDays: (date, days) => new Date(date.getTime() + days * DAY),
		typeLabel: (type) => type,
		updateTask(id, values) {
			const ruled = rules.updateTask ? rules.updateTask(id, { ...values }) : undefined;
			if (ruled === false) {
				return;
			}
			const { start, end, duration } = ruled || values;
			Object.assign(find(id), { start, end, duration });
		},
		canLink: () => true,
		addLink(link) {
			const id = state.nextLinkId++;
			if (!rules.addLink || rules.addLink({ ...link }) !== false) {
				state.links.push({ id, lag: 0, readonly: false, ...link });
			}
			return id;
		},
		removeLink(id) {
			if (!rules.removeLink || rules.removeLink(id) !== false) {
				state.links = state.links.filter((l) => String(l.id) !== String(id));
			}
			return true;
		},
		getFocusedTaskId: () => state.focused,
		focusTask(id) {
			if (blocked.has(String(id)) || !find(id)) {
				return { moved: false };
			}
			moveFocus(id);
			return { moved: true };
		},
		announce(text, { delay = 0 } = {}) {
			spoken.push({ via: "live", text });
			timing.push({ text, delay });
		},
		announceOnFocus(id, text) {
			spoken.push({ via: "row", id, text });
			messages.set(String(id), text);
		},
		cancelOnFocus(id) {
			spoken.push({ via: "cancel", id });
			messages.delete(String(id));
		},
		keys: {
			isTaken: (key) => key in keys,
			add: (key, handler) => { keys[key] = handler; },
			remove: (key) => { delete keys[key]; }
		},
		onForm(listener) {
			formListener = listener;
			return () => { formListener = null; };
		},
		formSnapshot: (id) => ({ ...find(id) }),
		columnFields: () => ["name", "start", "duration"],
		setRowLabel(provider) {
			rowLabel = provider;
		}
	};

	return {
		adapter,
		state,
		spoken,
		/** Presses a registered key. */
		press(key) {
			keys[key]();
		},
		keys,
		form: (event) => formListener(event),
		rowLabel: (id) => rowLabel(id),
		/** The accessible name of the task's row now. */
		label,
		/** Focus moved by the user (arrow keys). */
		focus: moveFocus,
		timing,
		last: () => spoken[spoken.length - 1]
	};
}
