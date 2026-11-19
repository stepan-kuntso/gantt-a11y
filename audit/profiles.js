/**
 * Pages the audit checks (protocol version 2, audit/PROTOCOL.md).
 *
 * selectors: where the chart, a task row, a bar and a link are (there is no
 * standard ARIA role for a bar or a dependency line).
 *
 * commands: documented keyboard commands that make information available
 * (level c of the information checks) and keyboard help.
 *
 * paths: documented keyboard paths for the three edits. Each is either
 *   { steps: [...], sources: [...] }  the keys, and where they are documented, or
 *   { none: "why", sources: [...] }   the documentation describes no keyboard way.
 * A missing entry means the audit has no information ("could not determine").
 *
 * Step types: "Key+Combo" (a key press), { tabTo: { selector | label } } (Tab
 * until focus is on a matching element), { cellTo: "header text" } (arrow
 * keys along the row until the focused cell is under that column header),
 * { typeDate: days } and { typeNumber: delta } (select the focused input's
 * value and type it changed), { typeOption: n } (in a focused list box, type
 * the text of the option n places further, as typing selects an option). Typing into a focused text field is ordinary
 * keyboard use, not a shortcut, so it needs no source of its own.
 */

const SOURCES = {
	extension: "gantt-a11y README.md, section Keys (this repository)",
	dhtmlx: "https://docs.dhtmlx.com/gantt/guides/keyboard-navigation/",
	frappe: "frappe-gantt 1.2.2: README and source in node_modules/frappe-gantt (no keyboard handling, no keydown listener)",
	bryntumGrid: "https://bryntum.com/docs/api/Grid/view/Grid (section Keyboard shortcuts)",
	bryntumCellEdit: "https://bryntum.com/docs/api/Grid/feature/CellEdit (section Keyboard shortcuts)",
	bryntumGantt: "https://bryntum.com/docs/api/Gantt/view/Gantt (section Keyboard shortcuts)",
	bryntumTaskEdit: "https://bryntum.com/docs/api/Gantt/feature/TaskEdit",
	syncfusion: "https://help.syncfusion.com/gantt-sdk/javascript/gantt-chart/accessibility (section Keyboard navigation)",
	syncfusionElements: "https://help.syncfusion.com/gantt-sdk/typescript/gantt-chart/key-elements",
	kendo: "https://demos.telerik.com/kendo-ui/gantt/keyboard-navigation (shortcut list on the page)",
	kendoNavigatable: "https://www.telerik.com/kendo-jquery-ui/documentation/api/ui/gantt/configuration/navigatable"
};

// Keys each library documents (keyboard_navigation, inline editors, form), for
// the check that the extension's keys do not overlap them. Same sources as above.
const LIBRARY_KEYS = {
	dhtmlx: ["tab", "alt+up", "alt+down", "alt+left", "alt+right", "ctrl+enter", "ctrl+z", "ctrl+r", "left", "right", "home", "end",
		"down", "up", "space", "enter", "pageup", "pagedown", "delete", "ctrl+left", "ctrl+right", "shift+left", "shift+right",
		"shift+down", "shift+up", "escape", "shift+tab"],
	frappe: [],
	bryntum: ["up", "right", "down", "left", "shift+up", "shift+right", "shift+down", "shift+left", "space", "ctrl+home", "home",
		"ctrl+end", "end", "pageup", "pagedown", "enter", "escape", "f2", "shift+enter", "ctrl+enter", "tab", "shift+tab",
		"alt+shift+right", "alt+shift+left"],
	syncfusion: ["alt+j", "tab", "shift+tab", "home", "end", "down", "up", "left", "right", "ctrl+up", "ctrl+down", "ctrl+shift+up",
		"ctrl+shift+down", "enter", "escape", "insert", "ctrl+insert", "ctrl+f2", "delete", "shift+f5", "ctrl+shift+f", "ctrl+z", "ctrl+y",
		"shift+down", "shift+up", "shift+left", "shift+right"],
	kendo: ["alt+w", "f10", "space", "right", "left", "delete", "up", "down", "home", "end", "enter", "alt+right", "alt+left", "escape", "1", "2", "3"]
};

const DHTMLX = {
	library: "dhtmlx-gantt",
	libraryKeys: { keys: LIBRARY_KEYS.dhtmlx, sources: [SOURCES.dhtmlx, "https://docs.dhtmlx.com/gantt/guides/inline-editing/"] },
	selectors: {
		chart: ".gantt_container",
		taskRow: '.gantt_grid_data [role="row"][data-task-id]',
		bar: ".gantt_task_line",
		link: ".gantt_task_link"
	},
	version: "window.gantt && window.gantt.version"
};

const FRAPPE = {
	library: "frappe-gantt",
	libraryKeys: { keys: LIBRARY_KEYS.frappe, sources: [SOURCES.frappe] },
	selectors: {
		chart: "#chart, .gantt-container",
		taskRow: '[role="option"][data-task-id]',
		bar: ".bar-wrapper",
		link: ".arrow path"
	},
	version: "null"
};

const down = (n) => Array(n).fill("ArrowDown");

const EXTENSION_COMMANDS = { dependencies: "Shift+D", whereAmI: "Shift+W", help: "Shift+H", sources: [SOURCES.extension] };
const extensionPaths = (linkDown) => ({
	date: { steps: ["Shift+K"], sources: [SOURCES.extension] },
	duration: { steps: ["Shift+I"], sources: [SOURCES.extension] },
	// mark the focused task, move down to a task not linked to it yet, link it
	link: { steps: ["Shift+L", ...down(linkDown), "Shift+L"], sources: [SOURCES.extension] }
});

// dhtmlx-gantt without the extension: Enter opens the task form; in the form,
// keys work as in an ordinary form, Space or Enter presses the focused button.
const SAVE_BUTTON = '[role="button"][aria-label="Save"], .gantt_save_btn_set';
const DHTMLX_PATHS = {
	date: { steps: ["Enter", { tabTo: { selector: ".gantt_cal_light .gantt_time_selects select, .gantt_cal_light .gantt_section_time select" } }, { typeOption: 1 }, { tabTo: { selector: SAVE_BUTTON } }, "Enter"], sources: [SOURCES.dhtmlx] },
	duration: { steps: ["Enter", { tabTo: { selector: ".gantt_duration_inc" } }, "Space", { tabTo: { selector: SAVE_BUTTON } }, "Enter"], sources: [SOURCES.dhtmlx] },
	link: { none: "The documented shortcuts for task rows, task cells and the form do not include creating a link (links are created by dragging).", sources: [SOURCES.dhtmlx] }
};

export const profiles = [
	{
		id: "demo-dhtmlx-extension", name: "dhtmlx-gantt demo with gantt-a11y", local: true, extension: true,
		url: "/demo/index.html", ...DHTMLX, commands: EXTENSION_COMMANDS, paths: extensionPaths(5),
		// the first row is a project: move to a plain task with links before the rest
		editFrom: 2
	},
	{
		id: "demo-dhtmlx-plain", name: "dhtmlx-gantt demo without the extension", local: true, extension: false,
		url: "/demo/index.html?a11y=off", ...DHTMLX, commands: { sources: [SOURCES.dhtmlx] }, paths: DHTMLX_PATHS,
		editFrom: 2
	},
	{
		id: "demo-frappe-extension", name: "frappe-gantt demo with gantt-a11y", local: true, extension: true,
		url: "/demo/frappe.html", ...FRAPPE, commands: EXTENSION_COMMANDS, paths: extensionPaths(3), editFrom: 5
	},
	{
		id: "demo-frappe-plain", name: "frappe-gantt demo without the extension", local: true, extension: false,
		url: "/demo/frappe.html?a11y=off", ...FRAPPE,
		// without the extension there is no task list: the bars are the only per-task elements
		selectors: { ...FRAPPE.selectors, taskRow: ".bar-wrapper" },
		commands: { sources: [SOURCES.frappe] },
		paths: {
			date: { none: "frappe-gantt has no keyboard handling.", sources: [SOURCES.frappe] },
			duration: { none: "frappe-gantt has no keyboard handling.", sources: [SOURCES.frappe] },
			link: { none: "frappe-gantt has no keyboard handling.", sources: [SOURCES.frappe] }
		},
		editFrom: 5
	},
	{
		id: "public-dhtmlx", name: "dhtmlx-gantt public sample: keyboard navigation", local: false, extension: false,
		url: "https://docs.dhtmlx.com/gantt/samples/02_extensions/16_keyboard_navigation.html", ...DHTMLX,
		commands: { sources: [SOURCES.dhtmlx] }, paths: DHTMLX_PATHS, editFrom: 2
	},
	{
		id: "public-bryntum", name: "Bryntum Gantt public demo: basic", local: false, extension: false,
		url: "https://bryntum.com/products/gantt/examples/basic/", library: "Bryntum Gantt",
		libraryKeys: { keys: LIBRARY_KEYS.bryntum, sources: [SOURCES.bryntumGrid, SOURCES.bryntumCellEdit, SOURCES.bryntumGantt] },
		selectors: { chart: ".b-gantt", taskRow: '[role="row"].b-grid-row[data-id]', bar: ".b-gantt-task", link: ".b-sch-dependency" },
		version: "window.bryntum && window.bryntum.getVersion ? window.bryntum.getVersion('gantt') : null",
		commands: { sources: [SOURCES.bryntumGrid, SOURCES.bryntumGantt] },
		paths: {
			// arrows move between cells; Enter or F2 starts editing; F2 finishes; Escape cancels
			date: { steps: [{ cellTo: "start" }, "F2", { typeDate: 1 }, "F2"], sources: [SOURCES.bryntumGrid, SOURCES.bryntumCellEdit] },
			duration: { steps: [{ cellTo: "duration" }, "F2", { typeNumber: 1 }, "F2"], sources: [SOURCES.bryntumGrid, SOURCES.bryntumCellEdit] },
			link: { none: "The Grid, CellEdit, Gantt and TaskEdit documentation pages read for this audit describe no keyboard way to create a dependency.", sources: [SOURCES.bryntumGrid, SOURCES.bryntumCellEdit, SOURCES.bryntumGantt, SOURCES.bryntumTaskEdit] }
		},
		editFrom: 2
	},
	{
		id: "public-syncfusion", name: "Syncfusion Gantt public demo: default functionalities", local: false, extension: false,
		url: "https://ej2.syncfusion.com/demos/#/tailwind3/gantt/default.html", library: "Syncfusion Essential JS 2 Gantt",
		libraryKeys: { keys: LIBRARY_KEYS.syncfusion, sources: [SOURCES.syncfusion] },
		selectors: { chart: ".e-gantt", taskRow: '.e-gantt [role="row"].e-row', bar: ".e-taskbar-main-container", link: ".e-connector-line-container" },
		version: "null",
		commands: { sources: [SOURCES.syncfusion] },
		paths: {
			// arrows move the row selection; Ctrl+F2 opens the edit dialog; Tab moves between its fields; Enter saves
			date: { steps: ["Control+F2", { tabTo: { label: "start date" } }, { typeDate: 1 }, "Enter"], sources: [SOURCES.syncfusion] },
			duration: { steps: ["Control+F2", { tabTo: { label: "duration" } }, { typeNumber: 1 }, "Enter"], sources: [SOURCES.syncfusion] },
			link: { none: "The keyboard table has no key for dependencies; the dependency tab and connector points are described without keyboard instructions.", sources: [SOURCES.syncfusion, SOURCES.syncfusionElements] }
		},
		editFrom: 2
	},
	{
		id: "public-kendo", name: "Kendo UI for jQuery Gantt public demo", local: false, extension: false,
		url: "https://demos.telerik.com/kendo-ui/gantt/index", library: "Kendo UI for jQuery Gantt",
		libraryKeys: { keys: LIBRARY_KEYS.kendo, sources: [SOURCES.kendo] },
		selectors: { chart: ".k-gantt", taskRow: '.k-gantt [role="treegrid"] tbody [role="row"]', bar: ".k-task", link: '.k-gantt-dependencies [class*="line"], [class*="k-task-dependency"]' },
		version: "window.kendo && window.kendo.version",
		commands: { sources: [SOURCES.kendo] },
		paths: {
			date: { none: "Enter opens the cell editor (list) or the edit popup (timeline), but the documented list gives no key to save the change.", sources: [SOURCES.kendo, SOURCES.kendoNavigatable] },
			duration: { none: "As for dates: no documented key saves an edit.", sources: [SOURCES.kendo] },
			link: { none: "The documented list has no key for creating a dependency (Delete removes one).", sources: [SOURCES.kendo] }
		},
		editFrom: 2
	},

	// Local pages for testing the audit itself (npm run audit -- --fixtures).
	// They imitate cell editing and an edit dialog; they are not results.
	{
		id: "fixture-cell-edit", name: "Fixture: grid with cell editing", local: true, fixture: true, extension: false,
		url: "/audit/fixtures/cell-edit.html", library: "fixture",
		selectors: { chart: "#chart", taskRow: '[role="row"][data-id]', bar: ".bar", link: ".link" },
		version: "null", commands: { sources: ["fixture"] },
		paths: {
			date: { steps: [{ cellTo: "start" }, "F2", { typeDate: 1 }, "F2"], sources: ["fixture"] },
			duration: { steps: [{ cellTo: "duration" }, "F2", { typeNumber: 1 }, "F2"], sources: ["fixture"] },
			link: { none: "fixture", sources: ["fixture"] }
		},
		editFrom: 1
	},
	{
		id: "fixture-dialog", name: "Fixture: grid with an edit dialog", local: true, fixture: true, extension: false,
		url: "/audit/fixtures/dialog.html", library: "fixture",
		selectors: { chart: "#chart", taskRow: '[role="row"][data-id]', bar: ".bar", link: ".link" },
		version: "null", commands: { sources: ["fixture"] },
		paths: {
			date: { steps: ["Control+F2", { tabTo: { label: "start date" } }, { typeDate: 1 }, "Enter"], sources: ["fixture"] },
			duration: { steps: ["Control+F2", { tabTo: { label: "duration" } }, { typeNumber: 1 }, "Enter"], sources: ["fixture"] }
		},
		editFrom: 1
	}
];
