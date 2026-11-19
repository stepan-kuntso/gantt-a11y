# Changelog

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-11-19

The first release, on npm as `gantt-a11y`. Checked by the author, a sighted developer: fully with VoiceOver in Safari 26.2 on macOS 26.2, partly with NVDA 2026.3.1 in Chrome 157 on Windows; not checked with JAWS or Firefox. No feedback yet from people who use a screen reader every day, so the texts of the announcements may still change.

### Tested

- 2026-11-19: full pass of TESTING.md with VoiceOver in Safari 26.2 on macOS Tahoe 26.2, after the pre-release review: all 103 steps matched ([docs/manual-test-2026-11-19.md](docs/manual-test-2026-11-19.md)). Limits: done by a sighted developer; how clear each step was by ear was not rated; NVDA, JAWS and Windows were not tested. The row-label mechanism stays as it is.

- 2026-11-19: partial check with NVDA 2026.3.1 and Google Chrome 157.0.8103.79 on Windows (AssistivLabs), on the dhtmlx-gantt demo of the project site: the row labels, every key, and the task form (values while open, save, cancel). Texts as expected; results of jumps and of the form heard before the row. NVDA reads the row again after a keyboard edit and when a result leaves the row label, and says "not selected" and a changing position from the library's markup (README, "Limitations"). Not checked with NVDA: the full TESTING.md, deleting and creating tasks in the form, completing a link, cell navigation mode, the Brief and Detailed levels, the frappe-gantt demo, Firefox.

### Changed after the pre-release review (2026-11-18)

- **Announced is what was stored.** After a keyboard move or duration change, a new link or a removed link, the data is read again and only what was stored is spoken. A change refused in `onBeforeTaskUpdate` (or by the application in another way) gets "Not changed. The change was not accepted." (new string `edit.rejected`). The dhtmlx adapter no longer changes the stored task before `gantt.updateTask`: a refused update left the task changed without a re-render or a save. The task form's result is built again from the stored task when the form closes.
- **The row label.** A result in a row's label is always followed by the row's own label (the task's name was missing after "Cancelled. Nothing changed." and other form results); it is removed when focus leaves the row, when the window loses focus, and 5 seconds after focus landed; it is never spoken twice. Helper steps 6.2, 6.3, 6.7 and 12.5 expect the row label after the result.
- **Tooltip plugin.** With `gantt.ext.tooltips`, results of jumps and of the form go to the live region: the tooltip showed them to sighted users.
- **Cell navigation mode.** Jump and form results go to the live region, after the cell; column templates are no longer wrapped. Helper step 10.3 changed.
- **API.** Exports are `enableGanttA11y`, `enableFrappeGanttA11y` and `createEngine`, with the types; the text helpers, `DEFAULT_KEYS` and the strings are no longer exported, and the `gantt-a11y/frappe` entry point is gone. Both adapters are called as `enable(gantt, options)` and return `{ disable, refresh }`; frappe also refuses a second enable. Options are `verbosity`, `locale`, `strings`, `shortcuts`, `features`, `endDate`; removed: `hints`, `listLimit`, `weekday`, `year`, `container`, `features.time.includeProjects`, `features.edit.delay`, `features.form.delay`, `features.form.liveValues`. Adapters: `cancelOnFocus(id)` is new, `focusTask` returns `{ moved }`, `announceOnFocus` has no `withLabel`.
- The frappe-gantt adapter is marked experimental.

### Fixed after the pre-release review (2026-11-18)

- A template wrapper broke `gantt.templates.tooltip_text` (TypeError on every call, or endless recursion) when the application wrapped the template while a result was pending.
- A task created with Control+Enter, saved, opened again and cancelled was announced as "New task discarded.".
- A jump to a filtered-out task said "Focus did not move", then 600 ms later spoke the jump's result as if it had moved.
- Task names with a character reference outside Unicode (`&#99999999;`) threw a RangeError in every announcement about them; a "<" that is not a tag was dropped with the text after it; script and style content was spoken.
- frappe: after two jumps the first option kept the result as its name; a result whose option could not take focus was never spoken.
- Overview and conflict list read all links once per task: 642 ms and 548 ms on 5,000 tasks, now 15 ms and 2 ms.

### Added

- Dependencies of the focused task on demand (Shift+D), in pages, with link types other than finish to start spoken.
- Time questions: tasks at the same time (Shift+O), tasks that end before this starts (Shift+B), tasks that start after this ends (Shift+A).
- Jumps to what the task depends on and to what depends on it (Shift+P, Shift+S), with the position before the row label; collapsed parents are expanded, filtered tasks reported.
- Keyboard moves and duration changes (Shift+J, Shift+K, Shift+I, Shift+M), with quick successive edits described together and conflicts with links reported in the same message.
- Creating links (Shift+L, type with Shift+T) and removing the link used by the last jump (Shift+U, twice), with loop, duplicate and read-only checks.
- Results of the task form: saved changes (new value, then old), no changes, cancelled, created, discarded, deleted with subtasks and links; dates and duration spoken while the form is open.
- Repeat last (Shift+R) and spoken help in groups (Shift+H).
- Orientation on demand: overview of the chart (Shift+V), where am I (Shift+W), the next link conflict with focus on its task (Shift+C), back to where a series of jumps started (Shift+Z); in both adapters, in the help and in the Ukrainian strings.
- Optional task row label (`features.rowLabel`).
- Verbosity levels (brief, standard, detailed), hints spoken at most three times, `endDate: "gantt" | "lastDay"`, configurable keys, translatable strings with `Intl.PluralRules`.
- Cell navigation mode: results through the live region.
- An engine without dependencies on a Gantt library or the DOM (`src/core`), with the adapter interface described in `docs/ADAPTERS.md`.
- Adapter for dhtmlx-gantt 10.0.3 (public API only).
- Adapter for frappe-gantt 1.2.2, with an accessible task list (listbox, Up/Down/Home/End); no task form, finish-to-start links only.
- Ukrainian strings as a translation example (`gantt-a11y/locales/uk`).
- TypeScript declarations for the public API.
- Unit tests (`node:test`) and browser tests in Chromium and WebKit (Playwright) for both demos; a GitHub Actions workflow that runs them on every push to `main`.
- Announcement design spec (`docs/ANNOUNCEMENTS.md`), manual test script with a screen reader (`TESTING.md`).
- Accessibility tree tests for every step of `TESTING.md` (role, accessible name, level, expanded, selected, live region, order of focus and live region updates) and their log, `docs/accessibility-tree-log.md` (`npm run test:a11y-tree`).
- An automated audit of Gantt pages (`audit/`, `npm run audit`), with results for the demos of this repository, with and without the extension. Profiles for public demos of four other libraries exist; their results are not published until confirmed by hand.
- A static demo site (`site/`, `npm run site`) with an automated check of its own pages.
- A kit for a study with screen reader users: tasks, a baseline without the extension, a facilitator guide, and `demo/study.html`.
- A page that guides the manual check with a screen reader step by step and builds a report (`demo/manual-test.html`).
- `TESTING.md` sections for cell navigation, the Brief and Detailed levels, and the frappe-gantt demo; the demo takes `?verbosity=` and `?cells=1`.

### Changed

- Default keys for moving a task and changing its duration: Shift+J (earlier), Shift+K (later), Shift+I (longer), Shift+M (shorter), instead of Alt+Shift with the arrows, which, according to the vendors' documentation (sources in docs/KEYS.md), mean indent and outdent in Microsoft Project and Bryntum and group and ungroup in Google Sheets; that Left Alt+Shift can switch the input language on Windows is a common Windows setting reported by the project owner; Microsoft's pages read do not document it. The old keys are not kept. Keys of other tools, with sources, in `docs/KEYS.md`.

### Fixed

- Cell navigation mode: results of jumps (Shift+P, S, Z, C) and of the task form came after the cell that got focus. They are now the first part of that cell's name, as visually hidden text from a wrapped column template, so they are heard first.
- Results of keyboard edits (Shift+J, K, I, M) were not spoken by VoiceOver in Safari: they were put into the label of the row that kept focus, and the re-focus of that row was not announced. They now go to the live region, 500 ms after the row is re-rendered (`features.edit.delay`), and the row keeps its own label; heard with VoiceOver in Safari on macOS 26.2. The same for Shift+C when the next conflict is on the focused task. The results of the task form (saved, created, cancelled) were not heard either: the extension re-rendered the row itself after the form closed. Their text is now put into the row label when Save or Cancel is pressed, before the library re-renders and focuses the row, so it is heard first (heard with VoiceOver in Safari on macOS 26.2). For a new task the library focuses its row while the form is still open, so nothing was heard when it closed; "Created …" now comes through the live region, with the row's text. Discarding a new task (Escape) puts "New task discarded." first in the label of the row focus returns to.
- Cell navigation mode: a message waiting for the row to be focused was lost when focus landed on a cell of that row.

[Unreleased]: https://github.com/stepan-kuntso/gantt-a11y/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/stepan-kuntso/gantt-a11y/releases/tag/v0.1.0
