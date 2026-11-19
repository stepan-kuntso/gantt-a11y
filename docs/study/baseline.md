# Baseline: the same tasks without the extension

What each task in [tasks.md](tasks.md) needs in plain dhtmlx-gantt 10.0.3 with its `keyboard_navigation` plugin (`demo/study.html?a11y=off`). This is derived from the library's documented keys, the ARIA attributes it renders and the automated audit ([audit/](../../audit/)); **it has not been checked with a screen reader**. The study itself should measure it: half of the participants start without the extension.

What the library gives: Tab into the grid, arrows between rows, Enter opens the task form, Ctrl+Enter adds a subtask, Delete deletes, Shift+arrows change nesting. Each row's accessible name is the tooltip template: "Task: Testing Start date: 2026-06-13 End date: 2026-06-18". Rows have `aria-level`; links are `role="img"` elements with names such as "Link Implementation (end) Testing (start)", not focusable. There is no live region and no command that reads dependencies, overlaps or conflicts.

| # | Task | Without the extension | How, and what is missing |
|---|---|---|---|
| 1 | Size of the plan | Partly | Count rows by arrowing through them; dates from each row's ISO dates. No overview. |
| 2 | Ends last, longest | Partly | End dates are in the row names; durations must be worked out from two ISO dates per row (the duration column is not in the row name). |
| 3 | Meaning of a link type | Partly | Only by exploring the timeline with the screen reader's own navigation to find link images; their names say "(start)" and "(end)", not "start to start", and give no meaning. |
| 4 | Dependency on the second page | Partly | Same as 3: find every link image ending at Launch. |
| 5 | Tasks at the same time | Partly | Compare the dates of every task by hand. |
| 6 | Move a task | Yes, through the form | Enter, change the start date in the form, save. No keyboard command moves a task. After saving, focus is back on the row with its new dates; nothing says what changed. |
| 7 | What is wrong now | No | The Community Edition has no conflict detection; the user would have to compare dates and links by hand. |
| 8 | Find every conflict | No | As 7. |
| 9 | Change in the form | Yes | Enter, "+", Save. The result is not announced; the row's new name gives the new dates. |
| 10 | Follow links and come back | No | No command moves along links. |
| 11 | Make a link | No | Links are created by dragging between bars only. |
| 12 | Where am I | Partly | `aria-level` gives the level; position is whatever the screen reader counts in the DOM; the parent's name is not given. There is no keyboard help. |

"Partly" means the facts are reachable but only by work that a sighted user does not have to do (exploring a drawing, comparing dates). These tasks are where the study should measure time and errors, not only success.
