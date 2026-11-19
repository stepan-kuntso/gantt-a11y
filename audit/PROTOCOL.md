# Audit protocol (version 2)

The same questions for any page with a Gantt chart, answered in an automated Chromium browser with Playwright (`audit/run.js`).

**This is not a test with a screen reader** and says nothing about WCAG conformance. It shows what reaches the keyboard and the accessibility tree; what a screen reader then speaks, and whether a person can use it, are separate questions.

Version 1 (results of 2026-11-16 in `results/2026-11-16.*`) is kept as it was. Version 2 changed how information is judged, how edits are attempted and announced, and added a check for keyboard help; `results/<date>-v2.md` marks every cell that differs from version 1 and says why.

## Pages of other libraries

`profiles.js` has profiles for public demos of other Gantt libraries (a dhtmlx-gantt sample, Bryntum Gantt, Syncfusion Gantt, Kendo UI Gantt), with their keys and keyboard paths **according to the vendor documentation**, each with its source URL. **Their results are not published** until they have been confirmed by hand: an automated run on someone else's demo can describe the audit's own limits as the product's (see "Threats to validity"). A run writes everything to `audit/private/results/`, which is not in the repository, and only the four demos of this repository to `results/`.

## Results

| Result | Meaning |
|---|---|
| **pass** | The behaviour was observed. For information: it is on an element that keyboard focus reaches, or it appears after a documented keyboard command. |
| **fail** | It was looked for and not observed. For an edit: the documented keys were pressed and nothing changed, or a step of the documented path could not be taken (the evidence says which, and notes that the demo's configuration may be the reason). |
| **present but not reachable** | (Shown as "tree only".) The information is in the accessibility tree, but not on anything keyboard focus reaches and not after a documented command. A screen reader user might find it by exploring with the screen reader's own commands, if at all. |
| **no documented keyboard path** | (Shown as "no path".) The library's documentation, as read for the profile, describes no keyboard way to do this. Not a fail: a way may exist undocumented. The sources are listed with the result. |
| **not applicable** | The question does not apply (for example, Enter opens no form, so there is no focus to return; a flat list has no levels). |
| **could not determine** | The audit could not look (focus never reached a row; it has no information on the library's keys; it did not recognise a date format). A limit of the audit, not a finding about the page. |

Every result comes with evidence: roles, accessible names and texts as the browser exposes them, the keys pressed, and for edits the documentation sources.

## How a page is described

A profile (`profiles.js`) gives CSS selectors for the chart, a task row, a bar and a link (there is no standard role for a bar or a dependency line), documented keyboard **commands** (for example gantt-a11y's Shift+D), and documented keyboard **paths** for the three edits, each with its sources. Keys are taken only from official documentation; typing into a focused text field or list box is ordinary keyboard use and needs no source.

Public demos are loaded once per run, like a visitor would: no login, no cookie or consent dialogs accepted, no protections bypassed, a pause between key presses. The tool is debugged on the local demos and on two local test pages (`fixtures/`), not on public pages.

## Information checks: three levels

The checks for name, dates, dependencies, level and position look on three levels and report all three:

- **a) tree**: the information is somewhere in the accessibility tree (a task row's name, link elements' names, ARIA attributes on rows), read before any key press;
- **b) focus**: it is in the accessible name or description of an element that keyboard focus lands on: the task row (or cell) reached with Tab and the arrow keys, and the cells the Right arrow reaches in the same row; or, for dependencies, link elements that can take focus;
- **c) command**: it appears after a documented keyboard command (a live region, an alert or status, or a change of the focused element's name).

The summary is **pass** for b or c, **present but not reachable** for a alone, **fail** for none.

Accessible names, descriptions, roles and levels come from Chromium's accessibility tree (DevTools Protocol, `Accessibility.getPartialAXTree`). When the focused element uses `aria-activedescendant`, the element it points to counts as focused.

## The checks

### 1. Keyboard focus reaches a task row

**How.** From the top of the page, press Tab up to 120 times (300 on public pages). When focus is inside the chart but not on a row, press Down up to three times. Pass when focus is on a task row or inside one.
**Pass / fail.** Focus reached a task row / did not.
**Does not prove** that the row is announced usefully, that the rest of the chart can be reached, or that the Tab order is sensible.

### 2. Keyboard focus reaches a task bar

**How.** Run last: press Tab up to 40 more times, then Right up to four times. Also counts bars with a `tabindex`.
**Pass / fail.** Focus landed on a bar / did not.
**Does not prove** that a bar can be operated from the keyboard. A fail is not necessarily a problem when everything a bar shows is also available from its row. The result depends on where focus was before, which the earlier checks change.

### 3. A task's name is available (three levels)

**b)** The focused element's accessible name or description is not empty.
**Does not prove** that the name is the task's name rather than another cell's text, or that it is understandable.

### 4. A task's dates are available (three levels)

**b)** A date appears in the name or description of the focused element or of a cell the Right arrow reaches in the same row (the evidence says which; a date on another cell is heard only after moving to it).
**Does not prove** that the dates are the right ones, or that they are spoken as dates.

### 5. Dependencies are available as text (three levels)

**a)** Names of up to five link elements. **b)** The focused element or a cell in its row: a cell under a "Predecessors", "Successors" or "Dependencies" column with text, or text with a dependency word and another task's name; or link elements that can take focus. **c)** The profile's command for dependencies.
**Does not prove** that the direction (which task depends on which) is clear, or that the list is complete.

### 6. Dependencies name the tasks

**How.** Pass when dependency text reachable from the keyboard (b or c of check 5) contains another task's name; **present but not reachable** when only the tree's text does; not applicable when there is no dependency text.
**Does not prove** that the names are unambiguous.

### 7. Level in the hierarchy is available (three levels)

**a)** A task row's `level` in the tree. **b)** The `level` of the row that holds focus. **c)** The profile's "where am I" command mentions a level. Not applicable to a flat list of options.
**Does not prove** that the screen reader announces the level, or that parent and child are clear.

### 8. Position in the list is available (three levels)

**a)** Any task row with `aria-posinset` and `aria-setsize`, or `aria-rowindex`. **b)** The row holding focus has `aria-posinset` and `aria-setsize`, or `aria-rowindex` with `aria-rowcount` on its grid. **c)** The "where am I" command gives "n of m".
**Does not prove** a problem when it fails: without these, a screen reader counts the rows in the DOM, which is right while every row is rendered and none is filtered out.

### 9. The page has a live region

**How.** Counts elements with `aria-live` (not "off") or the roles status, log and alert.
**Does not prove** that anything useful is ever announced through it.

### 10. The result of an edit reaches the user

**How.** After the first edit that worked (check 11, 12 or 13, in that order), any of: new text in a live region; new text in a role alert or status; a change of the focused element's accessible name while focus stays on the same row and cell (the name before is taken after moving to the cell). The evidence names the way that worked.
**Pass / fail.** One of the ways worked / none did. **Not applicable** when no edit worked; **no documented keyboard path** when there is none for any edit.
**Does not prove** that the result is spoken, spoken in full, or understandable; a changed name is heard only when the screen reader reads the element again (screen readers usually do when it is re-rendered with focus).

### 11, 12. Dates and duration can be changed from the keyboard

**How.** Follow the profile's documented path (for example: arrow keys to the Start cell, F2, type the date a day later in the same format, F2), then compare the bars: a moved bar for dates, a wider or narrower bar for duration.
**Pass / fail / no documented keyboard path** as defined above. A step that cannot be taken (no such column in the demo, a field not reached) is a fail with the reason; an unrecognised date format is "could not determine".
**Does not prove** that the right task changed, that the change is what the user intended, or that an undocumented path does not exist.

### 13. A link can be created from the keyboard

**How.** Follow the documented path and compare the number of link elements.
**Does not prove** that the link has the intended type or direction.

### 14. Focus returns to the task after closing the form

**How.** Press Enter on the task row. If a new dialog appears (`role="dialog"`, `aria-modal`, or dhtmlx's form) that was not there before, press Escape once and check that focus is back on the same row.
**Pass / fail / not applicable** (no new dialog).
**Does not prove** that the form itself is accessible, or that saving behaves like cancelling. On grids with cell editing, Enter may open a cell editor, which this check counts as a form; editors that need Escape twice then fail here.

### 15. The page tells the user which keys exist

**How.** Any of: the profile's documented help command gives text; elements with `aria-keyshortcuts`; a description (`aria-describedby`) of the chart or grid that mentions keys; text on the page outside the chart that mentions pressing keys. The evidence says which, and marks page text as written by the page's authors.
**Does not prove** that the help is complete or correct, or that a user would find it. Text written for a demo page is not part of the product.

### 16. The extension's keys do not overlap the library's documented keys

**How.** Compares gantt-a11y's default keys (`DEFAULT_KEYS` in `src/core/engine.js`) with the keys the library documents (the list and its sources are in the profile, `libraryKeys`), after putting both in one form (modifiers in one order, "esc" as "escape"). On a page with the extension it also counts how many of the extension's keys are bound on task rows (dhtmlx-gantt's public `getShortcutHandler`).
**Pass / fail.** No key in common / the keys in common are listed. **Not applicable** on pages without a gantt-a11y adapter; the evidence still lists which keys would overlap, as information for a future adapter.
**Does not prove** that the keys are free in the browser, the operating system or a screen reader (see `docs/KEYS.md`), that an application has not added keys of its own, or that keys the documentation does not mention are free.

## Threats to validity

- **Demos are not products.** Public demos show one configuration chosen by the vendor (which columns, whether editing is on, which features are enabled). A product built with the same library may do better or worse. Our own demos are configured by the author of the extension.
- **An automated browser is not a screen reader.** The audit reads Chromium's accessibility tree and presses keys; screen readers build their own model from the platform API, have their own navigation modes and may intercept keys. Safari and Firefox build their trees differently.
- **Keyboard profiles may be incomplete.** Keys are taken from the documentation pages listed in each profile; a library may support more than its documentation says, or document keys on pages the audit did not read. "No documented keyboard path" is a statement about the documentation read, not about the product.
- **The audit's own heuristics.** Selectors for rows, bars and links; the date pattern; matching field labels; counting a cell editor as a form; the order of checks (check 2 runs last and starts from wherever focus is). The evidence is kept so that each result can be reviewed; known doubts about a run are written next to it (`results/<date>-v2-notes.md`).
- **One run on one date.** Public demos change without notice; network timing and page load differ between runs. Each public page was loaded once for the version 2 results.
- **No colour, zoom, motion or pointer checks.** Only keyboard behaviour and the accessibility tree.
