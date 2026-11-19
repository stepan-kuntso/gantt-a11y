# gantt-a11y

A Gantt chart shows which task waits for which, what overlaps and what a change broke, but a screen reader gets only a grid of names and dates, without the relations between tasks.

- Ask about the focused task: what it depends on, what runs at the same time, where it is in the plan.
- Move along links from task to task, and from one conflict to the next.
- Move tasks, change durations and link tasks from the keyboard, and hear the result first, including any link it broke.
- Hear what the task form did: saved, cancelled, created, deleted.

**Try it in two minutes:** open the live demo for [dhtmlx-gantt](https://stepan-kuntso.github.io/gantt-a11y/site/demo-dhtmlx.html) or [frappe-gantt](https://stepan-kuntso.github.io/gantt-a11y/site/demo-frappe.html) on the [project site](https://stepan-kuntso.github.io/gantt-a11y/site/), press Tab to enter the chart and Shift+D on a task. Locally, [examples/minimal.html](examples/minimal.html) is a complete page: run `npm install` and `npm run demo`, then open `http://localhost:8080/examples/minimal.html`.

**Status:** experimental, version 0.1.0, for [DHTMLX Gantt](https://github.com/DHTMLX/gantt) Community Edition 10.0.3 (MIT), with an experimental adapter for frappe-gantt. Tested by the author, a sighted developer, with VoiceOver in Safari 26.2 on macOS Tahoe 26.2: all 103 manual steps matched on 2026-11-19. Not yet tested with NVDA or JAWS, or by people who use a screen reader every day: see [Feedback wanted](#feedback-wanted).

## Features

With keyboard navigation in the grid, a screen reader user can:

- **hear dependencies** of the focused task by name, with link types only when they are not finish to start, and page through long lists;
- **move along links** to what a task depends on and what depends on it;
- **ask about time**: which tasks run at the same time and how much they overlap, which end before it starts, which start after it ends;
- **change dates from the keyboard**: move a task by a day, make it longer or shorter, and hear the result first, as a running total when keys are pressed quickly;
- **hear conflicts** when a change breaks a link: "Conflict. 2 days too early for Implementation.", and "Conflict resolved." when it is fixed;
- **create and remove links** from the keyboard;
- **hear the task form**: values while editing ("Duration 6 days. Ends 19 June."), and the result after saving, cancelling, creating or deleting;
- **hear a richer row label** (optional): "Testing. 13 to 18 June, 5 days. 40 percent done.";
- **find their way**: a summary of the chart (number of tasks, period, conflicts, tasks without dates), where the focused task is (its parents, level and position), every link conflict one after another with focus on the task, and the way back to where a series of jumps started;
- **repeat** the last announcement and **hear the list of keys**.

## Keys

All keys are registered through the public `gantt.addShortcut` on task rows and cells, have a modifier, and can be changed in `options.shortcuts`. A key that is already bound with `gantt.addShortcut` is refused, never overwritten. Keys the page handles with its own `keydown` listeners are not detected: if your application uses Shift with a letter itself, move our keys with `options.shortcuts`.

| Key | Command id | What it does |
|---|---|---|
| <kbd>Shift</kbd>+<kbd>D</kbd> | `dependencies` | Dependencies of the focused task; again within 5 s for the next page |
| <kbd>Shift</kbd>+<kbd>O</kbd> | `concurrent` | Tasks at the same time, with how much they overlap; again for more |
| <kbd>Shift</kbd>+<kbd>B</kbd> | `endsBefore` | Tasks that end before it starts, nearest first; again for more |
| <kbd>Shift</kbd>+<kbd>A</kbd> | `startsAfter` | Tasks that start after it ends, nearest first; again for more |
| <kbd>Shift</kbd>+<kbd>W</kbd> | `whereAmI` | Where am I: the task, its parents nearest first, level and position among its siblings |
| <kbd>Shift</kbd>+<kbd>V</kbd> | `overview` | Overview of the chart: tasks, period, conflicts, tasks without dates (more at the Detailed level) |
| <kbd>Shift</kbd>+<kbd>P</kbd> | `goToPredecessor` | Go to what this task depends on; again for the next one |
| <kbd>Shift</kbd>+<kbd>S</kbd> | `goToSuccessor` | Go to what depends on this task; again for the next one |
| <kbd>Shift</kbd>+<kbd>C</kbd> | `conflictList` | Go to the next task with a link conflict, largest first, with the conflict in full; again within 5 s for the next |
| <kbd>Shift</kbd>+<kbd>Z</kbd> | `back` | Back to the task where the last series of jumps (Shift+P, Shift+S, Shift+C) started |
| <kbd>Shift</kbd>+<kbd>J</kbd> | `moveEarlier` | Move one calendar day earlier |
| <kbd>Shift</kbd>+<kbd>K</kbd> | `moveLater` | Move one calendar day later |
| <kbd>Shift</kbd>+<kbd>I</kbd> | `longer` | Longer by `gantt.config.duration_step` |
| <kbd>Shift</kbd>+<kbd>M</kbd> | `shorter` | Shorter by `gantt.config.duration_step` |
| <kbd>Shift</kbd>+<kbd>L</kbd> | `link` | On one task: mark it. On another: make that one depend on it. On the marked task again: cancel |
| <kbd>Shift</kbd>+<kbd>T</kbd> | `linkType` | While a task is marked: next link type |
| <kbd>Shift</kbd>+<kbd>U</kbd> | `unlink` | After a jump with Shift+P or Shift+S: remove the link used; press twice |
| <kbd>Shift</kbd>+<kbd>R</kbd> | `repeat` | Repeat the last announcement |
| <kbd>Shift</kbd>+<kbd>H</kbd> | `help` | Spoken list of the keys in groups; again for the next group |

The four editing keys form a small cross on a QWERTY keyboard: J and K side by side for earlier and later, I above for longer, M below for shorter. [docs/KEYS.md](docs/KEYS.md) has the keys of other tools, with sources, the keys used before, and the reasons and compromises of this choice.

Why Shift and a letter: Gantt's own keys use arrows, Page Up/Down, Space, Enter, Delete and Shift/Ctrl/Alt with arrows, so letters are free; every modifier with an arrow already means something in some browser, operating system, screen reader or Gantt component (docs/KEYS.md). A plain letter is not safe: with `keyboard_navigation_cells` on, a letter on an editable cell starts inline editing; a Shift+letter with a registered `taskCell` shortcut does not. Alt+letter and Ctrl+letter collide with browser shortcuts on Windows. VoiceOver commands use Control+Option; NVDA and JAWS use single letters only in browse mode, where Gantt's arrow keys do not work either.

## Requirements

- `dhtmlx-gantt` 10.0.3 or a later 10.x (tested with 10.0.3 only).
- The `keyboard_navigation` plugin enabled.
- A browser with ES modules and `Intl` (PluralRules, ListFormat, DateTimeFormat).

## Usage

There is no npm package yet: copy or clone this repository and import `src/index.js` by its path. The public API is `enableGanttA11y`, `enableFrappeGanttA11y` (experimental), `createEngine` and the TypeScript types (`src/index.d.ts`); the Ukrainian strings are in `src/locales/uk.js`.

```js
import { enableGanttA11y } from "./gantt-a11y/src/index.js";

gantt.plugins({ keyboard_navigation: true });
gantt.init("gantt_here");
gantt.parse(data);

const a11y = enableGanttA11y(gantt);

// later: removes the keys, event handlers, templates it replaced and the live region
a11y.disable();
```

Call `enableGanttA11y` after `gantt.plugins({ keyboard_navigation: true })`. Each gantt instance needs its own call. It throws if the plugin is not enabled, if the extension is already enabled for this instance, or if a key is already used or has no modifier. The returned handle has `disable()` and `refresh()` (re-renders the row labels; changes made through the gantt API need no call).

### A complete page, without a build step

[examples/minimal.html](examples/minimal.html), the whole file (a browser test checks that it works as written):

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>gantt-a11y: minimal example</title>
	<link rel="stylesheet" href="../node_modules/dhtmlx-gantt/codebase/dhtmlxgantt.css">
	<script src="../node_modules/dhtmlx-gantt/codebase/dhtmlxgantt.js"></script>
</head>
<body>
	<h1>Project plan</h1>
	<div id="gantt_here" style="width:100%;height:300px;"></div>
	<script type="module">
		import { enableGanttA11y } from "../src/index.js";

		gantt.plugins({ keyboard_navigation: true });
		gantt.config.date_format = "%Y-%m-%d";
		gantt.init("gantt_here");
		gantt.parse({
			data: [
				{ id: 1, text: "Design", start_date: "2026-06-01", duration: 4 },
				{ id: 2, text: "Build", start_date: "2026-06-05", duration: 8 },
				{ id: 3, text: "Test", start_date: "2026-06-13", duration: 5 }
			],
			links: [
				{ id: 1, source: 1, target: 2, type: "0" },
				{ id: 2, source: 2, target: 3, type: "0" }
			]
		});

		enableGanttA11y(gantt, { features: { rowLabel: true } });
	</script>
</body>
</html>
```

ES modules do not load from `file://`, so serve the folder: in this repository, `npm install`, then `npm run demo`, and open `http://localhost:8080/examples/minimal.html`. In your own project, change the two `node_modules` paths and `../src/index.js` to where dhtmlx-gantt and gantt-a11y's `src/` are.

**Check that it works, with VoiceOver on a Mac:**

1. Open the page in Safari. Turn VoiceOver on with <kbd>Command</kbd>+<kbd>F5</kbd>.
2. Press <kbd>Tab</kbd> until focus is in the chart. VoiceOver reads the first row: "Design. 1 to 5 June, 4 days. 0 percent done.", then the table information VoiceOver adds itself.
3. Press <kbd>Down Arrow</kbd> to "Build". If the arrow moves the VoiceOver cursor instead, turn Quick Nav off: <kbd>Left Arrow</kbd> and <kbd>Right Arrow</kbd> together.
4. Press <kbd>Shift</kbd>+<kbd>D</kbd>. After the row you hear "Depends on: Design. Required by: Test." If you hear nothing, see that the browser's console shows no error and that focus is on a task row, not on the page.
5. Press <kbd>Shift</kbd>+<kbd>P</kbd>: focus moves to "Design", and you hear "Build depends on this." before the row. <kbd>Shift</kbd>+<kbd>H</kbd> lists the keys.

[TESTING.md](TESTING.md) has every check with the exact texts.

### Options

```js
enableGanttA11y(gantt, {
	verbosity: "standard",      // "brief" | "standard" | "detailed" (spec section 5)
	locale: "en-GB",            // dates, numbers, lists; defaults to strings.locale
	strings: {                  // partial, deep-merged override, see src/core/strings.js
		form: { deleted: "Deleted {name}." }
	},
	shortcuts: { dependencies: "shift+d" },   // command id -> key (see Keys)
	features: {                 // false turns a feature off
		dependencies: true,
		time: true,             // Shift+O, Shift+B, Shift+A
		overview: true,         // Shift+W, Shift+V
		navigation: true,       // Shift+P, Shift+S, Shift+Z
		edit: true,             // Shift+J, Shift+K, Shift+I, Shift+M
		links: true,
		conflicts: true,        // conflict texts and Shift+C
		form: true,             // results of the task form, its dates while open
		repeat: true,
		help: true,
		rowLabel: false         // off by default; true or { fields: ["name", "dates", "progress"] }
	},
	endDate: "gantt"            // "gantt" | "lastDay", see "Deviations from the specification"
});
```

The verbosity level also decides how many names are read before "press again" (3, 5 at Detailed), whether the year is always said (Detailed) and whether weekdays are said in edit results (not at Brief).

**Row label** (`features.rowLabel`). Off by default, because the library builds each row's accessible name from `gantt.templates.tooltip_text`, which the tooltip plugin also shows to sighted users: with the plugin on, they would see the longer label in tooltips. When on, the template is replaced for as long as the extension is enabled. Fields, in the order given: `"name"`, `"parent"` (added by default at the Detailed level), `"dates"` (span and duration, or the special forms for milestones, projects and unscheduled tasks), `"progress"`, `"links"` (dependency counts, off by default). The level of nesting is not spoken: the library's `aria-level` carries it.

**Translating.** All texts live in `src/core/strings.js`, with translator notes. Templates are whole sentences with named placeholders; counted nouns use `Intl.PluralRules` categories, so a translation can add `few` and `many`. Set `strings.locale` to the translation's language. `src/locales/uk.js` is a complete Ukrainian example (`enableGanttA11y(gantt, { strings: uk })`), with notes on how it avoids declining task names; it is not yet checked with a screen reader.

## Deviations from the specification

- **End dates.** By default the extension speaks the end date that Gantt itself stores and shows in its task form (the day after the last day of work, because Gantt's end dates are non-inclusive). The specification (P16) asks for the last day of work instead. The deviation is deliberate: a screen reader user and a sighted colleague looking at the same task should name the same date. `endDate: "lastDay"` follows the specification. Either way the date is pronounced through `Intl` (day and full month, year only when it differs).

The other decisions where the specification is open are listed in its "Implementation notes".

## frappe-gantt (experimental)

**Experimental: not the same as the dhtmlx-gantt support.** It brings its own task list, is covered by the browser tests, and has been tried with a screen reader much less.

The same engine runs on [frappe-gantt](https://github.com/frappe/gantt) 1.2.2 (MIT) through `src/adapters/frappe/`; see `demo/frappe.html`. frappe-gantt has no keyboard navigation and no ARIA of its own, so the adapter adds a task list next to the chart: a `role="listbox"` with one `role="option"` per task, one Tab stop, Up/Down/Home/End. The commands act on the focused option.

```js
import Gantt from "frappe-gantt";
import { enableFrappeGanttA11y } from "./gantt-a11y/src/index.js";

const gantt = new Gantt("#chart", tasks, { on_date_change: () => a11y.refresh() });
const a11y = enableFrappeGanttA11y(gantt, {
	tasks,                                              // the array given to the chart
	listContainer: document.getElementById("tasks"),    // where the task list goes
	endDate: "lastDay",
	features: { rowLabel: true }
	// listLabel: the list's name (default strings.common.taskList); readonly: true
});
```

| Works | Does not, and why |
|---|---|
| Row label, dependencies with pages, same time / ends before / starts after, jumps, keyboard moves and duration changes with bursts and conflicts, linking (finish to start), unlinking after a jump, repeat, help, read-only refusal, `disable()` | **Task form results**: frappe-gantt has no task form. **Projects, collapsed rows, "inside" in time answers**: no hierarchy. **Milestones**: no task types. **Link types other than finish to start, lag**: frappe-gantt dependencies have neither; other types are refused with "Link not created. Not allowed here." **Per-task read-only with the mouse**: frappe-gantt has only chart-wide `readonly` / `readonly_dates`; the adapter honours a task's own `readonly: true` field for keys only. |

frappe-gantt end dates are the last day of work, so use `endDate: "lastDay"`. After a mouse drag, call `refresh()` (from `on_date_change` / `on_progress_change`) so the task list follows the chart.

## How it works

- Only the public, typed API of dhtmlx-gantt 10.0.3 is used.
- Answers go to a visually hidden `aria-live="polite"` region, one per chart, so they are heard after what the screen reader is reading.
- When a command moves focus to another row (jumps, the next conflict, back, closing the task form), the result is put in front of that row's label for a moment, so it is heard first; it goes when focus leaves the row, at the latest after 5 seconds. With the tooltip plugin or in cell navigation mode the live region is used instead.
- Keyboard edits keep focus on the row; their results go to the live region, 500 ms after the row is re-rendered.
- What is announced is what was stored: after each change the data is read again, and a change the application refused is said to be refused.
- An engine in `src/core/` (texts, rules, no DOM, no library) and adapters in `src/adapters/` that read the chart, bind keys and speak; [docs/ADAPTERS.md](docs/ADAPTERS.md) describes an adapter for another library.

[docs/DESIGN.md](docs/DESIGN.md) has the details, with the dates and the VoiceOver findings behind them.

## Limitations

- **Calendar days.** Keyboard moves are in calendar days: working-time calendars are not part of the Community Edition.
- **Loops are checked by the extension.** This edition has no public loop check for links (`isCircularLink` is a Pro method), so the extension checks the existing links itself before creating one. `gantt.isLinkAllowed` and `onBeforeLinkAdd` are still respected.
- **Removing a link** works only on the link used by the last jump with Shift+P or Shift+S, and needs a second press, because there is no undo in this edition.
- **The row label carries a result for a moment.** While a result is in the row label (at most 5 seconds), re-reading the row gives the result followed by the task's own label.
- **The screen reader's own words** follow every row label: VoiceOver adds the role and the table size ("row, tree grid, 6 columns, 12 rows"). They come from the roles the library sets and from the screen reader's verbosity settings; this extension does not change them.
- **Cell navigation mode** (`keyboard_navigation_cells`): every result, jumps and the task form included, goes through the live region after the cell is read. Column templates are not changed. Set the mode before `gantt.init`; changing it later did not change inline editor key handling in our test.
- **The first key press after a mouse click on a freshly loaded page** does not reach Gantt's keyboard navigation (Gantt's own arrow keys included). Entering the chart with Tab works.
- **Not all HTML entities in task names are decoded**: numeric references and `&amp; &lt; &gt; &quot; &apos; &nbsp;` are.
- **Not implemented from the specification**: the help and list dialogs, most of the settings in its section 7, and ARIA attributes on the library's rows (they would require changing the library's DOM). See its "Implementation notes".

## Tested with

Manually, by the author, step by step while the features were built, and in one full pass of [TESTING.md](TESTING.md):

- dhtmlx-gantt 10.0.3 (and frappe-gantt 1.2.2 for the steps of its demo)
- Safari 26.2 with VoiceOver, macOS Tahoe 26.2

**Full pass, 2026-11-19:** all 103 steps of TESTING.md matched, with the helper page, including the steps for cell navigation mode and the Brief and Detailed levels. The report: [docs/manual-test-2026-11-19.md](docs/manual-test-2026-11-19.md). Its limits:

- It was done by a sighted developer, the author, not by people who use a screen reader every day.
- "Matched" means the spoken text matched the expected text; how clear each step was by ear was not rated.
- VoiceOver in Safari on macOS only.

**Not yet tested** with NVDA or JAWS, on Windows, with keyboard layouts other than English, with braille displays, or by people who use a screen reader every day.

## Feedback wanted

This project has been checked by its author, a sighted developer, with VoiceOver on a Mac. The most valuable feedback comes from:

- **people who use a screen reader every day**, with any screen reader: whether the answers are useful, too long, in the wrong order, or missing something you need;
- **anyone who has tried it with NVDA or JAWS** on Windows: nothing has been tested there yet.

Open an issue in this repository with the **Screen reader feedback** template: which screen reader and version, browser, operating system, what you pressed, what you heard, and what you expected. A short note is welcome too.

## Specification and manual test

Every spoken text is designed after [docs/ANNOUNCEMENTS.md](docs/ANNOUNCEMENTS.md), a specification of what the extension says, in what order and how long it may take, with its sources. Where the implementation decides something the specification leaves open, or departs from it, this is recorded in its last section, "Implementation notes". [docs/listen.html](docs/listen.html) plays the texts and their alternatives through a live region so they can be compared by ear. [TESTING.md](TESTING.md) is a step-by-step manual test with the exact texts to expect.

## Development

```bash
npm install
npm test                          # unit tests of the texts (node:test)
npx playwright install chromium webkit
npm run test:browser              # browser tests in Chromium and WebKit (Playwright)
npm run demo                      # serves the folder at http://localhost:8080 without caching, open /demo/index.html or /demo/frappe.html
```

**What the browser tests check, and what they do not.** They open the demo pages (dhtmlx-gantt and frappe-gantt) in Chromium and WebKit, press the keys, and check the DOM: the text in the live region, which element has focus and its `aria-label`, the gantt data, and that `disable()` removes everything. **They do not check what a screen reader speaks**, or in which order: that depends on the screen reader and is checked by hand with [TESTING.md](TESTING.md).

Known library behaviour seen by the tests: when the task form opens from the keyboard, the library does not always move focus into it (measured with this extension turned off too). The form tests then move focus into the form, as a user would, and record it as an annotation.

`npm run demo` uses Node only and sends `Cache-Control: no-store`, so a reload always runs the current code (with a plain static server Safari kept old JavaScript modules after a reload). The browser tests start their own server with `python3`.

## What is in this repository

**The library** is `src/`. Only it, with `docs/ADAPTERS.md`, `docs/ANNOUNCEMENTS.md`, the README, the changelog and the license, goes into the package (`files` in `package.json`; `npm pack --dry-run` lists them). `examples/minimal.html` and the two demos (`demo/index.html`, `demo/frappe.html`) show it in use.

**Research and testing materials** stay in the repository and are **not part of the library or the package**. They exist to find out whether the extension helps, and to check it by hand:

| Where | What |
|---|---|
| `TESTING.md`, `demo/manual-test.html`, `demo/manual-steps.js`, `demo/manual-steps-status.js` | The manual test with a screen reader and its helper page |
| `docs/accessibility-tree-log.md` | What the browser exposes at each manual step (generated) |
| `docs/listen.html` | The specification's texts and alternatives, to compare by ear |
| `docs/KEYS.md` | Keys of other tools, with sources, and why these keys were chosen |
| `docs/study/`, `demo/study.html` | A user study kit |
| `audit/` | An automated audit of public Gantt demos (keyboard and accessibility tree) |
| `site/`, `scripts/site/`, `docs/site-check.md` | A static site about the project, generated |

**Demo site.** `site/` is a static site (no build needed to serve it, no requests to other servers): what the project is and is not, both demos with a switch and the keys, how to try it with VoiceOver, NVDA and JAWS, the announcement specification, and the latest audit. `npm run site` regenerates it from `scripts/site/` and the documents, and runs an automated accessibility check of the pages (results in `docs/site-check.md` and on the site's "About" page). It can be published with GitHub Pages from the repository root (the site is then under `/site/`); it is not published.

**User study.** [docs/study/](docs/study/) has twelve tasks for participants who use a screen reader ([tasks.md](docs/study/tasks.md)), what the same tasks need without the extension ([baseline.md](docs/study/baseline.md)), and a guide for the person running the session ([facilitator.md](docs/study/facilitator.md)). `demo/study.html` is the chart for it, with a switch for the extension; it collects nothing and loads nothing from the network.

**Accessibility tree log.** `npm run test:a11y-tree` runs every step of [TESTING.md](TESTING.md) (as data in `demo/manual-steps.js`) and writes [docs/accessibility-tree-log.md](docs/accessibility-tree-log.md): for each step, the role and accessible name of the focused element, `aria-level` / `aria-expanded` / `aria-selected`, the live region, and the order of focus changes and live region updates, compared with the expected text. In Chromium these come from the browser's own accessibility tree; in WebKit Playwright computes them from the DOM. **This is what the screen reader receives, not what it speaks.**

**Manual check with a screen reader.** `npm run demo`, then open `http://localhost:8080/demo/manual-test.html` in Safari. The page walks through the same steps (103 now): first those the accessibility tree tests could not settle, then announcements not yet heard with a screen reader; it loads the chart in each step's state with focus on the right task, shows what to press and the exact expected text in large type, and collects your answers (matched / did not match / skipped, what you heard, and whether it was clear by ear) into a Markdown report you copy by hand. F6 moves between the chart and the answer buttons. Nothing is sent anywhere; progress is kept in the browser's localStorage. The helper itself has no live region, so it does not talk over the extension.

## License

MIT, see [LICENSE](LICENSE). DHTMLX Gantt Community Edition is a separate project, also under the MIT license, © XB Software. This project is not affiliated with or endorsed by XB Software (DHTMLX) or Frappe.

Built with the help of an AI coding assistant (Claude Code). Designed, reviewed and tested by hand with VoiceOver by the author.
