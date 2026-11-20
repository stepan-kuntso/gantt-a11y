/**
 * All spoken texts, in English, designed after docs/ANNOUNCEMENTS.md.
 * Catalogue row numbers (R2, N1, E1, ...) refer to section 3 of that document.
 *
 * Translating: pass a partial object as `options.strings`; it is merged deeply.
 * - Placeholders in curly braces are filled in by the code; keep them.
 * - Templates are whole sentences: never split or join them differently.
 * - Objects with one/few/many/other are plural forms chosen with
 *   Intl.PluralRules for `locale`; add the categories your language needs.
 * - `locale` is used for dates, numbers and lists (Intl) and as the lang of
 *   the live region.
 * - Task names follow a colon or stand alone, so they never need a case ending.
 */
export const defaultStrings = {
	locale: "en-GB",

	common: {
		// Spoken in place of an empty task name.
		unnamedTask: "Unnamed task",
		// A value cleared in the form: "Owner empty, was Anna."
		emptyValue: "empty",
		// "13 to 17 June"; {from} may be just the day number.
		range: "{from} to {to}",
		endOfList: "End of list.",
		// Accessible name of the task list the frappe-gantt adapter adds.
		taskList: "Tasks"
	},

	// Counted nouns: {count} is the number formatted for the locale.
	// The duration-unit keys match gantt.config.duration_unit.
	nouns: {
		minute: { one: "{count} minute", other: "{count} minutes" },
		hour: { one: "{count} hour", other: "{count} hours" },
		day: { one: "{count} day", other: "{count} days" },
		week: { one: "{count} week", other: "{count} weeks" },
		month: { one: "{count} month", other: "{count} months" },
		year: { one: "{count} year", other: "{count} years" },
		task: { one: "{count} task", other: "{count} tasks" },
		change: { one: "{count} change", other: "{count} changes" },
		subtask: { one: "{count} subtask", other: "{count} subtasks" },
		link: { one: "{count} link", other: "{count} links" },
		conflict: { one: "{count} conflict", other: "{count} conflicts" },
		project: { one: "{count} project", other: "{count} projects" },
		milestone: { one: "{count} milestone", other: "{count} milestones" }
	},

	// Duration unit without a number: "first day", "last day".
	unitNames: {
		minute: "minute", hour: "hour", day: "day", week: "week", month: "month", year: "year"
	},

	// gantt.config.links keys -> spoken names. finish_to_start is the default
	// type and is not spoken in lists (spec 2.6).
	linkTypes: {
		finish_to_start: "finish to start",
		start_to_start: "start to start",
		finish_to_finish: "finish to finish",
		start_to_finish: "start to finish"
	},

	// Field labels at the start of a sentence: "Duration 8 days, was 5."
	fields: {
		name: "Name",
		start: "Start",
		end: "End",
		duration: "Duration",
		progress: "Progress",
		type: "Type",
		parent: "Parent"
	},

	// Field names inside a list: "Saved, 3 changes: name, start, duration."
	fieldsInList: {
		name: "name",
		start: "start",
		end: "end",
		duration: "duration",
		progress: "progress",
		type: "type",
		parent: "parent"
	},

	// Shortcut descriptions for the help announcement (action first, spec D13).
	shortcuts: {
		dependencies: "Dependencies",
		concurrent: "Same time",
		endsBefore: "Ends before",
		startsAfter: "Starts after",
		goToPredecessor: "To what this depends on",
		goToSuccessor: "To what depends on this",
		moveEarlier: "Earlier",
		moveLater: "Later",
		longer: "Longer",
		shorter: "Shorter",
		whereAmI: "Where am I",
		overview: "Overview of the chart",
		conflictList: "Next conflict",
		back: "Back to where the jumps started",
		repeat: "Repeat last",
		link: "Make a link",
		linkType: "Link type",
		unlink: "Remove link",
		help: "Help"
	},

	// Hints follow the fact, and each is spoken at most three times per
	// session (spec P11; there is no switch for them, see the spec's
	// Implementation notes). The help hint has its own switch,
	// features.helpHint, and is spoken once per page load (P30).
	hints: {
		// Once, 500 ms after focus first lands on a task, after the row label (P30).
		help: "Press {key} for keys.",
		// After a list page; {count} is how many come next.
		nextPage: "Press again for the next {count}.",
		// After a jump that had to expand a collapsed parent.
		opened: "Opened {name}."
	},

	// Lists that do not fit one announcement (R6, R7). Spoken alone.
	pages: {
		page: "{from} to {to} of {total}: {list}.",
		pageOfTwo: "{from} and {to} of {total}: {list}.",
		pageOfOne: "{from} of {total}: {list}."
	},

	// R2 to R5. Spoken after the row label, on Shift+D.
	dependencies: {
		none: "No dependencies.",
		// One task: "Depends on: Software design." / with an unusual type:
		// "Depends on: Documentation, start to start."
		dependsOnOne: "Depends on: {item}.",
		requiredByOne: "Required by: {item}.",
		// 2 to the limit, no unusual types: "Depends on 3: A, B, C."
		dependsOnList: "Depends on {count}: {list}.",
		requiredByList: "Required by {count}: {list}.",
		// 2 to the limit with an unusual type: "Required by 3." then one sentence per task.
		dependsOnCount: "Depends on {count}.",
		requiredByCount: "Required by {count}.",
		// More than the limit: "Depends on 8. First 3: A, B, C."
		dependsOnFirst: "Depends on {count}. First {shown}: {list}.",
		requiredByFirst: "Required by {count}. First {shown}: {list}.",
		// 10 or more (spec D2): the deciding task instead of names.
		dependsOnSummary: "Depends on {count}. Last to end: {name}, {date}.",
		requiredBySummary: "Required by {count}. First to start: {name}, {date}.",
		inConflict: "{count} in conflict: {list}.",
		// One task with its type, inside a list sentence or alone.
		item: "{name}",
		itemTyped: "{name}, {type}",
		// One sentence per task when any has an unusual type.
		itemSentence: "{name}.",
		itemTypedSentence: "{name}, {type}."
	},

	// N1 to N5. "row label" route: spoken before the target row's own label.
	navigation: {
		position: "{n} of {total}",
		positionTyped: "{n} of {total}, {type}",
		jumpedToPredecessor: "{position}. {origin} depends on this.",
		jumpedToSuccessor: "{position}. This depends on {origin}.",
		onlyPredecessor: "{origin} depends on this.",
		onlyPredecessorTyped: "{origin} depends on this, {type}.",
		onlySuccessor: "This depends on {origin}.",
		onlySuccessorTyped: "This depends on {origin}, {type}.",
		noPredecessors: "Depends on nothing.",
		noSuccessors: "Nothing depends on this.",
		filteredOut: "{position}, {name}, is filtered out. Focus did not move.",
		filteredOutOnly: "{name} is filtered out. Focus did not move.",
		// D10: back to the task the jumps started from, before its row label.
		backTo: "Back to {name}.",
		nothingToGoBack: "Nothing to go back to."
	},

	// S2, the chart summary (Shift+V), spoken alone: "11 tasks. 1 to 23 June. No conflicts."
	overview: {
		// {count} is "11 tasks"
		tasks: "{count}.",
		// some tasks have no row now (collapsed or filtered out): "5,000 tasks, 212 shown."
		tasksShown: "{count}, {shown} shown.",
		// Detailed level: "1 project, 1 milestone."
		kinds: "{list}.",
		span: "{range}.",
		// {count} is "2 conflicts"
		conflicts: "{count}.",
		noConflicts: "No conflicts.",
		// Detailed level: the task that is too early, the amount, the other task
		largest: "Largest: {name}, {amount} too early for {other}.",
		// {count} is "2 tasks"
		unscheduled: "{count} without dates.",
		empty: "No tasks."
	},

	// R12, where am I (Shift+W), spoken alone: "Testing. In Website redesign. Level 2, 3 of 10."
	whereAmI: {
		task: "{name}.",
		// nearest ancestor first: "In Backend, in API, in Website redesign."
		ancestors: "{list}.",
		ancestorFirst: "In {name}",
		ancestorNext: "in {name}",
		// position among the siblings that are shown
		position: "Level {level}, {n} of {total}.",
		topLevel: "Top level, {n} of {total}.",
		// Detailed level, for a task with subtasks: "10 subtasks inside."
		inside: "{count} inside."
	},

	// C5, conflicts on demand (Shift+C): each press goes to the next task that is
	// too early; spoken before its row label. {conflict} is the full form (C3).
	conflictList: {
		none: "No conflicts.",
		item: "{n} of {total}. {conflict}"
	},

	// R8 to R11 and D6. Spoken after the row label.
	time: {
		concurrentNone: "No tasks at the same time.",
		// {count} is "1 task", "2 tasks"; {items} are sentences "Name, extent."
		concurrentOne: "{count} at the same time: {item}.",
		concurrentFew: "{count} at the same time. {items}",
		concurrentMany: "{count} at the same time.",
		concurrentWhole: "{count} the whole time: {list}.",
		concurrentPartly: "{count} partly.",
		partlyPage: "Partly, {from} to {to} of {total}: {items}",
		item: "{name}, {extent}",
		itemSentence: "{name}, {extent}.",
		milestoneItem: "milestone {name}, on {date}",
		milestoneItemSentence: "Milestone {name}, on {date}.",
		// Extent of the overlap, relative to the focused task (D6).
		whole: "the whole time",
		first: "first {duration}",
		firstOne: "first {unit}",
		last: "last {duration}",
		lastOne: "last {unit}",
		middle: "{duration} in the middle",
		// R11
		beforeNone: "No tasks end before this starts.",
		before: {
			one: "{count} ends before this starts: {name}, ends {date}.",
			other: "{count} end before this starts. Nearest: {name}, ends {date}."
		},
		afterNone: "No tasks start after this ends.",
		after: {
			one: "{count} starts after this ends: {name}, starts {date}.",
			other: "{count} start after this ends. Nearest: {name}, starts {date}."
		}
	},

	// C1 to C6. Appended to the result of a change, in the same message.
	conflicts: {
		// The task just changed is too early for {other}.
		tooEarlyFor: "Conflict. {amount} too early for {other}.",
		// The change made another task too early.
		otherTooEarly: "Conflict. {other} is now {amount} too early.",
		several: "{count}. Largest: {amount} too early for {other}.",
		severalOther: "{count}. Largest: {other}, {amount} too early.",
		resolved: "Conflict resolved.",
		brief: "Conflict, {other}.",
		// Detailed level: the broken rule in plain words (C3, C4).
		detailed: "Conflict. {amount} too early: {rule}.",
		detailedOther: "Conflict. {other} is now {amount} too early: {rule}.",
		rule: {
			finish_to_start: "must not start before {other} ends",
			start_to_start: "must not start before {other} starts",
			finish_to_finish: "must not end before {other} ends",
			start_to_finish: "must not end before {other} starts"
		},
		ruleLag: {
			finish_to_start: "must start at least {lag} after {other} ends",
			start_to_start: "must start at least {lag} after {other} starts",
			finish_to_finish: "must end at least {lag} after {other} ends",
			start_to_finish: "must end at least {lag} after {other} starts"
		},
		ruleLead: {
			finish_to_start: "may start at most {lag} before {other} ends",
			start_to_start: "may start at most {lag} before {other} starts",
			finish_to_finish: "may end at most {lag} before {other} ends",
			start_to_finish: "may end at most {lag} before {other} starts"
		}
	},

	// E1 to E7 and D9. Spoken instead of the row label after a key press.
	edit: {
		moved: "Starts {start}, ends {end}.",
		movedBrief: "{range}.",
		milestoneMoved: "On {date}.",
		later: "{delta} later.",
		earlier: "{delta} earlier.",
		back: "Back where it started. {range}.",
		duration: "{duration}. Ends {end}.",
		durationBrief: "{duration}.",
		durationAtMinimum: "{duration}, the minimum. Ends {end}.",
		longer: "{delta} longer.",
		shorter: "{delta} shorter.",
		minimum: "Already {duration}, the minimum.",
		readonly: "Read-only. Not changed.",
		readonlyBrief: "Read-only.",
		project: "Not changed. A project takes its dates from its subtasks.",
		milestone: "A milestone has no duration.",
		// The library or the application refused the change (onBeforeTaskUpdate).
		rejected: "Not changed. The change was not accepted."
	},

	// F1 to F10.
	form: {
		saved: "Saved.",
		// New value first, then the old one (D8): "Duration 8 days, was 5."
		change: "{field} {to}, was {from}.",
		ends: "Ends {date}.",
		savedCount: "Saved, {count}: {list}.",
		// Detailed level, before the values: "Saved, 5 changes."
		savedCountOnly: "Saved, {count}.",
		noChanges: "Saved, no changes.",
		cancelled: "Cancelled. Nothing changed.",
		created: "Created {name}.",
		discarded: "New task discarded.",
		deleted: "Deleted {name}.",
		deletedWithSubtasks: "Deleted {name} and {subtasks}.",
		linksRemoved: "{links} removed.",
		// While the form is open (F10): "Duration 6 days. Ends 18 June."
		value: "{field} {value}.",
		percent: "{value} percent",
		noParent: "none"
	},

	// The task row label (R1, D5), when features.rowLabel is on. It is the
	// row's accessible name: the screen reader adds the role and position.
	rowLabel: {
		name: "{name}.",
		parent: "In {name}.",
		// Standard: "13 to 17 June, 5 days."
		span: "{range}, {duration}.",
		// Brief: "13 June, 5 days."
		spanBrief: "{start}, {duration}.",
		// Detailed: "Start 13 June. End 17 June. 5 days."
		spanDetailed: "Start {start}. End {end}. {duration}.",
		progress: "{value} percent done.",
		notScheduled: "Not scheduled.",
		noDuration: "{date}, no duration.",
		milestone: "Milestone, {date}.",
		// {count} is "10 tasks": all tasks inside the project.
		project: "Project, {range}, {count}.",
		// A collapsed project with conflicts among its tasks: "2 conflicts inside."
		conflictsInside: "{count} inside."
	},

	// Creating and removing links from the keyboard (stage 7). Spoken alone,
	// after the focused row label; "this" is the focused task.
	links: {
		// First press of the link key on the task that others will depend on.
		marked: "Link from {name}.",
		// The link type key while a source is marked: "Type: start to start."
		type: "Type: {type}.",
		cancelled: "Link cancelled.",
		// Second press on the task that will depend on the marked one.
		created: "Linked. This depends on {name}.",
		createdTyped: "Linked. This depends on {name}, {type}.",
		notCreated: {
			same: "Link not created. A task cannot depend on itself.",
			exists: "Link not created. This already depends on {name}.",
			loop: "Link not created. It would make a loop: {name} already depends on this.",
			notAllowed: "Link not created. Not allowed here.",
			failed: "Link not created."
		},
		// Removing works on the task reached with the go-to keys; press twice.
		confirmRemovePredecessor: "Press again to remove the link: {name} depends on this.",
		confirmRemoveSuccessor: "Press again to remove the link: this depends on {name}.",
		removedPredecessor: "Link removed. {name} no longer depends on this.",
		removedSuccessor: "Link removed. This no longer depends on {name}.",
		notRemoved: "Link not removed.",
		noContext: "Nothing to remove. First go to a linked task with the go-to keys.",
		// The type key pressed with no task marked; {key} is the link key.
		noSource: "No task marked for a link. Press {key} on a task first."
	},

	// Hints for the link keys; {key} is the spoken key, e.g. "Shift L".
	linkHints: {
		marked: "Go to the task that depends on it and press {key}."
	},

	// Spoken key names, for hints and help: "Shift L", "Alt Shift Left".
	keys: {
		shift: "Shift",
		alt: "Alt",
		ctrl: "Control",
		meta: "Command",
		left: "Left",
		right: "Right",
		up: "Up",
		down: "Down",
		enter: "Enter",
		space: "Space",
		delete: "Delete",
		pageup: "Page Up",
		pagedown: "Page Down",
		home: "Home",
		end: "End",
		esc: "Escape"
	},

	// Spoken help (H1, D13). Action first, key second.
	help: {
		// "Reading, 1 of 4."
		group: "{group}, {n} of {total}.",
		// "Dependencies, Shift D key." The item ends with a word: after a single
		// capital letter and a period ("Shift D. Same time") VoiceOver hears an
		// initial and makes no pause between items.
		item: "{action}, {key} key.",
		// End of the first group, when there are more (H1, P30). The key is not
		// named again: it was just pressed. 5 seconds is the pager's window.
		next: "Press again within 5 seconds for the next group.",
		groups: {
			reading: "Reading",
			orientation: "Orientation",
			moving: "Moving focus",
			changing: "Changing",
			links: "Links",
			other: "Other"
		}
	},

	// M1, M2.
	meta: {
		nothingToRepeat: "Nothing to repeat."
	}
};

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, overrides) {
	const result = { ...base };
	for (const key in overrides) {
		if (isPlainObject(base[key]) && isPlainObject(overrides[key])) {
			result[key] = deepMerge(base[key], overrides[key]);
		} else if (overrides[key] !== undefined) {
			result[key] = overrides[key];
		}
	}
	return result;
}

/**
 * Merges user strings deeply over the defaults.
 * @param {object} [overrides]
 * @returns {typeof defaultStrings}
 */
export function mergeStrings(overrides) {
	return deepMerge(defaultStrings, overrides || {});
}
