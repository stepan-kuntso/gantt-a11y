/**
 * The engine: every command and reaction of gantt-a11y, written against the
 * adapter interface described in docs/ADAPTERS.md. It knows nothing about a
 * particular Gantt library or the DOM.
 *
 * Data comes in as plain objects:
 *   task {id, name, start, end, duration, parent, type, readonly, progress}
 *     type: "task" | "project" | "milestone"
 *   link {id, source, target, type, lag, readonly}
 *     type: "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish"
 */
import { createShortcutRegistry, spokenKey } from "./keys.js";
import { createPager } from "./pager.js";
import { createHints } from "./hints.js";
import { mergeStrings } from "./strings.js";
import { createSpeech, fill, taskName, toPlainText } from "./text/format.js";
import { conflictKey, describeConflicts, findConflicts, findLinkConflicts } from "./text/conflicts.js";
import { DEFAULT_LINK_TYPE, dependencyPages, orderLinked } from "./text/dependencies.js";
import { describeJump, describeNoJump, describeUnreachable, linkedTasks, nextJump } from "./text/navigation.js";
import { beforeAfterPages, concurrentPages, findTasksInTime } from "./text/time.js";
import { describeEdit, describeMinimum, describeRefusal, editBlocker, nextBurst, planDuration, planMove } from "./text/edit.js";
import { describeLinkCommand, linkBlocker, nextLinkType } from "./text/links.js";
import { describeFormResult, describeFormValue, describeSaved, diffFields, sameValue } from "./text/form.js";
import { DEFAULT_ROW_FIELDS, describeRow } from "./text/row.js";
import { helpPages } from "./text/help.js";
import { describeConflictItem, describeSummary, describeWhere, uniqueConflicts } from "./text/overview.js";

const LEVELS = ["brief", "standard", "detailed"];

/** Whole calendar days from one date to another (daylight saving does not count). */
function calendarDays(from, to) {
	const utc = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
	return Math.round((utc(to) - utc(from)) / 86400000);
}

// Default keys. Each command can be remapped in options.shortcuts.
export const DEFAULT_KEYS = {
	dependencies: "shift+d",
	concurrent: "shift+o",
	endsBefore: "shift+b",
	startsAfter: "shift+a",
	whereAmI: "shift+w",
	overview: "shift+v",
	goToPredecessor: "shift+p",
	goToSuccessor: "shift+s",
	conflictList: "shift+c",
	back: "shift+z",
	moveEarlier: "shift+j",
	moveLater: "shift+k",
	longer: "shift+i",
	shorter: "shift+m",
	link: "shift+l",
	linkType: "shift+t",
	unlink: "shift+u",
	repeat: "shift+r",
	help: "shift+h"
};

// Which feature owns which command; a feature set to false registers none of them.
const FEATURE_COMMANDS = {
	dependencies: ["dependencies"],
	time: ["concurrent", "endsBefore", "startsAfter"],
	overview: ["whereAmI", "overview"],
	navigation: ["goToPredecessor", "goToSuccessor", "back"],
	conflicts: ["conflictList"],
	edit: ["moveEarlier", "moveLater", "longer", "shorter"],
	links: ["link", "linkType", "unlink"],
	repeat: ["repeat"],
	help: ["help"]
};

// Edits of one task closer than this are described as one running total (D9).
const BURST_MS = 1000;
// Removing a link needs a second press within this time.
const CONFIRM_MS = 5000;
// Pressing the conflict key again within this time goes on to the next conflict.
const CONFLICT_LIST_MS = 5000;
// Deletions and discarded tasks: wait until focus has moved to another row (P23).
const FORM_DELAY_MS = 500;
// Keyboard edits: wait after the row is re-rendered before speaking, so that the
// screen reader has finished with the replaced row.
const EDIT_DELAY_MS = 500;
// Detailed level: further messages of a long save result.
const FOLLOW_UP_DELAY_MS = 4000;

// Form fields compared on save, in announcement order (D8).
const BASE_FORM_FIELDS = ["name", "start", "duration", "progress", "type", "parent"];

/**
 * @param {object} adapter  see docs/ADAPTERS.md
 * @param {object} [options]  see README, "Options"
 * @returns {{ disable: () => void }}
 */
export function createEngine(adapter, options = {}) {
	const strings = mergeStrings(options.strings);
	const locale = options.locale || strings.locale;
	const level = LEVELS.indexOf(options.verbosity) !== -1 ? options.verbosity : "standard";
	// how many names before "press again"; weekdays in edit results; years always at Detailed
	const listLimit = level === "detailed" ? 5 : 3;
	const yearMode = level === "detailed" ? "always" : "different";
	const endDates = options.endDate === "lastDay" ? "lastDay" : "gantt";
	const features = options.features || {};
	const featureOn = (name) => features[name] !== false;
	const featureOptions = (name) => (typeof features[name] === "object" && features[name] ? features[name] : {});
	const shortcutKeys = options.shortcuts || {};

	const registry = createShortcutRegistry(adapter.keys);
	const pager = createPager();
	const hints = createHints({ enabled: true });
	const cleanups = [];
	let lastText = "";
	let speechCache = null;
	let lastJump = null;

	// ---- shared helpers ----

	function speech() {
		const now = Date.now();
		if (speechCache && now - speechCache.at < 500) {
			return speechCache.value;
		}
		let multiYear = false;
		let firstYear = null;
		for (const task of adapter.getTasks()) {
			for (const date of [task.start, task.end]) {
				if (date instanceof Date) {
					firstYear = firstYear === null ? date.getFullYear() : firstYear;
					multiYear = multiYear || date.getFullYear() !== firstYear;
				}
			}
		}
		const value = createSpeech({ strings, locale, referenceYear: new Date().getFullYear(), multiYear, year: yearMode, endDates });
		speechCache = { at: now, value };
		return value;
	}

	const weekday = (kind) => level !== "brief" && kind === "edit";
	const unit = () => adapter.getDurationUnit();

	function announce(text, announceOptions) {
		lastText = text;
		adapter.announce(text, announceOptions);
	}

	function announceOnFocus(id, text, labelOptions) {
		lastText = text;
		adapter.announceOnFocus(id, text, labelOptions);
	}

	const taskText = (id) => {
		const task = adapter.getTask(id);
		return task ? task.name : null;
	};

	/** Conflicts of a task; `override` replaces one task's data (its state before a change). */
	function conflictsOf(taskId, override) {
		if (!featureOn("conflicts") || !adapter.getTask(taskId)) {
			return [];
		}
		return findConflicts({
			taskId,
			links: adapter.getLinks(),
			getTask: (id) => (override && String(id) === String(override.id) ? override : adapter.getTask(id)),
			applyLag: (date, lag) => adapter.endDate(date, lag),
			amountBetween: (from, to) => adapter.durationBetween(from, to)
		});
	}

	const conflictKeys = (taskId, override) => new Set(conflictsOf(taskId, override).map(conflictKey));

	/**
	 * Conflicts of every link that touches one of `ids` (all links when `ids` is
	 * null), in one pass over the links, with the tasks read once.
	 */
	function linkConflicts(ids) {
		if (!featureOn("conflicts")) {
			return [];
		}
		const tasks = new Map(); // each task read once, when a link needs it
		const getTask = (id) => {
			const key = String(id);
			if (!tasks.has(key)) {
				tasks.set(key, adapter.getTask(id));
			}
			return tasks.get(key);
		};
		const links = ids === null ? adapter.getLinks()
			: adapter.getLinks().filter((link) => ids.has(String(link.source)) || ids.has(String(link.target)));
		return findLinkConflicts({
			links,
			getTask,
			applyLag: (date, lag) => adapter.endDate(date, lag),
			amountBetween: (from, to) => adapter.durationBetween(from, to)
		});
	}

	function conflictText(taskId, before) {
		if (!featureOn("conflicts")) {
			return "";
		}
		return describeConflicts({ taskId, conflicts: conflictsOf(taskId), before, level, unit: unit(), speech: speech() }, strings);
	}

	/** Linked tasks in reading and visiting order (conflicts first, then the deciding one). */
	function linked(taskId, direction) {
		const conflicting = new Set(conflictsOf(taskId).map(conflictKey));
		const items = linkedTasks(taskId, adapter.getLinks(), direction)
			.map((item) => ({ item, task: adapter.getTask(item.id) }))
			.filter((entry) => entry.task)
			.map(({ item, task }) => ({
				id: item.id,
				name: task.name,
				type: item.type,
				start: task.start,
				end: task.end,
				linkId: item.link.id,
				conflict: conflicting.has(item.link.id !== undefined ? String(item.link.id) : "")
			}));
		return orderLinked(items, direction);
	}

	const page = (command, taskId, build) => pager.next(command, taskId, build, Date.now());
	const keyName = (id) => {
		const key = registry.keyOf(id);
		return key ? spokenKey(key, strings) : "";
	};
	const pageHint = (page) => (page.nextCount ? hints.take("nextPage", fill(strings.hints.nextPage, { count: page.nextCount })) : "");
	const withHint = (text, hint) => (hint ? text + " " + hint : text);

	// ---- commands ----

	const commands = {};

	commands.dependencies = () => {
		const id = adapter.getFocusedTaskId();
		if (id === null) {
			return;
		}
		const result = page("dependencies", id, () => dependencyPages({
			predecessors: linked(id, "predecessor"),
			successors: linked(id, "successor"),
			limit: listLimit,
			alwaysTypes: level === "detailed",
			speech: speech(),
			strings
		}));
		announce(withHint(result.text, pageHint(result)));
	};

	function relatives(id) {
		return [...adapter.getAncestorIds(id), ...adapter.getDescendantIds(id)];
	}

	function timeQuery(command, relation) {
		const id = adapter.getFocusedTaskId();
		if (id === null) {
			return;
		}
		const result = page(command, id, () => {
			const task = adapter.getTask(id);
			// other projects are not "at the same time": they span their subtasks
			const tasks = adapter.getTasks().filter((other) => relation !== "concurrent" || other.type !== "project");
			const found = findTasksInTime({ task, tasks, relation, excludeIds: relatives(id) });
			return relation === "concurrent"
				? concurrentPages({ task, found, limit: listLimit, unit: unit(), durationBetween: adapter.durationBetween, speech: speech() }, strings)
				: beforeAfterPages({ found, relation, limit: listLimit, speech: speech() }, strings);
		});
		announce(withHint(result.text, pageHint(result)));
	}
	commands.concurrent = () => timeQuery("concurrent", "concurrent");
	commands.endsBefore = () => timeQuery("endsBefore", "before");
	commands.startsAfter = () => timeQuery("startsAfter", "after");

	let previousJump = null;
	// The task a series of jumps started from (D10), and where the last jump landed.
	let jumpStart = null;
	let lastLanded = null;
	function startJump(focusedId) {
		if (lastLanded === null || String(lastLanded) !== String(focusedId)) {
			jumpStart = focusedId;
		}
	}
	function jump(direction) {
		const focusedId = adapter.getFocusedTaskId();
		if (focusedId === null) {
			return;
		}
		startJump(focusedId);
		const fromPrevious = previousJump && previousJump.direction === direction
			&& String(previousJump.landedId) === String(focusedId) && adapter.getTask(previousJump.originId);
		const originTotal = fromPrevious ? linked(previousJump.originId, direction).length : 0;
		const { originId, index: rawIndex } = nextJump(fromPrevious ? previousJump : null, focusedId, direction, originTotal);
		const list = linked(originId, direction);
		const s = speech();
		if (!list.length) {
			previousJump = null;
			announce(describeNoJump(direction, strings));
			return;
		}
		const index = rawIndex % list.length;
		const item = list[index];
		let text = describeJump({
			direction, index, total: list.length, type: item.type,
			origin: taskText(originId), alwaysTypes: level === "detailed", speech: s
		}, strings);
		// A hidden target means a collapsed parent will be opened (hint, spec D10).
		if (!adapter.isTaskVisible(item.id)) {
			const parent = adapter.getTask(item.id).parent;
			text = withHint(text, hints.take("opened", fill(strings.hints.opened, { name: taskName(taskText(parent), strings) })));
		}
		// The position is read first, then the target row's own label.
		announceOnFocus(item.id, text, { refresh: true });
		if (!adapter.focusTask(item.id).moved) {
			adapter.cancelOnFocus(item.id);
			previousJump = null;
			announce(describeUnreachable({ index, total: list.length, name: item.name, speech: s }, strings));
			return;
		}
		previousJump = { direction, originId, landedId: item.id, index };
		lastJump = { direction, originId, landedId: item.id, linkId: item.linkId };
		lastLanded = item.id;
	}
	commands.goToPredecessor = () => jump("predecessor");
	commands.goToSuccessor = () => jump("successor");

	commands.back = () => {
		const focusedId = adapter.getFocusedTaskId();
		if (focusedId === null) {
			return;
		}
		const target = jumpStart;
		if (target === null || !adapter.getTask(target) || String(target) === String(focusedId)) {
			announce(strings.navigation.nothingToGoBack);
			return;
		}
		jumpStart = null;
		lastLanded = null;
		previousJump = null;
		conflictCursor = null;
		const name = taskText(target);
		announceOnFocus(target, fill(strings.navigation.backTo, { name: taskName(name, strings) }), { refresh: true });
		if (!adapter.focusTask(target).moved) {
			adapter.cancelOnFocus(target);
			announce(describeUnreachable({ index: 0, total: 1, name, speech: speech() }, strings));
		}
	};

	// ---- orientation on demand ----

	/** Every link conflict in the chart, each once, largest first. */
	function allConflicts() {
		return uniqueConflicts(linkConflicts(null), conflictKey, locale);
	}

	commands.overview = () => {
		const tasks = adapter.getTasks();
		announce(describeSummary({
			tasks,
			shown: tasks.filter((task) => adapter.isTaskVisible(task.id)).length,
			conflicts: allConflicts(),
			level,
			unit: unit(),
			speech: speech()
		}, strings));
	};

	commands.whereAmI = () => {
		const id = adapter.getFocusedTaskId();
		const task = id === null ? null : adapter.getTask(id);
		if (!task) {
			return;
		}
		const ancestors = adapter.getAncestorIds(id).map((ancestorId) => taskText(ancestorId));
		const siblings = (task.parent === null || task.parent === undefined
			? adapter.getTasks().filter((other) => other.parent === null || other.parent === undefined).map((other) => other.id)
			: adapter.getChildIds(task.parent)
		).filter((siblingId) => String(siblingId) === String(id) || adapter.isTaskVisible(siblingId));
		const index = Math.max(0, siblings.findIndex((siblingId) => String(siblingId) === String(id)));
		announce(describeWhere({
			name: task.name,
			ancestors,
			index,
			total: Math.max(siblings.length, 1),
			level,
			subtasks: adapter.getDescendantIds(id).length,
			speech: speech()
		}, strings));
	};

	let conflictCursor = null;
	commands.conflictList = () => {
		const focusedId = adapter.getFocusedTaskId();
		if (focusedId === null) {
			return;
		}
		const list = allConflicts();
		if (!list.length) {
			conflictCursor = null;
			announce(strings.conflictList.none);
			return;
		}
		const now = Date.now();
		const continuing = conflictCursor && now - conflictCursor.at <= CONFLICT_LIST_MS && String(conflictCursor.landedId) === String(focusedId);
		const index = continuing ? (conflictCursor.index + 1) % list.length : 0;
		const conflict = list[index];
		const target = conflict.target.id;
		startJump(focusedId);
		const s = speech();
		const text = describeConflictItem({ conflict, index, total: list.length, unit: unit(), speech: s }, strings);
		if (String(target) === String(focusedId)) {
			// focus stays on the same row: see keyboard edits below
			conflictCursor = { index, at: now, landedId: target };
			lastLanded = target;
			announce(text, { delay: editDelay() });
			return;
		}
		announceOnFocus(target, text, { refresh: true });
		if (!adapter.focusTask(target).moved) {
			adapter.cancelOnFocus(target);
			conflictCursor = null;
			announce(describeUnreachable({ index, total: list.length, name: conflict.target.name, speech: s }, strings));
			return;
		}
		conflictCursor = { index, at: now, landedId: target };
		lastLanded = target;
	};

	const editDelay = () => EDIT_DELAY_MS;

	// Keyboard edits. Focus stays on the same task: the adapter re-renders the
	// row and focuses it again, but a screen reader need not announce a focus
	// "change" to the row it was already on (VoiceOver stayed silent in Safari,
	// 2026-11-18). So the result goes to the live region, after the re-render,
	// and the row label stays the task's own label: nothing is read twice.
	// A live region update right after the focused row was replaced was not
	// heard either, so it waits (EDIT_DELAY_MS); a new press within that
	// time replaces the pending message, so a burst is spoken once.
	let burst = null;
	function focusedEditable(action) {
		const id = adapter.getFocusedTaskId();
		if (id === null) {
			return null;
		}
		const task = adapter.getTask(id);
		const blocked = editBlocker(task, {
			readonly: !!task.readonly,
			isProject: task.type === "project",
			isMilestone: task.type === "milestone"
		}, action);
		if (blocked) {
			announce(describeRefusal(blocked, level, strings));
			return null;
		}
		return task;
	}

	function editText(task, atMinimum) {
		return describeEdit({
			burst,
			task,
			isMilestone: task.type === "milestone",
			atMinimum,
			level,
			weekday: weekday("edit"),
			unit: unit(),
			speech: speech()
		}, strings);
	}

	/**
	 * Writes the planned dates, then reads the task again: the library or the
	 * application may refuse the change (onBeforeTaskUpdate) or store other
	 * values. Only what was stored is announced.
	 */
	function applyEdit(task, plan) {
		const before = conflictKeys(task.id);
		adapter.updateTask(task.id, { start: plan.start, end: plan.end, duration: plan.duration });
		const stored = adapter.getTask(task.id);
		const days = stored ? calendarDays(task.start, stored.start) : 0;
		const durationDelta = stored ? Number(stored.duration) - Number(task.duration) : 0;
		if (!stored || (sameValue(stored.start, task.start) && sameValue(stored.end, task.end) && !durationDelta)) {
			announce(strings.edit.rejected, { delay: editDelay() });
			return;
		}
		burst = nextBurst(burst, task.id, { days, durationDelta }, Date.now(), BURST_MS);
		const conflicts = featureOn("conflicts")
			? describeConflicts({ taskId: task.id, conflicts: conflictsOf(task.id), before, level, unit: unit(), speech: speech() }, strings)
			: "";
		announce(withHint(editText(stored, false), conflicts), { delay: editDelay() });
	}

	function move(days) {
		const task = focusedEditable("move");
		if (task) {
			const plan = planMove({ start: task.start, duration: task.duration }, days,
				(date, n) => adapter.addDays(date, n), (start, duration) => adapter.endDate(start, duration, task.id));
			applyEdit(task, plan);
		}
	}

	function resize(sign) {
		const task = focusedEditable("duration");
		if (!task) {
			return;
		}
		const step = adapter.getDurationStep() || 1;
		const plan = planDuration({ start: task.start, duration: task.duration }, sign * step, 1,
			(start, duration) => adapter.endDate(start, duration, task.id));
		if (plan) {
			applyEdit(task, plan);
			return;
		}
		const inBurst = burst && String(burst.id) === String(task.id) && Date.now() - burst.at <= BURST_MS && burst.resizes;
		if (inBurst) {
			// nothing is written: the burst so far, at the minimum
			burst = nextBurst(burst, task.id, {}, Date.now(), BURST_MS);
			announce(editText(task, true), { delay: editDelay() });
		} else {
			announce(describeMinimum(task.duration, unit(), speech(), strings));
		}
	}
	commands.moveEarlier = () => move(-1);
	commands.moveLater = () => move(1);
	commands.longer = () => resize(1);
	commands.shorter = () => resize(-1);

	// Links from the keyboard.
	let marked = null;
	let pendingRemoval = null;
	const sayLink = (input) => announce(describeLinkCommand(input, strings));

	commands.link = () => {
		const id = adapter.getFocusedTaskId();
		if (id === null) {
			return;
		}
		if (!marked || !adapter.getTask(marked.id)) {
			marked = { id, type: DEFAULT_LINK_TYPE };
			const hint = hints.take("linkMarked", fill(strings.linkHints.marked, { key: keyName("link") }));
			announce(withHint(describeLinkCommand({ result: "marked", name: taskText(id) }, strings), hint));
			return;
		}
		if (String(marked.id) === String(id)) {
			marked = null;
			sayLink({ result: "cancelled" });
			return;
		}
		const source = marked.id;
		const type = marked.type;
		marked = null;
		const candidate = { source, target: id, type };
		const reason = linkBlocker({
			sourceId: source,
			targetId: id,
			links: adapter.getLinks(),
			readonly: !!(adapter.getTask(source).readonly || adapter.getTask(id).readonly),
			allowed: adapter.canLink(candidate)
		});
		if (reason) {
			sayLink({ result: "blocked", reason, name: taskText(source) });
			return;
		}
		const before = conflictKeys(id);
		const linkId = adapter.addLink(candidate);
		// read again: the library or the application may have refused it (onBeforeLinkAdd)
		const stored = linkId === null || linkId === undefined ? null
			: adapter.getLinks().find((item) => String(item.id) === String(linkId));
		if (!stored) {
			sayLink({ result: "blocked", reason: "failed" });
			return;
		}
		const text = describeLinkCommand({ result: "created", name: taskText(stored.source), type: stored.type || type }, strings);
		announce(withHint(text, conflictText(id, before)));
	};

	commands.linkType = () => {
		if (!marked) {
			sayLink({ result: "noSource", key: keyName("link") });
			return;
		}
		marked.type = nextLinkType(marked.type);
		sayLink({ result: "type", type: marked.type });
	};

	commands.unlink = () => {
		const id = adapter.getFocusedTaskId();
		const jumpState = lastJump;
		const link = jumpState && adapter.getLinks().find((item) => String(item.id) === String(jumpState.linkId));
		if (id === null || !jumpState || String(jumpState.landedId) !== String(id) || !link) {
			pendingRemoval = null;
			sayLink({ result: "noContext" });
			return;
		}
		const name = taskText(jumpState.originId);
		if (link.readonly) {
			sayLink({ result: "notRemoved", reason: "readonly" });
			return;
		}
		const now = Date.now();
		if (!pendingRemoval || String(pendingRemoval.linkId) !== String(link.id) || now - pendingRemoval.at > CONFIRM_MS) {
			pendingRemoval = { linkId: link.id, at: now };
			sayLink({ result: "confirmRemove", name, direction: jumpState.direction });
			return;
		}
		pendingRemoval = null;
		adapter.removeLink(link.id);
		// read again: the library or the application may have refused it (onBeforeLinkDelete)
		if (adapter.getLinks().some((item) => String(item.id) === String(link.id))) {
			sayLink({ result: "notRemoved" });
			return;
		}
		lastJump = null;
		sayLink({ result: "removed", name, direction: jumpState.direction });
	};

	commands.repeat = () => {
		adapter.announce(lastText || strings.meta.nothingToRepeat);
	};

	commands.help = () => {
		const id = adapter.getFocusedTaskId();
		const result = page("help", id === null ? "" : id, () => helpPages(
			registry.list().map((entry) => ({ id: entry.id, description: entry.description, spokenKey: spokenKey(entry.key, strings) })),
			speech(),
			strings
		));
		announce(result.text);
	};

	// ---- the task form ----

	function formatFormValue(field, value, s, context = {}) {
		if (value === null || value === undefined || value === "") {
			return "";
		}
		// "Duration 8 days, was 5": the old number without its unit, except at Detailed (D8).
		const short = context.old && level !== "detailed";
		switch (field.kind) {
			case "date":
				return s.date(value);
			case "end":
				return s.date(s.end(context.start || value, value));
			case "duration":
				return short ? s.number(value) : s.duration(value, unit());
			case "percent": {
				const percent = s.number(Math.round(Number(value) * 100));
				return short ? percent : fill(strings.form.percent, { value: percent });
			}
			case "type":
				return toPlainText(adapter.typeLabel(value) || value);
			case "parent":
				return value === null || value === undefined ? strings.form.noParent : taskName(taskText(value), strings);
			default:
				return value instanceof Date ? s.date(value) : toPlainText(value);
		}
	}

	function formFields() {
		const base = {
			name: { key: "name", kind: "text" },
			start: { key: "start", kind: "date" },
			end: { key: "end", kind: "end" },
			duration: { key: "duration", kind: "duration" },
			progress: { key: "progress", kind: "percent" },
			type: { key: "type", kind: "type" },
			parent: { key: "parent", kind: "parent" }
		};
		const keys = BASE_FORM_FIELDS.slice();
		if (level === "detailed") {
			keys.splice(keys.indexOf("duration") + 1, 0, "end");
		}
		const extra = adapter.formFields ? adapter.formFields() : [];
		const fields = keys.map((key) => ({ ...base[key], label: strings.fields[key], listLabel: strings.fieldsInList[key] }));
		for (const field of extra) {
			if (!fields.some((item) => item.key === field.key)) {
				fields.push({ key: field.key, kind: "text", label: field.label, listLabel: field.label });
			}
		}
		const columns = adapter.columnFields ? adapter.columnFields() : [];
		return fields.map((field) => ({ ...field, isColumn: columns.indexOf(field.key) !== -1 }));
	}

	let formPending = null;
	let followUpTimer = null;
	let lastFormValues = null;
	const formDelay = FORM_DELAY_MS;

	function onFormEvent(event) {
		const s = speech();
		switch (event.type) {
			case "open":
				lastFormValues = event.values || null;
				break;
			case "values": {
				// F10: a value changed while the form is open
				const last = lastFormValues;
				const current = event.values;
				lastFormValues = current;
				if (!last || !current) {
					return;
				}
				const changes = [];
				if (!sameValue(last.start, current.start)) {
					changes.push({ label: strings.fields.start, value: s.date(current.start) });
				}
				if (!sameValue(last.duration, current.duration)) {
					changes.push({ label: strings.fields.duration, value: s.duration(current.duration, unit()) });
				}
				if (!changes.length && sameValue(last.end, current.end)) {
					return;
				}
				announce(describeFormValue({ changes, endDate: current.end ? s.date(s.end(current.start, current.end)) : "" }, strings));
				break;
			}
			case "save": {
				formPending = { type: "save", id: event.id, isNew: !!event.isNew, before: event.before || null };
				if (formPending.before) {
					formPending.conflictsBefore = conflictKeys(event.id, {
						...adapter.getTask(event.id), start: event.before.start, end: event.before.end, duration: event.before.duration
					});
				}
				// The new values are known before the library saves them: the result
				// goes into the row label now, so the row the library re-renders and
				// focuses after the form closes already carries it (heard first).
				// A new task is different: the library focuses its row while the form
				// is still open, so no focus change follows the form closing and the
				// row label is not read (VoiceOver, 2026-11-18); see resolveForm.
				if (event.after && !formPending.isNew) {
					formPending.result = saveResult(formPending, event.after, s);
					labelFormResult(formPending, false);
				}
				break;
			}
			case "cancel":
				formPending = { type: "cancel", id: event.id };
				if (event.isNew && event.returnTo !== null && event.returnTo !== undefined && adapter.getTask(event.returnTo)) {
					// a new task is removed and focus goes back to the row it was created
					// from, which the library re-renders: the result goes into that row's label
					formPending = { type: "cancel", id: event.returnTo, discarded: true, newId: event.id };
					formPending.result = { messages: [describeFormResult({ action: "discarded" }, s, strings)], withLabel: true };
					labelFormResult(formPending, false);
				} else if (adapter.getTask(event.id)) {
					formPending.result = { messages: [describeFormResult({ action: "cancelled" }, s, strings)], withLabel: false };
					// nothing else re-renders the row after a cancel: do it while the form is open
					labelFormResult(formPending, true);
				}
				break;
			case "delete": {
				// Count what goes with the task (F9)
				const ids = new Set([String(event.id), ...adapter.getDescendantIds(event.id).map(String)]);
				const links = adapter.getLinks().filter((link) => ids.has(String(link.source)) || ids.has(String(link.target))).length;
				formPending = { type: "delete", id: event.id, name: taskText(event.id), subtasks: ids.size - 1, links };
				break;
			}
			case "close": {
				lastFormValues = null;
				const action = formPending;
				formPending = null;
				if (action) {
					resolveForm(action, s);
				}
				break;
			}
			default:
				break;
		}
	}

	// Form results (saved, created, cancelled) are put into the row label
	// before the form closes, without re-rendering the row afterwards: the
	// library re-renders it and moves focus to it once, and the screen reader
	// reads the result first. A re-render after focus has landed was not
	// announced by VoiceOver in Safari (2026-11-18). Until the form closes, the
	// message has no live-region fallback, so a save refused by the
	// application says nothing.
	function labelFormResult(action, refresh) {
		const r = action.result;
		adapter.announceOnFocus(action.id, r.messages[0], { refresh, fallback: false });
	}

	function saveResult(action, after, s) {
		if (action.isNew) {
			// F6: the name is news; the row label (dates) follows.
			return { messages: [describeFormResult({ action: "created", name: after.name }, s, strings)], withLabel: true };
		}
		const fields = formFields();
		const changes = diffFields(action.before, after, fields.map((field) => field.key)).map((change) => {
			const field = fields.find((item) => item.key === change.field);
			return {
				field: change.field,
				label: field.label,
				listLabel: field.listLabel,
				isColumn: field.isColumn,
				to: formatFormValue(field, change.to, s, { start: after.start }),
				from: formatFormValue(field, change.from, s, { old: true, start: action.before.start })
			};
		});
		const result = describeSaved({
			changes,
			endChanged: !sameValue(action.before.end, after.end),
			endDate: after.end ? s.date(s.end(after.start, after.end)) : "",
			level,
			speech: s
		}, strings);
		if (changes.length && featureOn("conflicts")) {
			// conflicts on the new dates, before the library has stored them
			const task = { ...adapter.getTask(action.id), start: after.start, end: after.end, duration: after.duration };
			const conflicts = describeConflicts({ taskId: action.id, conflicts: conflictsOf(action.id, task), before: action.conflictsBefore, level, unit: unit(), speech: s }, strings);
			result.messages[0] = withHint(result.messages[0], conflicts);
		}
		return result;
	}

	function resolveForm(action, s) {
		const exists = !!adapter.getTask(action.id);
		if ((action.type === "save" || action.type === "cancel") && exists && action.result) {
			let r = action.result;
			let refresh = false;
			if (action.type === "save" && adapter.formSnapshot) {
				// read again: the application may have stored other values than the form had
				const stored = saveResult(action, adapter.formSnapshot(action.id), s);
				if (stored.messages.join(" ") !== r.messages.join(" ")) {
					r = stored;
					refresh = true;
				}
			}
			// the form has closed: from now on, fall back to the live region if focus does not land
			announceOnFocus(action.id, r.messages[0], { refresh });
			const rest = r.messages.slice(1);
			if (rest.length) {
				clearTimeout(followUpTimer);
				followUpTimer = setTimeout(() => announce(rest.join(" ")), FOLLOW_UP_DELAY_MS);
			}
			return;
		}
		if (action.type === "save" && exists) {
			// a new task, or an adapter that does not give the new values: speak through
			// the live region after the form has closed, with the row's text when the
			// result is meant to be followed by the row
			action.result = saveResult(action, adapter.formSnapshot(action.id), s);
			const label = action.result.withLabel && features.rowLabel ? rowLabel(action.id) : null;
			announce(label ? action.result.messages[0] + " " + label : action.result.messages[0], { delay: formDelay });
			return;
		}
		if (action.type === "cancel") {
			if (action.discarded) {
				return;
			}
			if (!exists) {
				announce(describeFormResult({ action: "discarded" }, s, strings), { delay: formDelay });
			}
			return;
		}
		if (action.type === "delete" && !exists) {
			announce(describeFormResult({ action: "deleted", name: action.name, subtasks: action.subtasks, links: action.links }, s, strings),
				{ delay: formDelay });
		}
		// A delete that is still there was declined in the confirmation: nothing to say.
	}

	// ---- the row label (optional) ----

	function rowLabel(id) {
		const task = adapter.getTask(id);
		if (!task) {
			return null;
		}
		const rowOptions = featureOptions("rowLabel");
		const fields = Array.isArray(rowOptions.fields) ? rowOptions.fields
			: (level === "detailed" ? ["name", "parent", "dates", "progress"] : DEFAULT_ROW_FIELDS);
		const inside = task.type === "project" ? adapter.getDescendantIds(id) : [];
		let conflictsInside = 0;
		if (inside.length) {
			const children = adapter.getChildIds(id);
			if (children.length && !adapter.isTaskVisible(children[0])) {
				conflictsInside = new Set(linkConflicts(new Set(inside.map(String))).map(conflictKey)).size;
			}
		}
		const parent = task.parent === null || task.parent === undefined ? null : adapter.getTask(task.parent);
		return describeRow({
			task,
			kind: task.type === "milestone" || task.type === "project" ? task.type : "task",
			fields,
			level,
			parentName: parent ? parent.name : null,
			childCount: inside.length,
			linkCounts: fields.indexOf("links") === -1 ? null : {
				predecessors: linked(id, "predecessor").length,
				successors: linked(id, "successor").length
			},
			conflictsInside,
			unit: unit(),
			speech: speech()
		}, strings);
	}

	// ---- wiring ----

	function teardown() {
		registry.clear();
		while (cleanups.length) {
			cleanups.pop()();
		}
		clearTimeout(followUpTimer);
		marked = null;
		pendingRemoval = null;
	}

	try {
		for (const feature in FEATURE_COMMANDS) {
			if (!featureOn(feature)) {
				continue;
			}
			for (const id of FEATURE_COMMANDS[feature]) {
				registry.register({
					id,
					key: shortcutKeys[id] || DEFAULT_KEYS[id],
					description: strings.shortcuts[id] || id,
					handler: commands[id]
				});
			}
		}
		if (featureOn("form") && adapter.onForm) {
			cleanups.push(adapter.onForm(onFormEvent));
		}
		if (features.rowLabel && adapter.setRowLabel) {
			adapter.setRowLabel(rowLabel);
			cleanups.push(() => adapter.setRowLabel(null));
		}
	} catch (error) {
		teardown();
		throw error;
	}

	return { disable: teardown };
}
