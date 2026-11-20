# Accessibility tree log

> **This is what the browser hands to the screen reader, not what the screen reader speaks.** Whether and in which order VoiceOver (or another screen reader) actually speaks it is checked by hand with [demo/manual-test.html](../demo/manual-test.html) and [TESTING.md](../TESTING.md).

Generated 2026-11-20 by `npm run test:a11y-tree` (test-browser/a11y-tree.spec.js, scripts/a11y-tree-log.js) on Darwin 25.2.0.

- Chromium 159.0.8154.6
- WebKit 27.2

## How it was measured

Each step starts from a freshly loaded demo page, brought into the step's state by `prepare()` in [demo/manual-steps.js](../demo/manual-steps.js) (data changes through the chart's API, focus on the starting task). Then Playwright presses the real keys. A recorder in the page logs, with times: focus changes, changes of the focused element's `aria-label`, and new text in the live region.

- **Chromium**: role, accessible name, level, expanded and selected are read from Chromium's own accessibility tree (DevTools Protocol, `Accessibility.getPartialAXTree`). This is the tree the platform accessibility API is built from.
- **WebKit**: Playwright cannot read WebKit's accessibility tree. Role and accessible name are computed by Playwright from the DOM following the ARIA rules (`ariaSnapshot`); level, expanded and selected come from the ARIA attributes. Differences between this computation and Safari's own tree would not show here.
- For a focused cell (cell navigation mode), level and expanded are taken from its row, where they belong in a tree grid.
- A step **matches** when: focus is on the expected task with the expected role; level, expanded and selected agree with the chart's data; and, by channel, the expected text is the focused element's accessible name and arrived with a focus or label change (row label), or is the last live region text and appeared after the last focus change (live region), or nothing new came from the extension.
- Expected texts are quoted from TESTING.md, except steps marked “recorded”: those were recorded from the extension's output (sections TESTING.md did not cover), so their text cannot disagree with the extension; their role, states and order still can.

## Summary

104 steps, 208 results in 2 browsers: **208 matched, 0 did not.**

Not checkable here (left for the manual check):

- 5.2: whether the earlier announcements of the burst are cut off and the last one is heard complete.
- 5.3: whether the earlier announcements of the burst are cut off and the last one is heard complete.
- 6.10: whether the live region text is still heard after the screen reader reads the row that gets focus.
- 6.11: whether the live region text is still heard after the screen reader reads the row that gets focus.
- 8.8: the pause after each “key”.
- 10.1: whether the live region text is heard after the cell, not dropped.
- 10.2: whether the live region text is heard after the cell, not dropped.
- 10.3: whether the live region text is heard after the cell, not dropped.

## Row labels

### 1.1

- **Action:** Arrow up to “Website redesign” (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.”.
- **Chromium: matched.** Focus: row “Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.” (level 1, expanded true, selected false). Live region: nothing.
  Order: 3 ms focus row #1.
- **WebKit: matched.** Focus: row “Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.” (level 1, expanded true). Live region: nothing.
  Order: 7 ms focus row #1.

### 1.2

- **Action:** Arrow down to “Testing” (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Testing. 13 to 18 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 6 ms focus row #4.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 7 ms focus row #4.

### 1.3

- **Action:** Arrow down to “Go-live” (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Go-live. Milestone, 20 June.”.
- **Chromium: matched.** Focus: row “Go-live. Milestone, 20 June.” (level 2, selected false). Live region: nothing.
  Order: 4 ms focus row #10.
- **WebKit: matched.** Focus: row “Go-live. Milestone, 20 June.” (level 2). Live region: nothing.
  Order: 2 ms focus row #10.

### 1.4

- **Action:** Arrow down to “Budget approval” (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Budget approval. 2 to 4 June, 2 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “Budget approval. 2 to 4 June, 2 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 9 ms focus row #11.
- **WebKit: matched.** Focus: row “Budget approval. 2 to 4 June, 2 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 3 ms focus row #11.

## Dependencies

### 2.1

- **Action:** Shift+D (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Depends on: Implementation. Required by: Launch.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Depends on: Implementation. Required by: Launch.”.
  Order: 110 ms live “Depends on: Implementation. Required by: Launch.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Depends on: Implementation. Required by: Launch.”.
  Order: 104 ms live “Depends on: Implementation. Required by: Launch.”.

### 2.2

- **Action:** Shift+D (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.
- **Chromium: matched.** Focus: row “Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.
  Order: 108 ms live “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.
- **WebKit: matched.** Focus: row “Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2). Live region: “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.
  Order: 105 ms live “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.

### 2.3

- **Action:** Shift+D, then Shift+D again within 5 seconds; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “4 and 5 of 5: Software design, Budget approval. End of list.”.
- **Chromium: matched.** Focus: row “Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “4 and 5 of 5: Software design, Budget approval. End of list.”.
  Order: 107 ms live “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.” → 577 ms live “4 and 5 of 5: Software design, Budget approval. End of list.”.
- **WebKit: matched.** Focus: row “Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2). Live region: “4 and 5 of 5: Software design, Budget approval. End of list.”.
  Order: 102 ms live “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.” → 569 ms live “4 and 5 of 5: Software design, Budget approval. End of list.”.

### 2.4

- **Action:** Shift+D three times, each within 5 seconds; compare the third (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.
- **Chromium: matched.** Focus: row “Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.
  Order: 107 ms live “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.” → 574 ms live “4 and 5 of 5: Software design, Budget approval. End of list.” → 1039 ms live “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.
- **WebKit: matched.** Focus: row “Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2). Live region: “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.
  Order: 106 ms live “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.” → 571 ms live “4 and 5 of 5: Software design, Budget approval. End of list.” → 1037 ms live “Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2.”.

### 2.5

- **Action:** Shift+D (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “No dependencies.”.
- **Chromium: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “No dependencies.”.
  Order: 105 ms live “No dependencies.”.
- **WebKit: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2). Live region: “No dependencies.”.
  Order: 103 ms live “No dependencies.”.

## Time questions

### 3.1

- **Action:** Shift+O (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.”.
  Order: 103 ms live “2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.”.
  Order: 102 ms live “2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.”.

### 3.2

- **Action:** Shift+B (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3.”.
  Order: 106 ms live “4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3.”.
  Order: 103 ms live “4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3.”.

### 3.3

- **Action:** Shift+B, then Shift+B again within 5 seconds; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “2 to 4 of 4: Code review, Software design, Budget approval. End of list.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “2 to 4 of 4: Code review, Software design, Budget approval. End of list.”.
  Order: 106 ms live “4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3.” → 572 ms live “2 to 4 of 4: Code review, Software design, Budget approval. End of list.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “2 to 4 of 4: Code review, Software design, Budget approval. End of list.”.
  Order: 106 ms live “4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3.” → 573 ms live “2 to 4 of 4: Code review, Software design, Budget approval. End of list.”.

### 3.4

- **Action:** Shift+A (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2.”.
  Order: 107 ms live “3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2.”.
  Order: 102 ms live “3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2.”.

### 3.5

- **Action:** Shift+A, then Shift+A again within 5 seconds; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “2 and 3 of 3: Go-live, Retrospective. End of list.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “2 and 3 of 3: Go-live, Retrospective. End of list.”.
  Order: 107 ms live “3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2.” → 574 ms live “2 and 3 of 3: Go-live, Retrospective. End of list.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “2 and 3 of 3: Go-live, Retrospective. End of list.”.
  Order: 104 ms live “3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2.” → 573 ms live “2 and 3 of 3: Go-live, Retrospective. End of list.”.

### 3.6

- **Action:** Shift+O (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “No tasks at the same time.”.
- **Chromium: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “No tasks at the same time.”.
  Order: 103 ms live “No tasks at the same time.”.
- **WebKit: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2). Live region: “No tasks at the same time.”.
  Order: 105 ms live “No tasks at the same time.”.

## Moving along links

### 4.1

- **Action:** Shift+S (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 19 ms focus row #5.
- **WebKit: matched.** Focus: row “1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 9 ms focus row #5.

### 4.2

- **Action:** Shift+S twice; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “2 of 3, finish to finish. This depends on Implementation. Code review. 8 to 13 June, 5 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “2 of 3, finish to finish. This depends on Implementation. Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 21 ms focus row #5 → 486 ms focus row #6.
- **WebKit: matched.** Focus: row “2 of 3, finish to finish. This depends on Implementation. Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 8 ms focus row #5 → 487 ms focus row #6.

### 4.3

- **Action:** Shift+S three times; compare the third (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “3 of 3. This depends on Implementation. Testing. 13 to 18 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “3 of 3. This depends on Implementation. Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 15 ms focus row #5 → 477 ms focus row #6 → 944 ms focus row #4.
- **WebKit: matched.** Focus: row “3 of 3. This depends on Implementation. Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 9 ms focus row #5 → 478 ms focus row #6 → 955 ms focus row #4.

### 4.4

- **Action:** Shift+S four times; compare the fourth (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 7 ms focus row #5 → 473 ms focus row #6 → 941 ms focus row #4 → 1409 ms focus row #5.
- **WebKit: matched.** Focus: row “1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 8 ms focus row #5 → 483 ms focus row #6 → 955 ms focus row #4 → 1426 ms focus row #5.

### 4.5

- **Action:** Shift+P (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 18 ms focus row #3.
- **WebKit: matched.** Focus: row “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 19 ms focus row #3.

### 4.6

- **Action:** Shift+P twice; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 18 ms focus row #3 → 478 ms focus row #2.
- **WebKit: matched.** Focus: row “Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 8 ms focus row #3 → 477 ms focus row #2.

### 4.7

- **Action:** Shift+P three times; compare the third (focus stays on Software design) (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Depends on nothing.”.
- **Chromium: matched.** Focus: row “Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done.” (level 2, selected false). Live region: “Depends on nothing.”.
  Order: 16 ms focus row #3 → 479 ms focus row #2 → 1045 ms live “Depends on nothing.”.
- **WebKit: matched.** Focus: row “Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done.” (level 2). Live region: “Depends on nothing.”.
  Order: 11 ms focus row #3 → 482 ms focus row #2 → 1053 ms live “Depends on nothing.”.

### 4.8

- **Action:** Shift+P (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 14 ms focus row #4.
- **WebKit: matched.** Focus: row “1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 15 ms focus row #4.

### 4.9

- **Action:** Shift+P twice; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “2 of 5. Launch depends on this. Documentation. 5 to 15 June, 10 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “2 of 5. Launch depends on this. Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 17 ms focus row #4 → 474 ms focus row #5.
- **WebKit: matched.** Focus: row “2 of 5. Launch depends on this. Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 9 ms focus row #4 → 497 ms focus row #5.

### 4.10

- **Action:** Shift+P twice, then arrow up and down again to the same row (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Documentation. 5 to 15 June, 10 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 16 ms focus row #4 → 473 ms focus row #5 → 940 ms focus row #4 → 1311 ms focus row #5.
- **WebKit: matched.** Focus: row “Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 6 ms focus row #4 → 480 ms focus row #5 → 948 ms focus row #4 → 1323 ms focus row #5.

## Changing dates

### 5.1

- **Action:** Shift+K once (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
- **Chromium: matched.** Focus: row “Testing. 14 to 19 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
  Order: 3 ms focus row #4 → 4 ms focus row #4 → 606 ms live “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
- **WebKit: matched.** Focus: row “Testing. 14 to 19 June, 5 days. 40 percent done.” (level 2). Live region: “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
  Order: 4 ms focus row #4 → 5 ms focus row #4 → 607 ms live “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.

### 5.2

- **Action:** Quickly Shift+J three times (Testing already starts 14 June); compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “3 days earlier. Starts Thursday 11 June, ends Tuesday 16 June. Conflict. 2 days too early for Implementation.”.
- **Chromium: matched.** Focus: row “Testing. 11 to 16 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “3 days earlier. Starts Thursday 11 June, ends Tuesday 16 June. Conflict. 2 days too early for Implementation.”.
  Order: 6 ms focus row #4 → 7 ms focus row #4 → 137 ms focus row #4 → 139 ms focus row #4 → 269 ms focus row #4 → 270 ms focus row #4 → 873 ms live “3 days earlier. Starts Thursday 11 June, ends Tuesday 16 June. Conflict. 2 days too early for Implementation.”.
- **WebKit: matched.** Focus: row “Testing. 11 to 16 June, 5 days. 40 percent done.” (level 2). Live region: “3 days earlier. Starts Thursday 11 June, ends Tuesday 16 June. Conflict. 2 days too early for Implementation.”.
  Order: 11 ms focus row #4 → 13 ms focus row #4 → 148 ms focus row #4 → 151 ms focus row #4 → 282 ms focus row #4 → 283 ms focus row #4 → 885 ms live “3 days earlier. Starts Thursday 11 June, ends Tuesday 16 June. Conflict. 2 days too early for Implementation.”.
- **Not checkable here:** whether the earlier announcements of the burst are cut off and the last one is heard complete.

### 5.3

- **Action:** Quickly Shift+K twice (Testing starts 11 June); compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “2 days later. Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “2 days later. Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved.”.
  Order: 13 ms focus row #4 → 14 ms focus row #4 → 145 ms focus row #4 → 146 ms focus row #4 → 749 ms live “2 days later. Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “2 days later. Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved.”.
  Order: 4 ms focus row #4 → 5 ms focus row #4 → 132 ms focus row #4 → 133 ms focus row #4 → 735 ms live “2 days later. Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved.”.
- **Not checkable here:** whether the earlier announcements of the burst are cut off and the last one is heard complete.

### 5.4

- **Action:** Shift+I (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “6 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 19 June, 6 days. 40 percent done.” (level 2, selected false). Live region: “6 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
  Order: 5 ms focus row #4 → 6 ms focus row #4 → 609 ms live “6 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 19 June, 6 days. 40 percent done.” (level 2). Live region: “6 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
  Order: 3 ms focus row #4 → 4 ms focus row #4 → 606 ms live “6 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early.”.

### 5.5

- **Action:** Shift+M (Testing is 6 days) (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “5 days. Ends Thursday 18 June. Conflict resolved.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “5 days. Ends Thursday 18 June. Conflict resolved.”.
  Order: 3 ms focus row #4 → 4 ms focus row #4 → 606 ms live “5 days. Ends Thursday 18 June. Conflict resolved.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “5 days. Ends Thursday 18 June. Conflict resolved.”.
  Order: 9 ms focus row #4 → 11 ms focus row #4 → 614 ms live “5 days. Ends Thursday 18 June. Conflict resolved.”.

### 5.6

- **Action:** Shift+M (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Already 1 day, the minimum.”.
- **Chromium: matched.** Focus: row “Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “Already 1 day, the minimum.”.
  Order: 105 ms live “Already 1 day, the minimum.”.
- **WebKit: matched.** Focus: row “Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2). Live region: “Already 1 day, the minimum.”.
  Order: 102 ms live “Already 1 day, the minimum.”.

### 5.7

- **Action:** Shift+K (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Read-only. Not changed.”.
- **Chromium: matched.** Focus: row “Budget approval. 2 to 4 June, 2 days. 0 percent done.” (level 2, selected false). Live region: “Read-only. Not changed.”.
  Order: 104 ms live “Read-only. Not changed.”.
- **WebKit: matched.** Focus: row “Budget approval. 2 to 4 June, 2 days. 0 percent done.” (level 2). Live region: “Read-only. Not changed.”.
  Order: 102 ms live “Read-only. Not changed.”.

### 5.8

- **Action:** Shift+I (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “A milestone has no duration.”.
- **Chromium: matched.** Focus: row “Go-live. Milestone, 20 June.” (level 2, selected false). Live region: “A milestone has no duration.”.
  Order: 104 ms live “A milestone has no duration.”.
- **WebKit: matched.** Focus: row “Go-live. Milestone, 20 June.” (level 2). Live region: “A milestone has no duration.”.
  Order: 102 ms live “A milestone has no duration.”.

### 5.9

- **Action:** Shift+K (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “On Sunday 21 June.”.
- **Chromium: matched.** Focus: row “Go-live. Milestone, 21 June.” (level 2, selected false). Live region: “On Sunday 21 June.”.
  Order: 5 ms focus row #10 → 7 ms focus row #10 → 609 ms live “On Sunday 21 June.”.
- **WebKit: matched.** Focus: row “Go-live. Milestone, 21 June.” (level 2). Live region: “On Sunday 21 June.”.
  Order: 7 ms focus row #10 → 9 ms focus row #10 → 612 ms live “On Sunday 21 June.”.

### 5.10

- **Action:** Shift+K (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Not changed. A project takes its dates from its subtasks.”.
- **Chromium: matched.** Focus: row “Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.” (level 1, expanded true, selected false). Live region: “Not changed. A project takes its dates from its subtasks.”.
  Order: 104 ms live “Not changed. A project takes its dates from its subtasks.”.
- **WebKit: matched.** Focus: row “Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.” (level 1, expanded true). Live region: “Not changed. A project takes its dates from its subtasks.”.
  Order: 102 ms live “Not changed. A project takes its dates from its subtasks.”.

## The task form

### 6.1

- **Action:** Enter (the form opens in the description field). Tab 6 times to “+” after the duration, Space (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Duration 6 days. Ends 19 June.”.
- **Chromium: matched.** Focus: button “+”. Live region: “Duration 6 days. Ends 19 June.”.
  Order: 10 ms focus textarea → 33 ms focus input → 488 ms live “Duration 6 days. Ends 19 June.”.
- **WebKit: matched.** Focus: button “+”. Live region: “Duration 6 days. Ends 19 June.”.
  Order: 6 ms focus textarea → 69 ms focus input → 523 ms live “Duration 6 days. Ends 19 June.”.

### 6.2

- **Action:** Enter. Tab 6 times to “+” after the duration, Space. Tab once to “Save”, Space (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early. Testing. 13 to 19 June, 6 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early. Testing. 13 to 19 June, 6 days. 40 percent done.” (level 2, selected false). Live region: “Duration 6 days. Ends 19 June.”.
  Order: 3 ms focus textarea → 22 ms focus input → 478 ms live “Duration 6 days. Ends 19 June.” → 1037 ms focus button → 1061 ms focus row #4.
- **WebKit: matched.** Focus: row “Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early. Testing. 13 to 19 June, 6 days. 40 percent done.” (level 2). Live region: “Duration 6 days. Ends 19 June.”.
  Order: 3 ms focus textarea → 43 ms focus input → 499 ms live “Duration 6 days. Ends 19 June.” → 1058 ms focus button → 1084 ms focus row #4.

### 6.3

- **Action:** Enter. Tab 7 times to “Save”, Space (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Saved, no changes. Testing. 13 to 18 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Saved, no changes. Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 8 ms focus textarea → 41 ms focus button → 54 ms focus row #4.
- **WebKit: matched.** Focus: row “Saved, no changes. Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 4 ms focus textarea → 41 ms focus button → 63 ms focus row #4.

### 6.4

- **Action:** Enter. Cmd+A and type QA (the name). Tab once to the day list (“Days”), type 15. Wait half a second. The helper has made Testing 6 days long (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Start 15 June. Ends 21 June.”.
- **Chromium: matched.** Focus: textbox “Description”. Live region: “Start 15 June. Ends 21 June.”.
  Order: 4 ms focus textarea → 489 ms live “Start 15 June. Ends 21 June.”.
- **WebKit: matched.** Focus: textbox “Description”. Live region: “Start 15 June. Ends 21 June.”.
  Order: 3 ms focus textarea → 494 ms live “Start 15 June. Ends 21 June.”.

### 6.5

- **Action:** As 6.4: Enter, Cmd+A, type QA, Tab, type 15. Then Tab 3 times to “−” before the duration, Space; compare what is heard after the “−” (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Duration 5 days. Ends 20 June.”.
- **Chromium: matched.** Focus: button “−”. Live region: “Duration 5 days. Ends 20 June.”.
  Order: 3 ms focus textarea → 476 ms live “Start 15 June. Ends 21 June.” → 1035 ms focus input → 1490 ms live “Duration 5 days. Ends 20 June.”.
- **WebKit: matched.** Focus: button “−”. Live region: “Duration 5 days. Ends 20 June.”.
  Order: 2 ms focus textarea → 492 ms live “Start 15 June. Ends 21 June.” → 1046 ms focus input → 1502 ms live “Duration 5 days. Ends 20 June.”.

### 6.6

- **Action:** As 6.5: Enter, Cmd+A, type QA, Tab, type 15, Tab 3 times to “−”, Space. Then Tab 3 times to “Save”, Space (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Saved, 3 changes: name, start, duration. Conflict. Launch is now 2 days too early. QA. 15 to 20 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Saved, 3 changes: name, start, duration. Conflict. Launch is now 2 days too early. QA. 15 to 20 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Duration 5 days. Ends 20 June.”.
  Order: 6 ms focus textarea → 487 ms live “Start 15 June. Ends 21 June.” → 1040 ms focus input → 1494 ms live “Duration 5 days. Ends 20 June.” → 2045 ms focus button → 2063 ms focus row #4.
- **WebKit: matched.** Focus: row “Saved, 3 changes: name, start, duration. Conflict. Launch is now 2 days too early. QA. 15 to 20 June, 5 days. 40 percent done.” (level 2). Live region: “Duration 5 days. Ends 20 June.”.
  Order: 6 ms focus textarea → 494 ms live “Start 15 June. Ends 21 June.” → 1050 ms focus input → 1507 ms live “Duration 5 days. Ends 20 June.” → 2067 ms focus button → 2100 ms focus row #4.

### 6.7

- **Action:** Enter, then Escape (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Cancelled. Nothing changed. Testing. 13 to 18 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Cancelled. Nothing changed. Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 3 ms focus textarea → 23 ms focus row #4.
- **WebKit: matched.** Focus: row “Cancelled. Nothing changed. Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 2 ms focus textarea → 26 ms focus row #4.

### 6.8

- **Action:** Control+Enter (a new subtask; its form opens in the description field). Tab 7 times to “Save”, Space (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Created New task. New task. 1 to 2 June, 1 day. 0 percent done.”.
- **Chromium: matched.** Focus: row “New task. 1 to 2 June, 1 day. 0 percent done.” (level 2, selected true). Live region: “Created New task. New task. 1 to 2 June, 1 day. 0 percent done.”.
  Order: 12 ms focus row #1 → 15 ms focus textarea → 36 ms focus button → 37 ms focus row #1795187972539 → 43 ms focus row #1795187972539 → 47 ms focus row #1795187972539 → 648 ms live “Created New task. New task. 1 to 2 June, 1 day. 0 percent done.”.
- **WebKit: matched.** Focus: row “New task. 1 to 2 June, 1 day. 0 percent done.” (level 2, selected true). Live region: “Created New task. New task. 1 to 2 June, 1 day. 0 percent done.”.
  Order: 26 ms focus row #1 → 28 ms focus textarea → 61 ms focus button → 63 ms focus row #1795188034919 → 75 ms focus row #1795188034919 → 82 ms focus row #1795188034919 → 684 ms live “Created New task. New task. 1 to 2 June, 1 day. 0 percent done.”.

### 6.9

- **Action:** Control+Enter (a new subtask; its form opens), then Escape (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “New task discarded. Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.”.
- **Chromium: matched.** Focus: row “New task discarded. Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.” (level 1, expanded true, selected false). Live region: nothing.
  Order: 17 ms focus row #1 → 21 ms focus textarea → 56 ms focus row #1.
- **WebKit: matched.** Focus: row “New task discarded. Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.” (level 1, expanded true). Live region: nothing.
  Order: 15 ms focus row #1 → 17 ms focus textarea → 53 ms focus row #1.

### 6.10

- **Action:** Enter, “Delete”, confirm (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Deleted Retrospective.”.
- **Chromium: matched.** Focus: row “Marketing prep & PR. 10 to 19 June, 9 days. 0 percent done.” (level 2, selected false). Live region: “Deleted Retrospective.”.
  Order: 4 ms focus textarea → 24 ms focus button → 30 ms focus button → 60 ms focus row #8 → 661 ms live “Deleted Retrospective.”.
- **WebKit: matched.** Focus: row “Marketing prep & PR. 10 to 19 June, 9 days. 0 percent done.” (level 2). Live region: “Deleted Retrospective.”.
  Order: 2 ms focus textarea → 38 ms focus button → 41 ms focus button → 87 ms focus row #8 → 689 ms live “Deleted Retrospective.”.
- **Not checkable here:** whether the live region text is still heard after the screen reader reads the row that gets focus.

### 6.11

- **Action:** Enter, “Delete”, confirm (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Deleted Launch. 6 links removed.”.
- **Chromium: matched.** Focus: row “Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2, selected false). Live region: “Deleted Launch. 6 links removed.”.
  Order: 7 ms focus textarea → 30 ms focus button → 33 ms focus button → 76 ms focus row #6 → 677 ms live “Deleted Launch. 6 links removed.”.
- **WebKit: matched.** Focus: row “Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2). Live region: “Deleted Launch. 6 links removed.”.
  Order: 3 ms focus textarea → 29 ms focus button → 31 ms focus button → 64 ms focus row #6 → 666 ms live “Deleted Launch. 6 links removed.”.
- **Not checkable here:** whether the live region text is still heard after the screen reader reads the row that gets focus.

### 6.12

- **Action:** Enter, “Delete”, then cancel the confirmation (page `demo/index.html`).
- **Expected** (TESTING.md), in the nothing new from the extension: the extension says nothing; the form stays open and focus goes back to “Delete”. VoiceOver may read the form again as focus comes back into it: that is the library's dialog (compare with ?a11y=off).
- **Chromium: matched.** Focus: button “Delete”. Live region: nothing.
  Order: 10 ms focus textarea → 39 ms focus button → 56 ms focus button → 75 ms focus button → 110 ms focus button.
- **WebKit: matched.** Focus: button “Delete”. Live region: nothing.
  Order: 5 ms focus textarea → 49 ms focus button → 52 ms focus button → 82 ms focus button → 85 ms focus button.

## Links

### 7.1

- **Action:** Shift+T (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “No task marked for a link. Press Shift L on a task first.”.
- **Chromium: matched.** Focus: row “Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2, selected false). Live region: “No task marked for a link. Press Shift L on a task first.”.
  Order: 104 ms live “No task marked for a link. Press Shift L on a task first.”.
- **WebKit: matched.** Focus: row “Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2). Live region: “No task marked for a link. Press Shift L on a task first.”.
  Order: 104 ms live “No task marked for a link. Press Shift L on a task first.”.

### 7.2

- **Action:** Shift+L (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Link from Code review. Go to the task that depends on it and press Shift L.”.
- **Chromium: matched.** Focus: row “Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2, selected false). Live region: “Link from Code review. Go to the task that depends on it and press Shift L.”.
  Order: 103 ms live “Link from Code review. Go to the task that depends on it and press Shift L.”.
- **WebKit: matched.** Focus: row “Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2). Live region: “Link from Code review. Go to the task that depends on it and press Shift L.”.
  Order: 103 ms live “Link from Code review. Go to the task that depends on it and press Shift L.”.

### 7.3

- **Action:** Shift+L, then Shift+T; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Type: start to start.”.
- **Chromium: matched.** Focus: row “Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2, selected false). Live region: “Type: start to start.”.
  Order: 104 ms live “Link from Code review. Go to the task that depends on it and press Shift L.” → 471 ms live “Type: start to start.”.
- **WebKit: matched.** Focus: row “Code review. 8 to 13 June, 5 days. 0 percent done.” (level 2). Live region: “Type: start to start.”.
  Order: 103 ms live “Link from Code review. Go to the task that depends on it and press Shift L.” → 469 ms live “Type: start to start.”.

### 7.4

- **Action:** Shift+L, Shift+T, arrow down to “Retrospective”, Shift+L; compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Linked. This depends on Code review, start to start.”.
- **Chromium: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “Linked. This depends on Code review, start to start.”.
  Order: 104 ms live “Link from Code review. Go to the task that depends on it and press Shift L.” → 472 ms live “Type: start to start.” → 743 ms focus row #7 → 816 ms focus row #8 → 883 ms focus row #9 → 1352 ms live “Linked. This depends on Code review, start to start.”.
- **WebKit: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2). Live region: “Linked. This depends on Code review, start to start.”.
  Order: 105 ms live “Link from Code review. Go to the task that depends on it and press Shift L.” → 474 ms live “Type: start to start.” → 751 ms focus row #7 → 823 ms focus row #8 → 890 ms focus row #9 → 1360 ms live “Linked. This depends on Code review, start to start.”.

### 7.5

- **Action:** Shift+L; arrow down to “Testing”, Shift+L; compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Link not created. This already depends on Implementation.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Link not created. This already depends on Implementation.”.
  Order: 105 ms live “Link from Implementation. Go to the task that depends on it and press Shift L.” → 375 ms focus row #4 → 847 ms live “Link not created. This already depends on Implementation.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Link not created. This already depends on Implementation.”.
  Order: 105 ms live “Link from Implementation. Go to the task that depends on it and press Shift L.” → 374 ms focus row #4 → 842 ms live “Link not created. This already depends on Implementation.”.

### 7.6

- **Action:** Shift+L; go to “Software design” (arrow up), Shift+L; compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Link not created. It would make a loop: Launch already depends on this.”.
- **Chromium: matched.** Focus: row “Software design. 1 to 5 June, 4 days. 0 percent done.” (level 2, selected false). Live region: “Link not created. It would make a loop: Launch already depends on this.”.
  Order: 105 ms live “Link from Launch. Go to the task that depends on it and press Shift L.” → 373 ms focus row #2 → 1114 ms live “Link not created. It would make a loop: Launch already depends on this.”.
- **WebKit: matched.** Focus: row “Software design. 1 to 5 June, 4 days. 0 percent done.” (level 2). Live region: “Link not created. It would make a loop: Launch already depends on this.”.
  Order: 104 ms live “Link from Launch. Go to the task that depends on it and press Shift L.” → 375 ms focus row #2 → 1108 ms live “Link not created. It would make a loop: Launch already depends on this.”.

### 7.7

- **Action:** Shift+L; go to “Retrospective” (arrow up), Shift+L; compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Read-only. Not changed.”.
- **Chromium: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “Read-only. Not changed.”.
  Order: 105 ms live “Link from Budget approval. Go to the task that depends on it and press Shift L.” → 371 ms focus row #9 → 1110 ms live “Read-only. Not changed.”.
- **WebKit: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2). Live region: “Read-only. Not changed.”.
  Order: 103 ms live “Link from Budget approval. Go to the task that depends on it and press Shift L.” → 379 ms focus row #9 → 1105 ms live “Read-only. Not changed.”.

### 7.8

- **Action:** Shift+L twice; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Link cancelled.”.
- **Chromium: matched.** Focus: row “Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2, selected false). Live region: “Link cancelled.”.
  Order: 103 ms live “Link from Documentation. Go to the task that depends on it and press Shift L.” → 468 ms live “Link cancelled.”.
- **WebKit: matched.** Focus: row “Documentation. 5 to 15 June, 10 days. 0 percent done.” (level 2). Live region: “Link cancelled.”.
  Order: 101 ms live “Link from Documentation. Go to the task that depends on it and press Shift L.” → 468 ms live “Link cancelled.”.

### 7.9

- **Action:** Shift+U (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Nothing to remove. First go to a linked task with the go-to keys.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Nothing to remove. First go to a linked task with the go-to keys.”.
  Order: 105 ms live “Nothing to remove. First go to a linked task with the go-to keys.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Nothing to remove. First go to a linked task with the go-to keys.”.
  Order: 104 ms live “Nothing to remove. First go to a linked task with the go-to keys.”.

### 7.10

- **Action:** Shift+P (focus moves to “Implementation”), then Shift+U; compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Press again to remove the link: Testing depends on this.”.
- **Chromium: matched.** Focus: row “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.” (level 2, selected false). Live region: “Press again to remove the link: Testing depends on this.”.
  Order: 14 ms focus row #3 → 582 ms live “Press again to remove the link: Testing depends on this.”.
- **WebKit: matched.** Focus: row “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.” (level 2). Live region: “Press again to remove the link: Testing depends on this.”.
  Order: 8 ms focus row #3 → 575 ms live “Press again to remove the link: Testing depends on this.”.

### 7.11

- **Action:** Shift+P, Shift+U, then Shift+U again within 5 seconds; compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Link removed. Testing no longer depends on this.”.
- **Chromium: matched.** Focus: row “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.” (level 2, selected false). Live region: “Link removed. Testing no longer depends on this.”.
  Order: 12 ms focus row #3 → 573 ms live “Press again to remove the link: Testing depends on this.” → 939 ms focus row #3 → 1041 ms live “Link removed. Testing no longer depends on this.”.
- **WebKit: matched.** Focus: row “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.” (level 2). Live region: “Link removed. Testing no longer depends on this.”.
  Order: 9 ms focus row #3 → 576 ms live “Press again to remove the link: Testing depends on this.” → 946 ms focus row #3 → 1048 ms live “Link removed. Testing no longer depends on this.”.

## Repeat and help

### 8.1

- **Action:** Shift+P, Shift+U, Shift+U (as 7.11), then Shift+R; compare the last (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Link removed. Testing no longer depends on this.”.
- **Chromium: matched.** Focus: row “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.” (level 2, selected false). Live region: “Link removed. Testing no longer depends on this.”.
  Order: 19 ms focus row #3 → 577 ms live “Press again to remove the link: Testing depends on this.” → 940 ms focus row #3 → 1043 ms live “Link removed. Testing no longer depends on this.” → 1511 ms live “Link removed. Testing no longer depends on this.”.
- **WebKit: matched.** Focus: row “Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done.” (level 2). Live region: “Link removed. Testing no longer depends on this.”.
  Order: 13 ms focus row #3 → 578 ms live “Press again to remove the link: Testing depends on this.” → 945 ms focus row #3 → 1050 ms live “Link removed. Testing no longer depends on this.” → 1516 ms live “Link removed. Testing no longer depends on this.”.

### 8.2

- **Action:** Shift+R (nothing pressed before on this page) (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Nothing to repeat.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Nothing to repeat.”.
  Order: 103 ms live “Nothing to repeat.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Nothing to repeat.”.
  Order: 102 ms live “Nothing to repeat.”.

### 8.3

- **Action:** Shift+H (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.
  Order: 103 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.
  Order: 102 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.

### 8.4

- **Action:** Shift+H twice, within 5 seconds; compare the second (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.”.
  Order: 103 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 567 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.”.
  Order: 102 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 568 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.”.

### 8.5

- **Action:** Shift+H three times, within 5 seconds; compare the third (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.”.
  Order: 105 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 572 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.” → 1037 ms live “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.”.
  Order: 103 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 589 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.” → 1071 ms live “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.”.

### 8.6

- **Action:** Shift+H four times, within 5 seconds; compare the fourth (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.”.
  Order: 106 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 572 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.” → 1042 ms live “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.” → 1511 ms live “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.”.
  Order: 115 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 593 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.” → 1062 ms live “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.” → 1526 ms live “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.”.

### 8.7

- **Action:** Shift+H five times, within 5 seconds; compare the fifth (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key.”.
  Order: 103 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 569 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.” → 1037 ms live “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.” → 1504 ms live “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.” → 1975 ms live “Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key.”.
  Order: 103 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 570 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.” → 1035 ms live “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.” → 1501 ms live “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.” → 1967 ms live “Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key.”.

### 8.8

- **Action:** Shift+H six times, within 5 seconds; compare the sixth. There should be a clear pause after each “key” (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key.”.
  Order: 105 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 575 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.” → 1041 ms live “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.” → 1512 ms live “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.” → 1982 ms live “Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key.” → 2448 ms live “Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key.”.
  Order: 103 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.” → 570 ms live “Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key.” → 1035 ms live “Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key.” → 1501 ms live “Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key.” → 1968 ms live “Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key.” → 2433 ms live “Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key.”.
- **Not checkable here:** the pause after each “key”.

### 8.9

- **Action:** Wait a second after focus first lands on “Testing” (after a reload) (page `demo/index.html`).
- **Expected** (TESTING.md), in the live region: “Press Shift H for keys.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Press Shift H for keys.”.
  Order: 273 ms live “Press Shift H for keys.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Press Shift H for keys.”.
  Order: 270 ms live “Press Shift H for keys.”.

## Turning it off

### 9.1

- **Action:** gantt-a11y is disabled. Arrow down to “Testing” (page `demo/index.html`).
- **Expected** (TESTING.md), in the the library's own accessible name of the focused element: “Task: Testing Start date: 2026-06-13 End date: 2026-06-18”.
- **Chromium: matched.** Focus: row “Task: Testing Start date: 2026-06-13 End date: 2026-06-18” (level 2, selected false). Live region: nothing.
  Order: 4 ms focus row #4.
- **WebKit: matched.** Focus: row “Task: Testing Start date: 2026-06-13 End date: 2026-06-18” (level 2). Live region: nothing.
  Order: 3 ms focus row #4.

### 9.2

- **Action:** gantt-a11y is disabled. Shift+D, Shift+H, Shift+K: nothing from the extension, and Testing does not move (page `demo/index.html`).
- **Expected** (TESTING.md), in the nothing new from the extension: nothing from this extension; Shift+K does not move the task.
- **Chromium: matched.** Focus: row “Task: Testing Start date: 2026-06-13 End date: 2026-06-18” (level 2, selected false). Live region: nothing.
  Order: no focus change, no live region update.
- **WebKit: matched.** Focus: row “Task: Testing Start date: 2026-06-13 End date: 2026-06-18” (level 2). Live region: nothing.
  Order: no focus change, no live region update.

### 9.3

- **Action:** gantt-a11y was disabled and enabled again. Arrow down to “Testing” (page `demo/index.html`).
- **Expected** (TESTING.md), in the accessible name of the focused element (row label): “Testing. 13 to 18 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 3 ms focus row #4.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 5 ms focus row #4.

## Cell navigation mode

### 10.1

- **Action:** Shift+D on the “Testing” name cell (page `demo/index.html?cells=1`).
- **Expected** (recorded), in the live region: “Depends on: Implementation. Required by: Launch.”.
- **Chromium: matched.** Focus: gridcell “Testing” (level 2, selected false). Live region: “Depends on: Implementation. Required by: Launch.”.
  Order: 104 ms live “Depends on: Implementation. Required by: Launch.”.
- **WebKit: matched.** Focus: gridcell “Testing” (level 2). Live region: “Depends on: Implementation. Required by: Launch.”.
  Order: 105 ms live “Depends on: Implementation. Required by: Launch.”.
- **Not checkable here:** whether the live region text is heard after the cell, not dropped.

### 10.2

- **Action:** Shift+K on the “Testing” name cell (page `demo/index.html?cells=1`).
- **Expected** (recorded), in the live region: “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
- **Chromium: matched.** Focus: gridcell “Testing” (level 2, selected false). Live region: “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
  Order: 3 ms focus gridcell #4 → 3 ms focus gridcell #4 → 606 ms live “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
- **WebKit: matched.** Focus: gridcell “Testing” (level 2). Live region: “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
  Order: 4 ms focus gridcell #4 → 5 ms focus gridcell #4 → 607 ms live “Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early.”.
- **Not checkable here:** whether the live region text is heard after the cell, not dropped.

### 10.3

- **Action:** Shift+S on the “Implementation” name cell (page `demo/index.html?cells=1`).
- **Expected** (recorded), in the live region: “1 of 3, start to start. This depends on Implementation.”.
- **Chromium: matched.** Focus: gridcell “Documentation” (level 2, selected false). Live region: “1 of 3, start to start. This depends on Implementation.”.
  Order: 7 ms focus gridcell #5 → 605 ms live “1 of 3, start to start. This depends on Implementation.”.
- **WebKit: matched.** Focus: gridcell “Documentation” (level 2). Live region: “1 of 3, start to start. This depends on Implementation.”.
  Order: 6 ms focus gridcell #5 → 604 ms live “1 of 3, start to start. This depends on Implementation.”.
- **Not checkable here:** whether the live region text is heard after the cell, not dropped.

## Brief level

### 11.1

- **Action:** Arrow down to “Testing” (page `demo/index.html?verbosity=brief`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “Testing. 13 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Testing. 13 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 6 ms focus row #4.
- **WebKit: matched.** Focus: row “Testing. 13 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 11 ms focus row #4.

### 11.2

- **Action:** Shift+K (page `demo/index.html?verbosity=brief`).
- **Expected** (recorded), in the live region: “14 to 19 June. Conflict, Launch.”.
- **Chromium: matched.** Focus: row “Testing. 14 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “14 to 19 June. Conflict, Launch.”.
  Order: 8 ms focus row #4 → 9 ms focus row #4 → 612 ms live “14 to 19 June. Conflict, Launch.”.
- **WebKit: matched.** Focus: row “Testing. 14 June, 5 days. 40 percent done.” (level 2). Live region: “14 to 19 June. Conflict, Launch.”.
  Order: 3 ms focus row #4 → 4 ms focus row #4 → 606 ms live “14 to 19 June. Conflict, Launch.”.

### 11.3

- **Action:** Shift+P (page `demo/index.html?verbosity=brief`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “1 of 5. Launch depends on this. Testing. 13 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “1 of 5. Launch depends on this. Testing. 13 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 7 ms focus row #4.
- **WebKit: matched.** Focus: row “1 of 5. Launch depends on this. Testing. 13 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 7 ms focus row #4.

### 11.4

- **Action:** Enter. Tab to “+”, Space. Tab to “Save”, Space (page `demo/index.html?verbosity=brief`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “Saved, 1 change: duration. Conflict, Launch. Testing. 13 June, 6 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Saved, 1 change: duration. Conflict, Launch. Testing. 13 June, 6 days. 40 percent done.” (level 2, selected false). Live region: “Duration 6 days. Ends 19 June.”.
  Order: 6 ms focus textarea → 30 ms focus input → 487 ms live “Duration 6 days. Ends 19 June.” → 1038 ms focus button → 1053 ms focus row #4.
- **WebKit: matched.** Focus: row “Saved, 1 change: duration. Conflict, Launch. Testing. 13 June, 6 days. 40 percent done.” (level 2). Live region: “Duration 6 days. Ends 19 June.”.
  Order: 2 ms focus textarea → 22 ms focus input → 476 ms live “Duration 6 days. Ends 19 June.” → 1031 ms focus button → 1047 ms focus row #4.

## Detailed level

### 12.1

- **Action:** Arrow down to “Testing” (page `demo/index.html?verbosity=detailed`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 3 ms focus row #4.
- **WebKit: matched.** Focus: row “Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 4 ms focus row #4.

### 12.2

- **Action:** Shift+D (page `demo/index.html?verbosity=detailed`).
- **Expected** (recorded), in the live region: “Depends on 5. Testing, finish to start. Documentation, finish to start. Code review, finish to start. Software design, start to start. Budget approval, finish to start. Required by: Marketing prep & PR, start to finish.”.
- **Chromium: matched.** Focus: row “Launch. In Website redesign. Start 18 June 2026. End 19 June 2026. 1 day. 0 percent done.” (level 2, selected false). Live region: “Depends on 5. Testing, finish to start. Documentation, finish to start. Code review, finish to start. Software design, start to start. Budget approval, finish to start. Required by: Marketing prep & PR, start to finish.”.
  Order: 104 ms live “Depends on 5. Testing, finish to start. Documentation, finish to start. Code review, finish to start. Software design, start to start. Budget approval, finish to start. Required by: Marketing prep & PR, start to finish.”.
- **WebKit: matched.** Focus: row “Launch. In Website redesign. Start 18 June 2026. End 19 June 2026. 1 day. 0 percent done.” (level 2). Live region: “Depends on 5. Testing, finish to start. Documentation, finish to start. Code review, finish to start. Software design, start to start. Budget approval, finish to start. Required by: Marketing prep & PR, start to finish.”.
  Order: 104 ms live “Depends on 5. Testing, finish to start. Documentation, finish to start. Code review, finish to start. Software design, start to start. Budget approval, finish to start. Required by: Marketing prep & PR, start to finish.”.

### 12.3

- **Action:** Shift+K (page `demo/index.html?verbosity=detailed`).
- **Expected** (recorded), in the live region: “1 day later. Starts Sunday, 14 June 2026, ends Friday, 19 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends.”.
- **Chromium: matched.** Focus: row “Testing. In Website redesign. Start 14 June 2026. End 19 June 2026. 5 days. 40 percent done.” (level 2, selected false). Live region: “1 day later. Starts Sunday, 14 June 2026, ends Friday, 19 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends.”.
  Order: 3 ms focus row #4 → 3 ms focus row #4 → 606 ms live “1 day later. Starts Sunday, 14 June 2026, ends Friday, 19 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends.”.
- **WebKit: matched.** Focus: row “Testing. In Website redesign. Start 14 June 2026. End 19 June 2026. 5 days. 40 percent done.” (level 2). Live region: “1 day later. Starts Sunday, 14 June 2026, ends Friday, 19 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends.”.
  Order: 9 ms focus row #4 → 12 ms focus row #4 → 616 ms live “1 day later. Starts Sunday, 14 June 2026, ends Friday, 19 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends.”.

### 12.4

- **Action:** Shift+P (page `demo/index.html?verbosity=detailed`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “1 of 5, finish to start. Launch depends on this. Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “1 of 5, finish to start. Launch depends on this. Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 5 ms focus row #4.
- **WebKit: matched.** Focus: row “1 of 5, finish to start. Launch depends on this. Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 7 ms focus row #4.

### 12.5

- **Action:** Enter. Tab to “+”, Space. Tab to “Save”, Space (page `demo/index.html?verbosity=detailed`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “Saved. Duration 6 days, was 5 days. End 19 June 2026, was 18 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends. Testing. In Website redesign. Start 13 June 2026. End 19 June 2026. 6 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “Saved. Duration 6 days, was 5 days. End 19 June 2026, was 18 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends. Testing. In Website redesign. Start 13 June 2026. End 19 June 2026. 6 days. 40 percent done.” (level 2, selected false). Live region: “Duration 6 days. Ends 19 June 2026.”.
  Order: 3 ms focus textarea → 21 ms focus input → 476 ms live “Duration 6 days. Ends 19 June 2026.” → 1026 ms focus button → 1039 ms focus row #4.
- **WebKit: matched.** Focus: row “Saved. Duration 6 days, was 5 days. End 19 June 2026, was 18 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends. Testing. In Website redesign. Start 13 June 2026. End 19 June 2026. 6 days. 40 percent done.” (level 2). Live region: “Duration 6 days. Ends 19 June 2026.”.
  Order: 2 ms focus textarea → 22 ms focus input → 475 ms live “Duration 6 days. Ends 19 June 2026.” → 1028 ms focus button → 1047 ms focus row #4.

## frappe-gantt demo

### 13.1

- **Action:** Arrow down three times to “Testing” in the task list (page `demo/frappe.html`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “Testing. 13 to 17 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: nothing.
  Order: 1 ms focus option #review → 63 ms focus option #docs → 126 ms focus option #test.
- **WebKit: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: nothing.
  Order: 1 ms focus option #review → 64 ms focus option #docs → 127 ms focus option #test.

### 13.2

- **Action:** Shift+D (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “Depends on: Implementation. Required by: Launch.”.
- **Chromium: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “Depends on: Implementation. Required by: Launch.”.
  Order: 103 ms live “Depends on: Implementation. Required by: Launch.”.
- **WebKit: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “Depends on: Implementation. Required by: Launch.”.
  Order: 103 ms live “Depends on: Implementation. Required by: Launch.”.

### 13.3

- **Action:** Shift+D twice, within 5 seconds; compare the second (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “4 of 4: Budget approval. End of list.”.
- **Chromium: matched.** Focus: option “Launch. 18 June, 1 day. 0 percent done.” (selected true). Live region: “4 of 4: Budget approval. End of list.”.
  Order: 104 ms live “Depends on 4. First 3: Testing, Documentation, Code review. Press again for the next 1.” → 567 ms live “4 of 4: Budget approval. End of list.”.
- **WebKit: matched.** Focus: option “Launch. 18 June, 1 day. 0 percent done.” (selected true). Live region: “4 of 4: Budget approval. End of list.”.
  Order: 102 ms live “Depends on 4. First 3: Testing, Documentation, Code review. Press again for the next 1.” → 569 ms live “4 of 4: Budget approval. End of list.”.

### 13.4

- **Action:** Shift+O (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days.”.
- **Chromium: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days.”.
  Order: 104 ms live “2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days.”.
- **WebKit: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days.”.
  Order: 104 ms live “2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days.”.

### 13.5

- **Action:** Shift+P (page `demo/frappe.html`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: option “1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: nothing.
  Order: 2 ms focus option #test → 2 ms label change option #test.
- **WebKit: matched.** Focus: option “1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: nothing.
  Order: 3 ms focus option #test → 3 ms label change option #test.

### 13.6

- **Action:** Shift+K (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early.”.
- **Chromium: matched.** Focus: option “Testing. 14 to 18 June, 5 days. 40 percent done.” (selected true). Live region: “Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early.”.
  Order: 15 ms label change option #test → 613 ms live “Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early.”.
- **WebKit: matched.** Focus: option “Testing. 14 to 18 June, 5 days. 40 percent done.” (selected true). Live region: “Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early.”.
  Order: 24 ms label change option #test → 622 ms live “Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early.”.

### 13.7

- **Action:** Shift+K (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “Read-only. Not changed.”.
- **Chromium: matched.** Focus: option “Budget approval. 2 to 3 June, 2 days. 0 percent done.” (selected true). Live region: “Read-only. Not changed.”.
  Order: 104 ms live “Read-only. Not changed.”.
- **WebKit: matched.** Focus: option “Budget approval. 2 to 3 June, 2 days. 0 percent done.” (selected true). Live region: “Read-only. Not changed.”.
  Order: 102 ms live “Read-only. Not changed.”.

### 13.8

- **Action:** Shift+L; arrow down twice to “Retrospective”, Shift+L; compare the last (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “Linked. This depends on Marketing.”.
- **Chromium: matched.** Focus: option “Retrospective. 22 June, 1 day. 0 percent done.” (selected true). Live region: “Linked. This depends on Marketing.”.
  Order: 104 ms live “Link from Marketing. Go to the task that depends on it and press Shift L.” → 368 ms focus option #launch → 433 ms focus option #retro → 809 ms label change option #retro → 910 ms live “Linked. This depends on Marketing.”.
- **WebKit: matched.** Focus: option “Retrospective. 22 June, 1 day. 0 percent done.” (selected true). Live region: “Linked. This depends on Marketing.”.
  Order: 103 ms live “Link from Marketing. Go to the task that depends on it and press Shift L.” → 368 ms focus option #launch → 432 ms focus option #retro → 820 ms label change option #retro → 921 ms live “Linked. This depends on Marketing.”.

### 13.9

- **Action:** Shift+H (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.
- **Chromium: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.
  Order: 106 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.
- **WebKit: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.
  Order: 106 ms live “Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. Press again within 5 seconds for the next group.”.

## Orientation

### 14.1

- **Action:** Shift+V (page `demo/index.html`).
- **Expected** (recorded), in the live region: “11 tasks. 1 to 23 June. No conflicts.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “11 tasks. 1 to 23 June. No conflicts.”.
  Order: 104 ms live “11 tasks. 1 to 23 June. No conflicts.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “11 tasks. 1 to 23 June. No conflicts.”.
  Order: 102 ms live “11 tasks. 1 to 23 June. No conflicts.”.

### 14.2

- **Action:** Shift+V (Detailed level) (page `demo/index.html?verbosity=detailed`).
- **Expected** (recorded), in the live region: “11 tasks. 1 project, 1 milestone. 1 to 23 June 2026. No conflicts.”.
- **Chromium: matched.** Focus: row “Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done.” (level 2, selected false). Live region: “11 tasks. 1 project, 1 milestone. 1 to 23 June 2026. No conflicts.”.
  Order: 104 ms live “11 tasks. 1 project, 1 milestone. 1 to 23 June 2026. No conflicts.”.
- **WebKit: matched.** Focus: row “Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done.” (level 2). Live region: “11 tasks. 1 project, 1 milestone. 1 to 23 June 2026. No conflicts.”.
  Order: 105 ms live “11 tasks. 1 project, 1 milestone. 1 to 23 June 2026. No conflicts.”.

### 14.3

- **Action:** Shift+V (Testing and Code review were moved into conflicts) (page `demo/index.html`).
- **Expected** (recorded), in the live region: “11 tasks. 1 to 23 June. 2 conflicts.”.
- **Chromium: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2, selected false). Live region: “11 tasks. 1 to 23 June. 2 conflicts.”.
  Order: 111 ms live “11 tasks. 1 to 23 June. 2 conflicts.”.
- **WebKit: matched.** Focus: row “Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2). Live region: “11 tasks. 1 to 23 June. 2 conflicts.”.
  Order: 102 ms live “11 tasks. 1 to 23 June. 2 conflicts.”.

### 14.4

- **Action:** Shift+W (page `demo/index.html`).
- **Expected** (recorded), in the live region: “Testing. In Website redesign. Level 2, 3 of 10.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Testing. In Website redesign. Level 2, 3 of 10.”.
  Order: 107 ms live “Testing. In Website redesign. Level 2, 3 of 10.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Testing. In Website redesign. Level 2, 3 of 10.”.
  Order: 106 ms live “Testing. In Website redesign. Level 2, 3 of 10.”.

### 14.5

- **Action:** Shift+W (page `demo/index.html`).
- **Expected** (recorded), in the live region: “Website redesign. Top level, 1 of 1.”.
- **Chromium: matched.** Focus: row “Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.” (level 1, expanded true, selected false). Live region: “Website redesign. Top level, 1 of 1.”.
  Order: 103 ms live “Website redesign. Top level, 1 of 1.”.
- **WebKit: matched.** Focus: row “Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done.” (level 1, expanded true). Live region: “Website redesign. Top level, 1 of 1.”.
  Order: 104 ms live “Website redesign. Top level, 1 of 1.”.

### 14.6

- **Action:** Shift+C (two conflicts in the data) (page `demo/index.html`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “1 of 2. Conflict. 2 days too early: must not end before Implementation ends. Code review. 6 to 11 June, 5 days. 0 percent done.”.
- **Chromium: matched.** Focus: row “1 of 2. Conflict. 2 days too early: must not end before Implementation ends. Code review. 6 to 11 June, 5 days. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 10 ms focus row #6.
- **WebKit: matched.** Focus: row “1 of 2. Conflict. 2 days too early: must not end before Implementation ends. Code review. 6 to 11 June, 5 days. 0 percent done.” (level 2). Live region: nothing.
  Order: 10 ms focus row #6.

### 14.7

- **Action:** Shift+C twice, within 5 seconds; compare the second (page `demo/index.html`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “2 of 2. Conflict. 2 days too early: must not start before Implementation ends. Testing. 11 to 16 June, 5 days. 40 percent done.”.
- **Chromium: matched.** Focus: row “2 of 2. Conflict. 2 days too early: must not start before Implementation ends. Testing. 11 to 16 June, 5 days. 40 percent done.” (level 2, selected false). Live region: nothing.
  Order: 11 ms focus row #6 → 482 ms focus row #4.
- **WebKit: matched.** Focus: row “2 of 2. Conflict. 2 days too early: must not start before Implementation ends. Testing. 11 to 16 June, 5 days. 40 percent done.” (level 2). Live region: nothing.
  Order: 13 ms focus row #6 → 487 ms focus row #4.

### 14.8

- **Action:** Shift+C, then Shift+Z; compare the last (page `demo/index.html`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “Back to Retrospective. Retrospective. 22 to 23 June, 1 day. 0 percent done.”.
- **Chromium: matched.** Focus: row “Back to Retrospective. Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 12 ms focus row #6 → 488 ms focus row #9.
- **WebKit: matched.** Focus: row “Back to Retrospective. Retrospective. 22 to 23 June, 1 day. 0 percent done.” (level 2). Live region: nothing.
  Order: 14 ms focus row #6 → 493 ms focus row #9.

### 14.9

- **Action:** Shift+C (page `demo/index.html`).
- **Expected** (recorded), in the live region: “No conflicts.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “No conflicts.”.
  Order: 104 ms live “No conflicts.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “No conflicts.”.
  Order: 105 ms live “No conflicts.”.

### 14.10

- **Action:** Shift+P twice, then Shift+Z; compare the last (page `demo/index.html`).
- **Expected** (recorded), in the accessible name of the focused element (row label): “Back to Launch. Launch. 18 to 19 June, 1 day. 0 percent done.”.
- **Chromium: matched.** Focus: row “Back to Launch. Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2, selected false). Live region: nothing.
  Order: 13 ms focus row #4 → 476 ms focus row #5 → 943 ms focus row #7.
- **WebKit: matched.** Focus: row “Back to Launch. Launch. 18 to 19 June, 1 day. 0 percent done.” (level 2). Live region: nothing.
  Order: 7 ms focus row #4 → 492 ms focus row #5 → 980 ms focus row #7.

### 14.11

- **Action:** Shift+Z (no jump before) (page `demo/index.html`).
- **Expected** (recorded), in the live region: “Nothing to go back to.”.
- **Chromium: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2, selected false). Live region: “Nothing to go back to.”.
  Order: 104 ms live “Nothing to go back to.”.
- **WebKit: matched.** Focus: row “Testing. 13 to 18 June, 5 days. 40 percent done.” (level 2). Live region: “Nothing to go back to.”.
  Order: 101 ms live “Nothing to go back to.”.

### 14.12

- **Action:** Shift+W in the frappe-gantt demo (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “Testing. Top level, 6 of 9.”.
- **Chromium: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “Testing. Top level, 6 of 9.”.
  Order: 104 ms live “Testing. Top level, 6 of 9.”.
- **WebKit: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “Testing. Top level, 6 of 9.”.
  Order: 104 ms live “Testing. Top level, 6 of 9.”.

### 14.13

- **Action:** Shift+V in the frappe-gantt demo (page `demo/frappe.html`).
- **Expected** (recorded), in the live region: “9 tasks. 1 to 22 June. No conflicts.”.
- **Chromium: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “9 tasks. 1 to 22 June. No conflicts.”.
  Order: 103 ms live “9 tasks. 1 to 22 June. No conflicts.”.
- **WebKit: matched.** Focus: option “Testing. 13 to 17 June, 5 days. 40 percent done.” (selected true). Live region: “9 tasks. 1 to 22 June. No conflicts.”.
  Order: 104 ms live “9 tasks. 1 to 22 June. No conflicts.”.
