# Manual testing with a screen reader

Step-by-step checks for every feature of gantt-a11y, with the exact text that should be heard. The expected texts were recorded in a browser from the extension's own output (the live region and the focused row's label) on the demo page; whether a given screen reader speaks them, and in which order, is what these checks are for.

## Setup

1. `npm install`, then `npm run demo`, and open `http://localhost:8080/demo/index.html`. The demo server forbids caching; with another static server, Safari may keep running an older version after a reload.
2. Turn on the screen reader. With VoiceOver on a Mac: Command+F5. Use Safari.
3. **Reload the page before each section** (in Safari Command+Option+R, which also skips the cache). Each section starts from the demo's original data; later steps in a section depend on earlier ones.
4. Enter the chart with **Tab** (not with a mouse click: the first key after a click on a freshly loaded page does not reach the chart). Move with the arrow keys.

Notes for all sections:

- After our text the screen reader adds its own description of the element, for example "row, tree grid, 6 columns, 12 rows" in VoiceOver. That part comes from the roles the library sets and from the screen reader's verbosity settings, not from this extension.
- "Row label" means the text the screen reader reads when focus lands on a row. Where a result is marked **(row label)**, it should be heard first, before anything else about the row. Where it is marked **(after the row)**, it comes from the live region and is heard after the screen reader has finished with the row.
- After each reload, the first time focus lands on a task, "Press Shift H for keys." is heard after the row, once (not at the Brief level, and not when a key was pressed within half a second). It is not repeated in the expected texts below; step 8.9 checks it.
- Hints ("Press again for the next 2.", "Go to the task that depends on it and press Shift L.") are spoken at most three times per session; after that the same step is heard without the hint.

## 1. Row labels

| # | Do | Expected |
|---|---|---|
| 1.1 | Arrow to "Website redesign" | "Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done." |
| 1.2 | Arrow to "Testing" | "Testing. 13 to 18 June, 5 days. 40 percent done." |
| 1.3 | Arrow to "Go-live" | "Go-live. Milestone, 20 June." |
| 1.4 | Arrow to "Budget approval" | "Budget approval. 2 to 4 June, 2 days. 0 percent done." |

The end date is the one Gantt shows in its task form (see README, "Deviations from the specification").

## 2. Dependencies (Shift+D)

| # | Do | Expected (after the row) |
|---|---|---|
| 2.1 | On "Testing", Shift+D | "Depends on: Implementation. Required by: Launch." |
| 2.2 | On "Launch", Shift+D | "Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2." |
| 2.3 | Within 5 seconds, Shift+D again | "4 and 5 of 5: Software design, Budget approval. End of list." |
| 2.4 | Shift+D again | the first page again (2.2) |
| 2.5 | On "Retrospective", Shift+D | "No dependencies." |

## 3. Time questions (Shift+O, Shift+B, Shift+A)

| # | Do | Expected (after the row) |
|---|---|---|
| 3.1 | On "Testing", Shift+O | "2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days." |
| 3.2 | Shift+B | "4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3." |
| 3.3 | Shift+B again within 5 seconds | "2 to 4 of 4: Code review, Software design, Budget approval. End of list." |
| 3.4 | Shift+A | "3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2." |
| 3.5 | Shift+A again | "2 and 3 of 3: Go-live, Retrospective. End of list." |
| 3.6 | On "Retrospective", Shift+O | "No tasks at the same time." |

## 4. Moving along links (Shift+S, Shift+P)

Each result is heard first, followed by the row label of the task focus moved to.

| # | Do | Expected (row label) |
|---|---|---|
| 4.1 | On "Implementation", Shift+S | "1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done." |
| 4.2 | Shift+S | "2 of 3, finish to finish. This depends on Implementation. Code review. 8 to 13 June, 5 days. 0 percent done." |
| 4.3 | Shift+S | "3 of 3. This depends on Implementation. Testing. 13 to 18 June, 5 days. 40 percent done." |
| 4.4 | Shift+S | back to 4.1 |
| 4.5 | On "Testing", Shift+P | "Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done." |
| 4.6 | Shift+P | "Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done." |
| 4.7 | Shift+P | (after the row) "Depends on nothing." Focus stays. |
| 4.8 | On "Launch", Shift+P | "1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done." |
| 4.9 | Shift+P | "2 of 5. Launch depends on this. Documentation. 5 to 15 June, 10 days. 0 percent done." |
| 4.10 | Arrow up, then down again to the same row | its normal row label, without the "2 of 5" part |

## 5. Changing dates from the keyboard (Shift+J, Shift+K, Shift+I, Shift+M)

Wait about two seconds between steps unless a step says "quickly". Presses less than a second apart are described as one total.

All results here come from the live region, after the row. The row may be read again first with its own label and the new dates (the library re-renders it); the result must not be heard twice.

| # | Do | Expected (after the row) |
|---|---|---|
| 5.1 | On "Testing", Shift+K once | "Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early." |
| 5.2 | Quickly Shift+J three times | the last one, complete (earlier ones may be cut off): "3 days earlier. Starts Thursday 11 June, ends Tuesday 16 June. Conflict. 2 days too early for Implementation." |
| 5.3 | Quickly Shift+K twice | "2 days later. Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved." |
| 5.4 | Shift+I | "6 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early." |
| 5.5 | Shift+M | "5 days. Ends Thursday 18 June. Conflict resolved." |
| 5.6 | On "Launch", Shift+M | (after the row) "Already 1 day, the minimum." |
| 5.7 | On "Budget approval", Shift+K | (after the row) "Read-only. Not changed." |
| 5.8 | On "Go-live", Shift+I | (after the row) "A milestone has no duration." |
| 5.9 | Shift+K | "On Sunday 21 June." |
| 5.10 | On "Website redesign", Shift+K | (after the row) "Not changed. A project takes its dates from its subtasks." |

## 6. The task form

| # | Do | Expected |
|---|---|---|
| 6.1 | On "Testing", Enter. Tab to "+" next to the duration, Space | (while the form is open) "Duration 6 days. Ends 19 June." |
| 6.2 | Tab to "Save", Space | (row label) "Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early. Testing. 13 to 19 June, 6 days. 40 percent done." |
| 6.3 | Enter, then go straight to "Save" | (row label) "Saved, no changes." followed by the row's own label |
| 6.4 | Enter. Change the description to "QA". In the day list choose 15. | (while open) "Start 15 June. Ends 21 June." |
| 6.5 | Press "−" once | (while open) "Duration 5 days. Ends 20 June." |
| 6.6 | "Save" | (row label) "Saved, 3 changes: name, start, duration. Conflict. Launch is now 2 days too early. QA. 15 to 20 June, 5 days. 40 percent done." |
| 6.7 | Enter, then Escape | (row label) "Cancelled. Nothing changed." followed by the row's own label |
| 6.8 | On "Website redesign", Control+Enter (new subtask), then "Save" | (when the form has closed) "Created New task. New task. 1 to 2 June, 1 day. 0 percent done." |
| 6.9 | Control+Enter again, then Escape | (row label, on "Website redesign") "New task discarded. Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done." |
| 6.10 | On "Retrospective", Enter, "Delete", confirm | (after the next row) "Deleted Retrospective." |
| 6.11 | On "Launch", Enter, "Delete", confirm | (after the next row) "Deleted Launch. 6 links removed." |
| 6.12 | Enter on any task, "Delete", then cancel the confirmation | the extension says nothing; the form stays open and focus goes back to "Delete". VoiceOver may read the form again as focus comes back into it: that is the library's dialog (compare with ?a11y=off) |

## 7. Links (Shift+L, Shift+T, Shift+U)

| # | Do | Expected (after the row) |
|---|---|---|
| 7.1 | On "Code review", Shift+T | "No task marked for a link. Press Shift L on a task first." |
| 7.2 | Shift+L | "Link from Code review. Go to the task that depends on it and press Shift L." |
| 7.3 | Shift+T | "Type: start to start." |
| 7.4 | Arrow to "Retrospective", Shift+L | "Linked. This depends on Code review, start to start." |
| 7.5 | On "Implementation", Shift+L; on "Testing", Shift+L | "Link from Implementation. ..." then "Link not created. This already depends on Implementation." |
| 7.6 | On "Launch", Shift+L; on "Software design", Shift+L | "... " then "Link not created. It would make a loop: Launch already depends on this." |
| 7.7 | On "Budget approval", Shift+L; on "Retrospective", Shift+L | "Link from Budget approval." then "Read-only. Not changed." |
| 7.8 | On "Documentation", Shift+L twice | "Link from Documentation." then "Link cancelled." |
| 7.9 | On "Testing", Shift+U | "Nothing to remove. First go to a linked task with the go-to keys." |
| 7.10 | Shift+P (focus moves to "Implementation"), then Shift+U | "Press again to remove the link: Testing depends on this." |
| 7.11 | Shift+U again within 5 seconds | "Link removed. Testing no longer depends on this." |

## 8. Repeat and help (Shift+R, Shift+H)

| # | Do | Expected (after the row) |
|---|---|---|
| 8.1 | Right after 7.11, Shift+R | "Link removed. Testing no longer depends on this." |
| 8.2 | After a reload, before anything else, Shift+R | "Nothing to repeat." |
| 8.3 | Shift+H | "Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group." |
| 8.4 | Shift+H twice, within 5 seconds; compare the second | "Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key." |
| 8.5 | Shift+H three times, within 5 seconds; compare the third | "Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key." |
| 8.6 | Shift+H four times, within 5 seconds; compare the fourth | "Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key." |
| 8.7 | Shift+H five times, within 5 seconds; compare the fifth | "Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key." |
| 8.8 | Shift+H six times, within 5 seconds; compare the sixth. There should be a clear pause after each “key” | "Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key." |
| 8.9 | After a reload, Tab into the chart and wait a second; then arrow down and up | After the first row: "Press Shift H for keys."; nothing more after the arrows |

## 9. Turning it off

| # | Do | Expected |
|---|---|---|
| 9.1 | Activate "Disable gantt-a11y", Tab back into the chart, arrow to "Testing" | the library's own row label ("Task: Testing ... Start date: 2026-06-13 ...") |
| 9.2 | Shift+D, Shift+H, Shift+K | nothing from this extension; Shift+K does not move the task |
| 9.3 | Activate "Enable gantt-a11y" | row labels as in section 1 again |

The expected texts in sections 10 to 13 were recorded from the extension's output on 2026-11-16, not designed in advance; check that they are what you want to hear, as well as how they are spoken.

## 10. Cell navigation mode

Open `demo/index.html?cells=1` (cell navigation mode). Tab into the chart; focus is on a cell. Answers to questions and results of edits come from the live region, after the cell is read; results of jumps and of the task form are the first part of the name of the cell focus moves to.

| # | Do | Expected |
|---|---|---|
| 10.1 | Shift+D on the “Testing” name cell | (after the cell) "Depends on: Implementation. Required by: Launch." |
| 10.2 | Shift+K on the “Testing” name cell | (after the cell) "Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early." |
| 10.3 | Shift+S on the “Implementation” name cell | (after the cell "Documentation" is read) "1 of 3, start to start. This depends on Implementation." |

## 11. Brief level

Open `demo/index.html?verbosity=brief`.

| # | Do | Expected |
|---|---|---|
| 11.1 | From “Implementation”, arrow down to “Testing” | (row label) "Testing. 13 June, 5 days. 40 percent done." |
| 11.2 | On “Testing”, Shift+K | (row label) "14 to 19 June. Conflict, Launch." |
| 11.3 | On “Launch”, Shift+P | (row label) "1 of 5. Launch depends on this. Testing. 13 June, 5 days. 40 percent done." |
| 11.4 | On “Testing”, Enter. Tab to “+”, Space. Tab to “Save”, Space | (row label) "Saved, 1 change: duration. Conflict, Launch. Testing. 13 June, 6 days. 40 percent done." |

## 12. Detailed level

Open `demo/index.html?verbosity=detailed`.

| # | Do | Expected |
|---|---|---|
| 12.1 | From “Implementation”, arrow down to “Testing” | (row label) "Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done." |
| 12.2 | On “Launch”, Shift+D | (after the row) "Depends on 5. Testing, finish to start. Documentation, finish to start. Code review, finish to start. Software design, start to start. Budget approval, finish to start. Required by: Marketing prep & PR, start to finish." |
| 12.3 | On “Testing”, Shift+K | (row label) "1 day later. Starts Sunday, 14 June 2026, ends Friday, 19 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends." |
| 12.4 | On “Launch”, Shift+P | (row label) "1 of 5, finish to start. Launch depends on this. Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done." |
| 12.5 | On “Testing”, Enter. Tab to “+”, Space. Tab to “Save”, Space | (row label) "Saved. Duration 6 days, was 5 days. End 19 June 2026, was 18 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends. Testing. In Website redesign. Start 13 June 2026. End 19 June 2026. 6 days. 40 percent done." |

## 13. frappe-gantt demo

Open `demo/frappe.html`. Tab into the task list on the left and move with Up and Down.

| # | Do | Expected |
|---|---|---|
| 13.1 | From “Implementation”, arrow down three times to “Testing” in the task list | (row label) "Testing. 13 to 17 June, 5 days. 40 percent done." |
| 13.2 | On “Testing”, Shift+D | (after the row) "Depends on: Implementation. Required by: Launch." |
| 13.3 | On “Launch”, Shift+D twice, within 5 seconds; compare the second | (after the row) "4 of 4: Budget approval. End of list." |
| 13.4 | On “Testing”, Shift+O | (after the row) "2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days." |
| 13.5 | On “Launch”, Shift+P | (row label) "1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done." |
| 13.6 | On “Testing”, Shift+K | (after the row) "Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early." |
| 13.7 | On “Budget approval”, Shift+K | (after the row) "Read-only. Not changed." |
| 13.8 | On “Marketing”, Shift+L; arrow down twice to “Retrospective”, Shift+L; compare the last | (after the row) "Linked. This depends on Marketing." |
| 13.9 | On “Testing”, Shift+H | (after the row) "Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group." |

## 14. Orientation

Shift+V (overview of the chart), Shift+W (where am I), Shift+C (next conflict, moves focus), Shift+Z (back to where the jumps started). The texts were recorded from the extension on 2026-11-16 and heard with VoiceOver in the full pass of 2026-11-19. For 14.3, 14.6 to 14.8, first move "Testing" to start on 11 June and "Code review" to start on 6 June (Shift+J twice on each), or use demo/manual-test.html, which prepares the data.

| # | Do | Expected |
|---|---|---|
| 14.1 | On “Testing”, Shift+V | (after the row) "11 tasks. 1 to 23 June. No conflicts." |
| 14.2 | On “Testing”, Shift+V (Detailed level) | (after the row) "11 tasks. 1 project, 1 milestone. 1 to 23 June 2026. No conflicts." |
| 14.3 | On “Retrospective”, Shift+V (Testing and Code review were moved into conflicts) | (after the row) "11 tasks. 1 to 23 June. 2 conflicts." |
| 14.4 | On “Testing”, Shift+W | (after the row) "Testing. In Website redesign. Level 2, 3 of 10." |
| 14.5 | On “Website redesign”, Shift+W | (after the row) "Website redesign. Top level, 1 of 1." |
| 14.6 | On “Retrospective”, Shift+C (two conflicts in the data) | (row label) "1 of 2. Conflict. 2 days too early: must not end before Implementation ends. Code review. 6 to 11 June, 5 days. 0 percent done." |
| 14.7 | On “Retrospective”, Shift+C twice, within 5 seconds; compare the second | (row label) "2 of 2. Conflict. 2 days too early: must not start before Implementation ends. Testing. 11 to 16 June, 5 days. 40 percent done." |
| 14.8 | On “Retrospective”, Shift+C, then Shift+Z; compare the last | (row label) "Back to Retrospective. Retrospective. 22 to 23 June, 1 day. 0 percent done." |
| 14.9 | On “Testing”, Shift+C | (after the row) "No conflicts." |
| 14.10 | On “Launch”, Shift+P twice, then Shift+Z; compare the last | (row label) "Back to Launch. Launch. 18 to 19 June, 1 day. 0 percent done." |
| 14.11 | On “Testing”, Shift+Z (no jump before) | (after the row) "Nothing to go back to." |
| 14.12 | On “Testing”, Shift+W in the frappe-gantt demo | (after the row) "Testing. Top level, 6 of 9." |
| 14.13 | On “Testing”, Shift+V in the frappe-gantt demo | (after the row) "9 tasks. 1 to 22 June. No conflicts." |

## What to report

`demo/manual-test.html` walks through all of these steps and builds the report for you.

For each step: what was actually heard, in what order relative to the row (before, instead of, after), and anything cut off or missing. Note the screen reader, its version, the browser and the speech rate. A screenshot of VoiceOver's caption panel is enough.

## Not yet covered

- A full pass with NVDA: NVDA 2026.3.1 with Chrome 157 had only a partial check (README, "Tested with").
- JAWS, Firefox, and keyboard layouts other than English (docs/KEYS.md).
- People who use a screen reader every day: every pass so far was done by the author, a sighted developer.
- Braille displays.
- The Brief and Detailed levels beyond the steps in sections 11 and 12.
