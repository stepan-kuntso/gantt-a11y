# gantt-a11y manual test with a screen reader: VoiceOver, macOS Tahoe 26.2, speech rate medium

The full pass of [TESTING.md](../TESTING.md) with the helper page (`demo/manual-test.html`), as the helper produced it, with the run's details filled in. Code as of commit `d91064d` (after the pre-release review).

**Limits of this pass.**

- It was done by a sighted developer, the project owner, not by people who use a screen reader every day.
- "Matched" means the spoken text matched the expected text. How clear each step was by ear was not rated (the "By ear" column is empty).
- VoiceOver in Safari on macOS only. NVDA, JAWS and Windows were not tested.

**Run.**

- Date: 2026-11-19 (started 2026-11-19)
- Screen reader: VoiceOver
- macOS: Tahoe 26.2
- Browser: Safari 26.2 (user agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15)
- Speech: rate medium (VoiceOver gives no number for it)
- Accessibility tree tests used for the order: 2026-11-18 (Chromium 159.0.8154.6, WebKit 27.2)

**103 steps: 103 matched, 0 did not match, 0 skipped, 0 not done.** By ear: not rated.

## All steps

| # | Section | Result | By ear | Heard | Expected |
|---|---|---|---|---|---|
| 5.2 | Changing dates | matched |  |  | 3 days earlier. Starts Thursday 11 June, ends Tuesday 16 June. Conflict. 2 days too early for Implementation. |
| 5.3 | Changing dates | matched |  |  | 2 days later. Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved. |
| 6.10 | The task form | matched |  |  | Deleted Retrospective. |
| 6.11 | The task form | matched |  |  | Deleted Launch. 6 links removed. |
| 8.8 | Repeat and help | matched |  |  | Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key. |
| 10.1 | Cell navigation mode | matched |  |  | Depends on: Implementation. Required by: Launch. |
| 10.2 | Cell navigation mode | matched |  |  | Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early. |
| 10.3 | Cell navigation mode | matched |  |  | 1 of 3, start to start. This depends on Implementation. |
| 14.1 | Orientation | matched |  |  | 11 tasks. 1 to 23 June. No conflicts. |
| 14.2 | Orientation | matched |  |  | 11 tasks. 1 project, 1 milestone. 1 to 23 June 2026. No conflicts. |
| 14.3 | Orientation | matched |  |  | 11 tasks. 1 to 23 June. 2 conflicts. |
| 14.4 | Orientation | matched |  |  | Testing. In Website redesign. Level 2, 3 of 10. |
| 14.5 | Orientation | matched |  |  | Website redesign. Top level, 1 of 1. |
| 14.6 | Orientation | matched |  |  | 1 of 2. Conflict. 2 days too early: must not end before Implementation ends. Code review. 6 to 11 June, 5 days. 0 percent done. |
| 14.7 | Orientation | matched |  |  | 2 of 2. Conflict. 2 days too early: must not start before Implementation ends. Testing. 11 to 16 June, 5 days. 40 percent done. |
| 14.8 | Orientation | matched |  |  | Back to Retrospective. Retrospective. 22 to 23 June, 1 day. 0 percent done. |
| 14.9 | Orientation | matched |  |  | No conflicts. |
| 14.10 | Orientation | matched |  |  | Back to Launch. Launch. 18 to 19 June, 1 day. 0 percent done. |
| 14.11 | Orientation | matched |  |  | Nothing to go back to. |
| 14.12 | Orientation | matched |  |  | Testing. Top level, 6 of 9. |
| 14.13 | Orientation | matched |  |  | 9 tasks. 1 to 22 June. No conflicts. |
| 4.1 | Moving along links | matched |  |  | 1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done. |
| 4.2 | Moving along links | matched |  |  | 2 of 3, finish to finish. This depends on Implementation. Code review. 8 to 13 June, 5 days. 0 percent done. |
| 4.3 | Moving along links | matched |  |  | 3 of 3. This depends on Implementation. Testing. 13 to 18 June, 5 days. 40 percent done. |
| 4.4 | Moving along links | matched |  |  | 1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done. |
| 4.5 | Moving along links | matched |  |  | Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done. |
| 4.6 | Moving along links | matched |  |  | Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done. |
| 4.7 | Moving along links | matched |  |  | Depends on nothing. |
| 4.8 | Moving along links | matched |  |  | 1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done. |
| 4.9 | Moving along links | matched |  |  | 2 of 5. Launch depends on this. Documentation. 5 to 15 June, 10 days. 0 percent done. |
| 4.10 | Moving along links | matched |  |  | Documentation. 5 to 15 June, 10 days. 0 percent done. |
| 5.1 | Changing dates | matched |  |  | Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early. |
| 5.4 | Changing dates | matched |  |  | 6 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early. |
| 5.5 | Changing dates | matched |  |  | 5 days. Ends Thursday 18 June. Conflict resolved. |
| 5.9 | Changing dates | matched |  |  | On Sunday 21 June. |
| 6.1 | The task form | matched |  |  | Duration 6 days. Ends 19 June. |
| 6.2 | The task form | matched |  |  | Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early. Testing. 13 to 19 June, 6 days. 40 percent done. |
| 6.3 | The task form | matched |  |  | Saved, no changes. Testing. 13 to 18 June, 5 days. 40 percent done. |
| 6.4 | The task form | matched |  |  | Start 15 June. Ends 21 June. |
| 6.5 | The task form | matched |  |  | Duration 5 days. Ends 20 June. |
| 6.6 | The task form | matched |  |  | Saved, 3 changes: name, start, duration. Conflict. Launch is now 2 days too early. QA. 15 to 20 June, 5 days. 40 percent done. |
| 6.7 | The task form | matched |  |  | Cancelled. Nothing changed. Testing. 13 to 18 June, 5 days. 40 percent done. |
| 6.8 | The task form | matched |  |  | Created New task. New task. 1 to 2 June, 1 day. 0 percent done. |
| 6.9 | The task form | matched |  |  | New task discarded. Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done. |
| 7.10 | Links | matched |  |  | Press again to remove the link: Testing depends on this. |
| 7.11 | Links | matched |  |  | Link removed. Testing no longer depends on this. |
| 11.2 | Brief level | matched |  |  | 14 to 19 June. Conflict, Launch. |
| 11.3 | Brief level | matched |  |  | 1 of 5. Launch depends on this. Testing. 13 June, 5 days. 40 percent done. |
| 11.4 | Brief level | matched |  |  | Saved, 1 change: duration. Conflict, Launch. Testing. 13 June, 6 days. 40 percent done. |
| 12.3 | Detailed level | matched |  |  | 1 day later. Starts Sunday, 14 June 2026, ends Friday, 19 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends. |
| 12.4 | Detailed level | matched |  |  | 1 of 5, finish to start. Launch depends on this. Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done. |
| 12.5 | Detailed level | matched |  |  | Saved. Duration 6 days, was 5 days. End 19 June 2026, was 18 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends. Testing. In Website redesign. Start 13 June 2026. End 19 June 2026. 6 days. 40 percent done. |
| 13.5 | frappe-gantt demo | matched |  |  | 1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done. |
| 13.6 | frappe-gantt demo | matched |  |  | Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early. |
| 2.1 | Dependencies | matched |  |  | Depends on: Implementation. Required by: Launch. |
| 2.2 | Dependencies | matched |  |  | Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2. |
| 2.3 | Dependencies | matched |  |  | 4 and 5 of 5: Software design, Budget approval. End of list. |
| 2.4 | Dependencies | matched |  |  | Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2. |
| 2.5 | Dependencies | matched |  |  | No dependencies. |
| 3.1 | Time questions | matched |  |  | 2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days. |
| 3.2 | Time questions | matched |  |  | 4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3. |
| 3.3 | Time questions | matched |  |  | 2 to 4 of 4: Code review, Software design, Budget approval. End of list. |
| 3.4 | Time questions | matched |  |  | 3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2. |
| 3.5 | Time questions | matched |  |  | 2 and 3 of 3: Go-live, Retrospective. End of list. |
| 3.6 | Time questions | matched |  |  | No tasks at the same time. |
| 5.6 | Changing dates | matched |  |  | Already 1 day, the minimum. |
| 5.7 | Changing dates | matched |  |  | Read-only. Not changed. |
| 5.8 | Changing dates | matched |  |  | A milestone has no duration. |
| 5.10 | Changing dates | matched |  |  | Not changed. A project takes its dates from its subtasks. |
| 6.12 | The task form | matched |  |  | the extension says nothing; the form stays open and focus goes back to “Delete”. VoiceOver may read the form again as focus comes back into it: that is the library's dialog (compare with ?a11y=off) |
| 7.1 | Links | matched |  |  | No task marked for a link. Press Shift L on a task first. |
| 7.2 | Links | matched |  |  | Link from Code review. Go to the task that depends on it and press Shift L. |
| 7.3 | Links | matched |  |  | Type: start to start. |
| 7.4 | Links | matched |  |  | Linked. This depends on Code review, start to start. |
| 7.5 | Links | matched |  |  | Link not created. This already depends on Implementation. |
| 7.6 | Links | matched |  |  | Link not created. It would make a loop: Launch already depends on this. |
| 7.7 | Links | matched |  |  | Read-only. Not changed. |
| 7.8 | Links | matched |  |  | Link cancelled. |
| 7.9 | Links | matched |  |  | Nothing to remove. First go to a linked task with the go-to keys. |
| 8.1 | Repeat and help | matched |  |  | Link removed. Testing no longer depends on this. |
| 8.2 | Repeat and help | matched |  |  | Nothing to repeat. |
| 8.3 | Repeat and help | matched |  |  | Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. |
| 8.4 | Repeat and help | matched |  |  | Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key. |
| 8.5 | Repeat and help | matched |  |  | Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key. |
| 8.6 | Repeat and help | matched |  |  | Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key. |
| 8.7 | Repeat and help | matched |  |  | Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key. |
| 12.2 | Detailed level | matched |  |  | Depends on 5. Testing, finish to start. Documentation, finish to start. Code review, finish to start. Software design, start to start. Budget approval, finish to start. Required by: Marketing prep & PR, start to finish. |
| 13.2 | frappe-gantt demo | matched |  |  | Depends on: Implementation. Required by: Launch. |
| 13.3 | frappe-gantt demo | matched |  |  | 4 of 4: Budget approval. End of list. |
| 13.4 | frappe-gantt demo | matched |  |  | 2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days. |
| 13.7 | frappe-gantt demo | matched |  |  | Read-only. Not changed. |
| 13.8 | frappe-gantt demo | matched |  |  | Linked. This depends on Marketing. |
| 13.9 | frappe-gantt demo | matched |  |  | Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key. |
| 1.1 | Row labels | matched |  |  | Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done. |
| 1.2 | Row labels | matched |  |  | Testing. 13 to 18 June, 5 days. 40 percent done. |
| 1.3 | Row labels | matched |  |  | Go-live. Milestone, 20 June. |
| 1.4 | Row labels | matched |  |  | Budget approval. 2 to 4 June, 2 days. 0 percent done. |
| 9.1 | Turning it off | matched |  |  | Task: Testing Start date: 2026-06-13 End date: 2026-06-18 |
| 9.2 | Turning it off | matched |  |  | nothing from this extension; Shift+K does not move the task |
| 9.3 | Turning it off | matched |  |  | Testing. 13 to 18 June, 5 days. 40 percent done. |
| 11.1 | Brief level | matched |  |  | Testing. 13 June, 5 days. 40 percent done. |
| 12.1 | Detailed level | matched |  |  | Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done. |
| 13.1 | frappe-gantt demo | matched |  |  | Testing. 13 to 17 June, 5 days. 40 percent done. |
