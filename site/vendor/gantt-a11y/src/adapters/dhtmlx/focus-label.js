/**
 * Speaks a message *before* the task row label when keyboard focus lands on a row.
 *
 * Why: after a change (form save, keyboard edit) the library re-renders the
 * row and focuses it again, and when we move focus to another task the
 * screen reader reads the new row first. A live region is always queued
 * after that row label (tested with VoiceOver, polite and assertive).
 *
 * How: the row's aria-label comes from the public template
 * gantt.templates.tooltip_text (see _taskCommonAttr in the library's
 * wai_aria.js). While a message is pending for a task, a wrapper template
 * returns the message followed by the normal label for that task only, so
 * the row never loses the task's name. The message is removed, and the row
 * re-rendered with its normal label, when focus leaves the row (to another
 * element, to nothing, or to another window) and at the latest LIFETIME_MS
 * after focus landed. A message that was heard is never spoken again.
 *
 * If focus does not land on the row, the message falls back to the live region.
 *
 * In cell navigation mode focus lands on a cell, whose accessible name comes
 * from the column template, not from tooltip_text. Messages then go to the
 * live region, after the cell is read; column templates are not changed.
 *
 * With the tooltip plugin on (gantt.ext.tooltips), the template is also shown
 * to sighted users on hover, and its callers cannot be told apart. Messages
 * then go to the live region only, after the row is read, and the template
 * is never wrapped.
 */

// Live region only: wait until focus has moved and the row has been read.
const LIVE_DELAY_MS = 500;
// How long to wait for focus to land on the row before falling back.
const LANDING_TIMEOUT_MS = 600;
// How long a message stays in the label after focus landed: long enough to be
// read with the row, short enough that reading the row again later gives its
// normal label.
const LIFETIME_MS = 5000;

/**
 * @param {object} gantt
 * @param {(text: string) => void} fallbackAnnounce  live region announcement
 */
export function createFocusLabels(gantt, fallbackAnnounce) {
	const pending = new Map(); // String(id) -> {id, text, landed, timer, lifeTimer}
	const live = new Map(); // String(id) -> timer of a live-region message (see liveOnly)
	// The wrapper in use, and the template it replaced. Each wrapper keeps the
	// template it wraps in its own closure: if the application wraps ours in
	// turn, our wrapper stays in that chain after we are done, and must keep
	// working there (it then passes the label through unchanged).
	let wrapper = null;
	let wrapped = null;
	const doc = typeof document !== "undefined" ? document : null;

	/** The column of the focused cell in cell navigation mode, else null. */
	function focusedColumn() {
		const node = gantt.ext && gantt.ext.keyboardNavigation ? gantt.ext.keyboardNavigation.getActiveNode() : null;
		return node && node.type === "taskCell" && node.column ? node.column : null;
	}

	/**
	 * Messages go to the live region only: with the tooltip plugin (the template
	 * is shown to sighted users too) and in cell navigation mode (a cell's name
	 * does not come from this template).
	 */
	function liveOnly() {
		return !!(gantt.ext && gantt.ext.tooltips) || focusedColumn() !== null;
	}

	function cancelLive(key) {
		clearTimeout(live.get(key));
		live.delete(key);
	}

	function rowNodes(id) {
		const nodes = [];
		if (!gantt.isTaskExists(id)) {
			return nodes;
		}
		const row = gantt.getTaskRowNode(id);
		const bar = gantt.getTaskNode(id);
		if (row) nodes.push(row);
		if (bar) nodes.push(bar);
		return nodes;
	}

	// The row (or bar) element itself.
	function isFocusedOn(id, target) {
		return !!target && rowNodes(id).some((node) => node === target);
	}

	function install() {
		if (wrapper) {
			return;
		}
		const original = gantt.templates.tooltip_text;
		const own = function (start, end, task) {
			const label = original.apply(this, arguments);
			const message = wrapper === own && task ? pending.get(String(task.id)) : null;
			if (!message) {
				return label;
			}
			return label ? message.text + " " + label : message.text;
		};
		wrapper = own;
		wrapped = original;
		gantt.templates.tooltip_text = own;
		if (doc) {
			doc.addEventListener("focusin", onFocusIn, true);
			doc.addEventListener("focusout", onFocusOut, true);
			doc.defaultView && doc.defaultView.addEventListener("blur", onWindowBlur);
		}
	}

	function uninstall() {
		if (!wrapper) {
			return;
		}
		// If the application replaced the template meanwhile, keep its version.
		if (gantt.templates.tooltip_text === wrapper) {
			gantt.templates.tooltip_text = wrapped;
		}
		wrapper = null;
		wrapped = null;
		if (doc) {
			doc.removeEventListener("focusin", onFocusIn, true);
			doc.removeEventListener("focusout", onFocusOut, true);
			doc.defaultView && doc.defaultView.removeEventListener("blur", onWindowBlur);
		}
	}

	function clear(key, refresh = true) {
		const message = pending.get(key);
		if (!message) {
			return;
		}
		clearTimeout(message.timer);
		clearTimeout(message.lifeTimer);
		pending.delete(key);
		if (!pending.size) {
			uninstall();
		}
		if (refresh && gantt.isTaskExists(message.id)) {
			gantt.refreshTask(message.id);
		}
	}

	function land(key, message) {
		if (!message.landed) {
			message.landed = true;
			message.lifeTimer = setTimeout(() => {
				if (pending.get(key) === message) {
					clear(key);
				}
			}, LIFETIME_MS);
		}
	}

	function onFocusIn(event) {
		for (const [key, message] of Array.from(pending)) {
			if (isFocusedOn(message.id, event.target)) {
				land(key, message);
			} else if (message.landed) {
				clear(key);
			}
		}
	}

	// Focus leaves the row: to another element, or to nothing (blur). Where it
	// went is checked a moment later: when the library re-renders the focused
	// row (Chromium sends a focusout then) or puts focus back after a blur, focus
	// is on the task's row again and the message stays (until LIFETIME_MS).
	function onFocusOut(event) {
		for (const [key, message] of Array.from(pending)) {
			if (!message.landed || !isFocusedOn(message.id, event.target)) {
				continue;
			}
			setTimeout(() => {
				const back = doc.hasFocus() && isFocusedOn(message.id, doc.activeElement);
				if (pending.get(key) === message && !back) {
					clear(key);
				}
			}, 0);
		}
	}

	// Another window or tab: when the user comes back, the row has its normal label.
	function onWindowBlur() {
		for (const [key, message] of Array.from(pending)) {
			if (message.landed) {
				clear(key);
			}
		}
	}

	return {
		/**
		 * Prepares a message for the next time focus lands on the task's row.
		 * Call before the change or focus move that re-renders / focuses the row.
		 * @param {string|number} id
		 * @param {string} text
		 * The message is always followed by the row's normal label.
		 * @param {{refresh?: boolean, fallback?: boolean}} [options]
		 *        refresh: re-render the row now (when nothing else will);
		 *        fallback: if focus does not land, speak through the live region
		 *        (false: the caller will confirm later, see the task form)
		 */
		announceOnFocus(id, text, { refresh = false, fallback = true } = {}) {
			const key = String(id);
			clear(key, false);
			cancelLive(key);
			if (liveOnly()) {
				// fallback: false means the caller speaks it later (the task form)
				if (fallback) {
					live.set(key, setTimeout(() => {
						live.delete(key);
						fallbackAnnounce(text);
					}, LIVE_DELAY_MS));
				}
				return;
			}
			install();
			const message = { id, text, landed: false, timer: null, lifeTimer: null };
			pending.set(key, message);
			// already on the row (the library may focus a new task's row while its
			// form is still open): the label is what is read, nothing to fall back to
			if (doc && isFocusedOn(id, doc.activeElement)) {
				land(key, message);
			}
			if (refresh && gantt.isTaskExists(id)) {
				gantt.refreshTask(id);
			}
			message.timer = setTimeout(() => {
				// landed (and heard): never spoken again
				if (pending.get(key) !== message || message.landed) {
					return;
				}
				if (doc && isFocusedOn(id, doc.activeElement)) {
					land(key, message);
					return;
				}
				clear(key);
				if (fallback) {
					fallbackAnnounce(text);
				}
			}, LANDING_TIMEOUT_MS);
		},

		/** Drops a waiting message (focus did not move after all): nothing is spoken. */
		cancel(id) {
			clear(String(id));
			cancelLive(String(id));
		},

		/** Puts the original template back and re-renders affected rows. */
		destroy() {
			for (const key of Array.from(pending.keys())) {
				clear(key);
			}
			for (const key of Array.from(live.keys())) {
				cancelLive(key);
			}
			uninstall();
		}
	};
}
