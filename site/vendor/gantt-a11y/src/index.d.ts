/**
 * Type declarations for the public API of gantt-a11y.
 * The behaviour of each option is described in README.md, "Options".
 */

/** Command ids, the keys of DEFAULT_KEYS. */
export type CommandId =
	| "dependencies" | "concurrent" | "endsBefore" | "startsAfter"
	| "whereAmI" | "overview"
	| "goToPredecessor" | "goToSuccessor" | "conflictList" | "back"
	| "moveEarlier" | "moveLater" | "longer" | "shorter"
	| "link" | "linkType" | "unlink"
	| "repeat" | "help";

export type LinkType = "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";

export type Verbosity = "brief" | "standard" | "detailed";

/** Plural forms chosen with Intl.PluralRules for the strings' locale. */
export interface PluralForms {
	zero?: string;
	one?: string;
	two?: string;
	few?: string;
	many?: string;
	other: string;
}

/** A text, plural forms, or a group of texts (src/core/strings.js has every key and its notes). */
export type Text = string | PluralForms | TextGroup;
export interface TextGroup {
	[key: string]: Text;
}

/** The spoken texts, by section; see src/core/strings.js. */
export interface Strings {
	/** BCP 47 tag for dates, numbers, lists and the lang of the live region. */
	locale: string;
	common: TextGroup;
	nouns: Record<string, PluralForms>;
	unitNames: TextGroup;
	linkTypes: Record<LinkType, string>;
	fields: TextGroup;
	fieldsInList: TextGroup;
	shortcuts: Record<CommandId, string>;
	hints: TextGroup;
	pages: TextGroup;
	dependencies: TextGroup;
	navigation: TextGroup;
	overview: TextGroup;
	whereAmI: TextGroup;
	conflictList: TextGroup;
	time: TextGroup;
	conflicts: TextGroup;
	edit: TextGroup;
	form: TextGroup;
	rowLabel: TextGroup;
	links: TextGroup;
	linkHints: TextGroup;
	keys: TextGroup;
	help: TextGroup;
	meta: TextGroup;
}

/** A partial set of strings, merged deeply over the English defaults. */
export type StringsOverride = { [K in keyof Strings]?: K extends "locale" ? string : Partial<Strings[K]> };

export type RowLabelField = "name" | "parent" | "dates" | "progress" | "links";

/** Each feature is on unless set to false; rowLabel is off unless set. */
export interface Features {
	dependencies?: boolean;
	/** Shift+O, Shift+B, Shift+A. */
	time?: boolean;
	/** Shift+W where am I, Shift+V overview of the chart. */
	overview?: boolean;
	/** Shift+P, Shift+S and Shift+Z. */
	navigation?: boolean;
	/** Shift+J, Shift+K, Shift+I, Shift+M. */
	edit?: boolean;
	links?: boolean;
	/** Conflict texts after changes, and Shift+C. */
	conflicts?: boolean;
	/** Results of the task form, and its dates while it is open. */
	form?: boolean;
	repeat?: boolean;
	help?: boolean;
	/** "Press Shift H for keys." once per page load, on the first focus on a task; not at Brief. */
	helpHint?: boolean;
	/** Off by default. */
	rowLabel?: boolean | { fields?: RowLabelField[] };
}

export interface Options {
	/** Default "standard". */
	verbosity?: Verbosity;
	/** Dates, numbers, lists; defaults to strings.locale. */
	locale?: string;
	/** A partial set of strings, merged over the English defaults (e.g. gantt-a11y/locales/uk). */
	strings?: StringsOverride;
	/** Command id -> key, e.g. { dependencies: "shift+d" }. A key must have a modifier. */
	shortcuts?: Partial<Record<CommandId, string>>;
	features?: Features;
	/** Default "gantt": the end date as the chart stores it; "lastDay": the last day of work. */
	endDate?: "gantt" | "lastDay";
}

export interface Handle {
	/** Unbinds every key, removes the live region and restores the row label. */
	disable(): void;
	/** Updates the accessible names after the chart changed outside the library's API (frappe: after on_date_change). */
	refresh(): void;
}

export interface Engine {
	/** Unbinds every key, unsubscribes from the form, removes the row label. */
	disable(): void;
}

/** A task as the engine reads it from an adapter (docs/ADAPTERS.md). */
export interface EngineTask {
	id: string | number;
	name: string;
	start: Date;
	end: Date;
	duration: number;
	parent: string | number | null;
	type: "task" | "project" | "milestone";
	readonly: boolean;
	progress?: number;
	[field: string]: unknown;
}

/** A link as the engine reads it from an adapter (docs/ADAPTERS.md). */
export interface EngineLink {
	id: string | number;
	source: string | number;
	target: string | number;
	type: LinkType | null;
	lag: number;
	readonly?: boolean;
}

export type FormEvent =
	| { type: "open"; id: string | number; values: { start: Date; end: Date; duration: number } | null }
	| { type: "values"; values: { start: Date; end: Date; duration: number } | null }
	| { type: "save"; id: string | number; isNew: boolean; before: EngineTask | null; after?: EngineTask | null }
	/** isNew: the task was created and not saved yet (it is removed); returnTo: the row focus goes back to then. */
	| { type: "cancel"; id: string | number; isNew?: boolean; returnTo?: string | number | null }
	| { type: "delete"; id: string | number }
	| { type: "close" };

/** What createEngine needs from a Gantt library; see docs/ADAPTERS.md. */
export interface Adapter {
	getTasks(): EngineTask[];
	getTask(id: string | number): EngineTask | null;
	getLinks(): EngineLink[];
	getChildIds(id: string | number): Array<string | number>;
	getAncestorIds(id: string | number): Array<string | number>;
	getDescendantIds(id: string | number): Array<string | number>;
	isTaskVisible(id: string | number): boolean;
	getDurationUnit(): string;
	getDurationStep(): number;
	durationBetween(start: Date, end: Date): number;
	endDate(start: Date, duration: number, taskId?: string | number): Date;
	addDays(date: Date, days: number): Date;
	typeLabel?(type: string): string;

	updateTask(id: string | number, values: { start: Date; end: Date; duration: number }): void;
	canLink(link: { source: string | number; target: string | number; type: LinkType }): boolean;
	addLink(link: { source: string | number; target: string | number; type: LinkType }): string | number | null;
	removeLink(id: string | number): boolean;

	getFocusedTaskId(): string | number | null;
	/** moved: false when the task cannot get focus (filtered out); the engine then calls cancelOnFocus. */
	focusTask(id: string | number): { moved: boolean };
	announce(text: string, options?: { delay?: number }): void;
	/** text is heard before the row's own label, which always follows it. */
	announceOnFocus(id: string | number, text: string, options?: { refresh?: boolean; fallback?: boolean }): void;
	/** Drops a waiting message for the task's row without speaking it. */
	cancelOnFocus(id: string | number): void;

	keys: {
		isTaken(key: string): boolean;
		add(key: string, handler: () => void): void;
		remove(key: string): void;
	};

	onForm?(listener: (event: FormEvent) => void): () => void;
	formSnapshot?(id: string | number): EngineTask;
	formFields?(): Array<{ key: string; label: string }>;
	columnFields?(): string[];

	setRowLabel?(provider: ((taskId: string | number) => string | null) | null): void;
}

/**
 * Enables the helpers for one dhtmlx-gantt instance. Call after
 * gantt.plugins({ keyboard_navigation: true }). Throws if the plugin is
 * missing or the instance is already enabled.
 */
export function enableGanttA11y(gantt: object, options?: Options): Handle;

/** A frappe-gantt task, as given to `new Gantt(...)`. */
export interface FrappeTask {
	id: string;
	name: string;
	start: string | Date;
	end: string | Date;
	progress?: number;
	dependencies?: string | string[];
	/** Honoured by the keys only; frappe-gantt has no per-task read-only flag. */
	readonly?: boolean;
	[field: string]: unknown;
}

export interface FrappeOptions extends Options {
	/** The task array given to the chart; keyboard edits change it and call gantt.refresh(tasks). */
	tasks: FrappeTask[];
	/** Where the accessible task list (role="listbox") goes. */
	listContainer: HTMLElement;
	/** Accessible name of the list; default strings.common.taskList ("Tasks"). */
	listLabel?: string;
	/** The whole chart is read-only for the keys. */
	readonly?: boolean;
}

/**
 * Experimental. Enables the helpers for one frappe-gantt instance; see
 * README, "frappe-gantt". Throws if the instance is already enabled.
 */
export function enableFrappeGanttA11y(gantt: object, options: FrappeOptions): Handle;

/** The library-independent engine, for another Gantt library. */
export function createEngine(adapter: Adapter, options?: Options): Engine;
