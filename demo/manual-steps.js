/**
 * The steps of TESTING.md as data, shared by the accessibility tree tests
 * (test-browser/a11y-tree.spec.js) and the manual test helper
 * (demo/manual-test.html).
 *
 * Every step starts from a freshly loaded demo page. `setup` brings it into
 * the state the step needs without key presses (data changes, extension off),
 * `focus` is where keyboard focus is put, `do` is what the person presses,
 * `actions` is the same for Playwright, and `expect` is what should reach the
 * screen reader.
 *
 * expect.channel:
 * - "label": the text is the accessible name of the focused element (row label);
 * - "live":  the text appears in the extension's live region;
 * - "none":  nothing new from the extension;
 * - "library": the library's own accessible name of the focused element.
 *
 * `source`: "TESTING.md" when the expected text is quoted from it; "recorded"
 * when it was recorded from the extension's output on 2026-11-16 (sections
 * that TESTING.md lists as not yet covered).
 *
 * `cannotCheck`: what the accessibility tree tests cannot tell for this step,
 * because it depends on how the screen reader speaks.
 *
 * `isNew`: an announcement added after the last check with a screen reader.
 *
 * `priority`: 1 when the order of what is heard matters most (results in the
 * row label, results after the form closes, jumps), 2 for answers in the live
 * region, 3 for the rest.
 */

const DEMO = "demo/index.html";
const FRAPPE = "demo/frappe.html";

// dhtmlx demo task ids
const T = { project: 1, design: 2, impl: 3, testing: 4, docs: 5, review: 6, launch: 7, marketing: 8, retro: 9, golive: 10, budget: 11 };

const step = (fields) => ({ page: DEMO, params: {}, setup: [], priority: 2, source: "TESTING.md", ...fields });

export const steps = [
	// 1. Row labels
	step({ id: "1.1", section: "Row labels", priority: 3, focus: T.design, do: "Arrow up to “Website redesign”", actions: ["ArrowUp"],
		expect: { channel: "label", task: T.project, text: "Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done." } }),
	step({ id: "1.2", section: "Row labels", priority: 3, focus: T.impl, do: "Arrow down to “Testing”", actions: ["ArrowDown"],
		expect: { channel: "label", task: T.testing, text: "Testing. 13 to 18 June, 5 days. 40 percent done." } }),
	step({ id: "1.3", section: "Row labels", priority: 3, focus: T.retro, do: "Arrow down to “Go-live”", actions: ["ArrowDown"],
		expect: { channel: "label", task: T.golive, text: "Go-live. Milestone, 20 June." } }),
	step({ id: "1.4", section: "Row labels", priority: 3, focus: T.golive, do: "Arrow down to “Budget approval”", actions: ["ArrowDown"],
		expect: { channel: "label", task: T.budget, text: "Budget approval. 2 to 4 June, 2 days. 0 percent done." } }),

	// 2. Dependencies
	step({ id: "2.1", section: "Dependencies", focus: T.testing, do: "Shift+D", actions: ["Shift+D"],
		expect: { channel: "live", text: "Depends on: Implementation. Required by: Launch." } }),
	step({ id: "2.2", section: "Dependencies", focus: T.launch, do: "Shift+D", actions: ["Shift+D"],
		expect: { channel: "live", text: "Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2." } }),
	step({ id: "2.3", section: "Dependencies", focus: T.launch, do: "Shift+D, then Shift+D again within 5 seconds; compare the second", actions: ["Shift+D", { wait: 400 }, "Shift+D"],
		expect: { channel: "live", text: "4 and 5 of 5: Software design, Budget approval. End of list." } }),
	step({ id: "2.4", section: "Dependencies", focus: T.launch, do: "Shift+D three times, each within 5 seconds; compare the third", actions: ["Shift+D", { wait: 400 }, "Shift+D", { wait: 400 }, "Shift+D"],
		expect: { channel: "live", text: "Depends on 5. First 3: Testing, Documentation, Code review. Required by: Marketing prep & PR, start to finish. Press again for the next 2." } }),
	step({ id: "2.5", section: "Dependencies", focus: T.retro, do: "Shift+D", actions: ["Shift+D"],
		expect: { channel: "live", text: "No dependencies." } }),

	// 3. Time questions
	step({ id: "3.1", section: "Time questions", focus: T.testing, do: "Shift+O", actions: ["Shift+O"],
		expect: { channel: "live", text: "2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days." } }),
	step({ id: "3.2", section: "Time questions", focus: T.testing, do: "Shift+B", actions: ["Shift+B"],
		expect: { channel: "live", text: "4 tasks end before this starts. Nearest: Implementation, ends 13 June. Press again for the next 3." } }),
	step({ id: "3.3", section: "Time questions", focus: T.testing, do: "Shift+B, then Shift+B again within 5 seconds; compare the second", actions: ["Shift+B", { wait: 400 }, "Shift+B"],
		expect: { channel: "live", text: "2 to 4 of 4: Code review, Software design, Budget approval. End of list." } }),
	step({ id: "3.4", section: "Time questions", focus: T.testing, do: "Shift+A", actions: ["Shift+A"],
		expect: { channel: "live", text: "3 tasks start after this ends. Nearest: Launch, starts 18 June. Press again for the next 2." } }),
	step({ id: "3.5", section: "Time questions", focus: T.testing, do: "Shift+A, then Shift+A again within 5 seconds; compare the second", actions: ["Shift+A", { wait: 400 }, "Shift+A"],
		expect: { channel: "live", text: "2 and 3 of 3: Go-live, Retrospective. End of list." } }),
	step({ id: "3.6", section: "Time questions", focus: T.retro, do: "Shift+O", actions: ["Shift+O"],
		expect: { channel: "live", text: "No tasks at the same time." } }),

	// 4. Moving along links
	step({ id: "4.1", section: "Moving along links", priority: 1, focus: T.impl, do: "Shift+S", actions: ["Shift+S"],
		expect: { channel: "label", task: T.docs, text: "1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done." } }),
	step({ id: "4.2", section: "Moving along links", priority: 1, focus: T.impl, do: "Shift+S twice; compare the second", actions: ["Shift+S", { wait: 400 }, "Shift+S"],
		expect: { channel: "label", task: T.review, text: "2 of 3, finish to finish. This depends on Implementation. Code review. 8 to 13 June, 5 days. 0 percent done." } }),
	step({ id: "4.3", section: "Moving along links", priority: 1, focus: T.impl, do: "Shift+S three times; compare the third", actions: ["Shift+S", { wait: 400 }, "Shift+S", { wait: 400 }, "Shift+S"],
		expect: { channel: "label", task: T.testing, text: "3 of 3. This depends on Implementation. Testing. 13 to 18 June, 5 days. 40 percent done." } }),
	step({ id: "4.4", section: "Moving along links", priority: 1, focus: T.impl, do: "Shift+S four times; compare the fourth", actions: ["Shift+S", { wait: 400 }, "Shift+S", { wait: 400 }, "Shift+S", { wait: 400 }, "Shift+S"],
		expect: { channel: "label", task: T.docs, text: "1 of 3, start to start. This depends on Implementation. Documentation. 5 to 15 June, 10 days. 0 percent done." } }),
	step({ id: "4.5", section: "Moving along links", priority: 1, focus: T.testing, do: "Shift+P", actions: ["Shift+P"],
		expect: { channel: "label", task: T.impl, text: "Testing depends on this. Implementation. 5 to 13 June, 8 days. 0 percent done." } }),
	step({ id: "4.6", section: "Moving along links", priority: 1, focus: T.testing, do: "Shift+P twice; compare the second", actions: ["Shift+P", { wait: 400 }, "Shift+P"],
		expect: { channel: "label", task: T.design, text: "Implementation depends on this. Software design. 1 to 5 June, 4 days. 0 percent done." } }),
	step({ id: "4.7", section: "Moving along links", priority: 1, focus: T.testing, do: "Shift+P three times; compare the third (focus stays on Software design)", actions: ["Shift+P", { wait: 400 }, "Shift+P", { wait: 400 }, "Shift+P"],
		expect: { channel: "live", task: T.design, text: "Depends on nothing." } }),
	step({ id: "4.8", section: "Moving along links", priority: 1, focus: T.launch, do: "Shift+P", actions: ["Shift+P"],
		expect: { channel: "label", task: T.testing, text: "1 of 5. Launch depends on this. Testing. 13 to 18 June, 5 days. 40 percent done." } }),
	step({ id: "4.9", section: "Moving along links", priority: 1, focus: T.launch, do: "Shift+P twice; compare the second", actions: ["Shift+P", { wait: 400 }, "Shift+P"],
		expect: { channel: "label", task: T.docs, text: "2 of 5. Launch depends on this. Documentation. 5 to 15 June, 10 days. 0 percent done." } }),
	step({ id: "4.10", section: "Moving along links", priority: 1, focus: T.launch, do: "Shift+P twice, then arrow up and down again to the same row", actions: ["Shift+P", { wait: 400 }, "Shift+P", { wait: 400 }, "ArrowUp", { wait: 300 }, "ArrowDown"],
		expect: { channel: "label", task: T.docs, text: "Documentation. 5 to 15 June, 10 days. 0 percent done." } }),

	// 5. Changing dates from the keyboard
	step({ id: "5.1", section: "Changing dates", priority: 1, focus: T.testing, do: "Shift+K once", actions: ["Shift+K"],
		expect: { channel: "live", task: T.testing, text: "Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early." } }),
	step({ id: "5.2", cannotCheck: "whether the earlier announcements of the burst are cut off and the last one is heard complete", section: "Changing dates", priority: 1, focus: T.testing, setup: [{ move: T.testing, start: "2026-06-14" }],
		do: "Quickly Shift+J three times (Testing already starts 14 June); compare the last", actions: [{ press: "Shift+J", times: 3, gap: 120 }],
		expect: { channel: "live", task: T.testing, text: "3 days earlier. Starts Thursday 11 June, ends Tuesday 16 June. Conflict. 2 days too early for Implementation." } }),
	step({ id: "5.3", cannotCheck: "whether the earlier announcements of the burst are cut off and the last one is heard complete", section: "Changing dates", priority: 1, focus: T.testing, setup: [{ move: T.testing, start: "2026-06-11" }],
		do: "Quickly Shift+K twice (Testing starts 11 June); compare the last", actions: [{ press: "Shift+K", times: 2, gap: 120 }],
		expect: { channel: "live", task: T.testing, text: "2 days later. Starts Saturday 13 June, ends Thursday 18 June. Conflict resolved." } }),
	step({ id: "5.4", section: "Changing dates", priority: 1, focus: T.testing, do: "Shift+I", actions: ["Shift+I"],
		expect: { channel: "live", task: T.testing, text: "6 days. Ends Friday 19 June. Conflict. Launch is now 1 day too early." } }),
	step({ id: "5.5", section: "Changing dates", priority: 1, focus: T.testing, setup: [{ move: T.testing, duration: 6 }],
		do: "Shift+M (Testing is 6 days)", actions: ["Shift+M"],
		expect: { channel: "live", task: T.testing, text: "5 days. Ends Thursday 18 June. Conflict resolved." } }),
	step({ id: "5.6", section: "Changing dates", focus: T.launch, do: "Shift+M", actions: ["Shift+M"],
		expect: { channel: "live", task: T.launch, text: "Already 1 day, the minimum." } }),
	step({ id: "5.7", section: "Changing dates", focus: T.budget, do: "Shift+K", actions: ["Shift+K"],
		expect: { channel: "live", task: T.budget, text: "Read-only. Not changed." } }),
	step({ id: "5.8", section: "Changing dates", focus: T.golive, do: "Shift+I", actions: ["Shift+I"],
		expect: { channel: "live", task: T.golive, text: "A milestone has no duration." } }),
	step({ id: "5.9", section: "Changing dates", priority: 1, focus: T.golive, do: "Shift+K", actions: ["Shift+K"],
		expect: { channel: "live", task: T.golive, text: "On Sunday 21 June." } }),
	step({ id: "5.10", section: "Changing dates", focus: T.project, do: "Shift+K", actions: ["Shift+K"],
		expect: { channel: "live", task: T.project, text: "Not changed. A project takes its dates from its subtasks." } }),

	// 6. The task form
	step({ id: "6.1", section: "The task form", priority: 1, focus: T.testing, do: "Enter (the form opens in the description field). Tab 6 times to “+” after the duration, Space", actions: [{ form: "open" }, { form: "inc" }],
		expect: { channel: "live", whileOpen: true, text: "Duration 6 days. Ends 19 June." } }),
	step({ id: "6.2", section: "The task form", priority: 1, focus: T.testing, do: "Enter. Tab 6 times to “+” after the duration, Space. Tab once to “Save”, Space", actions: [{ form: "open" }, { form: "inc" }, { wait: 1000 }, { form: "save" }],
		expect: { channel: "label", task: T.testing, text: "Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early. Testing. 13 to 19 June, 6 days. 40 percent done." } }),
	step({ id: "6.3", section: "The task form", priority: 1, focus: T.testing, do: "Enter. Tab 7 times to “Save”, Space", actions: [{ form: "open" }, { form: "save" }],
		expect: { channel: "label", task: T.testing, text: "Saved, no changes. Testing. 13 to 18 June, 5 days. 40 percent done." } }),
	step({ id: "6.4", section: "The task form", priority: 1, focus: T.testing, setup: [{ move: T.testing, duration: 6 }],
		do: "Enter. Cmd+A and type QA (the name). Tab once to the day list (“Days”), type 15. Wait half a second. The helper has made Testing 6 days long", actions: [{ form: "open" }, { form: "text", value: "QA" }, { form: "day", value: "15" }],
		expect: { channel: "live", whileOpen: true, text: "Start 15 June. Ends 21 June." } }),
	step({ id: "6.5", section: "The task form", priority: 1, focus: T.testing, setup: [{ move: T.testing, duration: 6 }],
		do: "As 6.4: Enter, Cmd+A, type QA, Tab, type 15. Then Tab 3 times to “−” before the duration, Space; compare what is heard after the “−”", actions: [{ form: "open" }, { form: "text", value: "QA" }, { form: "day", value: "15" }, { wait: 1000 }, { form: "dec" }],
		expect: { channel: "live", whileOpen: true, text: "Duration 5 days. Ends 20 June." } }),
	step({ id: "6.6", section: "The task form", priority: 1, focus: T.testing, setup: [{ move: T.testing, duration: 6 }],
		do: "As 6.5: Enter, Cmd+A, type QA, Tab, type 15, Tab 3 times to “−”, Space. Then Tab 3 times to “Save”, Space", actions: [{ form: "open" }, { form: "text", value: "QA" }, { form: "day", value: "15" }, { wait: 1000 }, { form: "dec" }, { wait: 1000 }, { form: "save" }],
		expect: { channel: "label", task: T.testing, text: "Saved, 3 changes: name, start, duration. Conflict. Launch is now 2 days too early. QA. 15 to 20 June, 5 days. 40 percent done." } }),
	step({ id: "6.7", section: "The task form", priority: 1, focus: T.testing, do: "Enter, then Escape", actions: [{ form: "open" }, "Escape"],
		expect: { channel: "label", task: T.testing, text: "Cancelled. Nothing changed. Testing. 13 to 18 June, 5 days. 40 percent done." } }),
	step({ id: "6.8", section: "The task form", priority: 1, focus: T.project, do: "Control+Enter (a new subtask; its form opens in the description field). Tab 7 times to “Save”, Space", actions: [{ form: "create" }, { form: "save" }],
		expect: { channel: "live", text: "Created New task. New task. 1 to 2 June, 1 day. 0 percent done." } }),
	step({ id: "6.9", section: "The task form", priority: 1, focus: T.project, do: "Control+Enter (a new subtask; its form opens), then Escape", actions: [{ form: "create" }, "Escape"],
		expect: { channel: "label", task: T.project, text: "New task discarded. Website redesign. Project, 1 to 23 June, 10 tasks. 0 percent done." } }),
	step({ id: "6.10", cannotCheck: "whether the live region text is still heard after the screen reader reads the row that gets focus", section: "The task form", priority: 1, focus: T.retro, do: "Enter, “Delete”, confirm", actions: [{ form: "open" }, { form: "delete" }, { confirm: true }],
		expect: { channel: "live", text: "Deleted Retrospective." } }),
	step({ id: "6.11", cannotCheck: "whether the live region text is still heard after the screen reader reads the row that gets focus", section: "The task form", priority: 1, focus: T.launch, do: "Enter, “Delete”, confirm", actions: [{ form: "open" }, { form: "delete" }, { confirm: true }],
		expect: { channel: "live", text: "Deleted Launch. 6 links removed." } }),
	step({ id: "6.12", section: "The task form", priority: 2, focus: T.testing, do: "Enter, “Delete”, then cancel the confirmation", actions: [{ form: "open" }, { form: "delete" }, { confirm: false }],
		expect: { channel: "none", formOpen: true, text: "the extension says nothing; the form stays open and focus goes back to “Delete”. VoiceOver may read the form again as focus comes back into it: that is the library's dialog (compare with ?a11y=off)" } }),

	// 7. Links
	step({ id: "7.1", section: "Links", focus: T.review, do: "Shift+T", actions: ["Shift+T"],
		expect: { channel: "live", text: "No task marked for a link. Press Shift L on a task first." } }),
	step({ id: "7.2", section: "Links", focus: T.review, do: "Shift+L", actions: ["Shift+L"],
		expect: { channel: "live", text: "Link from Code review. Go to the task that depends on it and press Shift L." } }),
	step({ id: "7.3", section: "Links", focus: T.review, do: "Shift+L, then Shift+T; compare the second", actions: ["Shift+L", { wait: 300 }, "Shift+T"],
		expect: { channel: "live", text: "Type: start to start." } }),
	step({ id: "7.4", section: "Links", focus: T.review, do: "Shift+L, Shift+T, arrow down to “Retrospective”, Shift+L; compare the last", actions: ["Shift+L", { wait: 300 }, "Shift+T", { wait: 300 }, "ArrowDown", "ArrowDown", "ArrowDown", { wait: 300 }, "Shift+L"],
		expect: { channel: "live", task: T.retro, text: "Linked. This depends on Code review, start to start." } }),
	step({ id: "7.5", section: "Links", focus: T.impl, do: "Shift+L; arrow down to “Testing”, Shift+L; compare the last", actions: ["Shift+L", { wait: 300 }, "ArrowDown", { wait: 300 }, "Shift+L"],
		expect: { channel: "live", task: T.testing, text: "Link not created. This already depends on Implementation." } }),
	step({ id: "7.6", section: "Links", focus: T.launch, do: "Shift+L; go to “Software design” (arrow up), Shift+L; compare the last", actions: ["Shift+L", { wait: 300 }, { focusTask: T.design }, { wait: 300 }, "Shift+L"],
		expect: { channel: "live", task: T.design, text: "Link not created. It would make a loop: Launch already depends on this." } }),
	step({ id: "7.7", section: "Links", focus: T.budget, do: "Shift+L; go to “Retrospective” (arrow up), Shift+L; compare the last", actions: ["Shift+L", { wait: 300 }, { focusTask: T.retro }, { wait: 300 }, "Shift+L"],
		expect: { channel: "live", task: T.retro, text: "Read-only. Not changed." } }),
	step({ id: "7.8", section: "Links", focus: T.docs, do: "Shift+L twice; compare the second", actions: ["Shift+L", { wait: 300 }, "Shift+L"],
		expect: { channel: "live", text: "Link cancelled." } }),
	step({ id: "7.9", section: "Links", focus: T.testing, do: "Shift+U", actions: ["Shift+U"],
		expect: { channel: "live", text: "Nothing to remove. First go to a linked task with the go-to keys." } }),
	step({ id: "7.10", section: "Links", priority: 1, focus: T.testing, do: "Shift+P (focus moves to “Implementation”), then Shift+U; compare the last", actions: ["Shift+P", { wait: 400 }, "Shift+U"],
		expect: { channel: "live", task: T.impl, text: "Press again to remove the link: Testing depends on this." } }),
	step({ id: "7.11", section: "Links", priority: 1, focus: T.testing, do: "Shift+P, Shift+U, then Shift+U again within 5 seconds; compare the last", actions: ["Shift+P", { wait: 400 }, "Shift+U", { wait: 400 }, "Shift+U"],
		expect: { channel: "live", task: T.impl, text: "Link removed. Testing no longer depends on this." } }),

	// 8. Repeat and help
	step({ id: "8.1", section: "Repeat and help", focus: T.testing, do: "Shift+P, Shift+U, Shift+U (as 7.11), then Shift+R; compare the last", actions: ["Shift+P", { wait: 400 }, "Shift+U", { wait: 400 }, "Shift+U", { wait: 400 }, "Shift+R"],
		expect: { channel: "live", text: "Link removed. Testing no longer depends on this." } }),
	step({ id: "8.2", section: "Repeat and help", focus: T.testing, do: "Shift+R (nothing pressed before on this page)", actions: ["Shift+R"],
		expect: { channel: "live", text: "Nothing to repeat." } }),
	step({ id: "8.3", section: "Repeat and help", focus: T.testing, do: "Shift+H", actions: ["Shift+H"],
		expect: { channel: "live", text: "Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key." } }),
	step({ id: "8.4", section: "Repeat and help", focus: T.testing, do: "Shift+H twice, within 5 seconds; compare the second", actions: ["Shift+H", { wait: 400 }, "Shift+H"],
		expect: { channel: "live", text: "Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key." } }),
	step({ id: "8.5", section: "Repeat and help", focus: T.testing, do: "Shift+H three times, within 5 seconds; compare the third", actions: ["Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H"],
		expect: { channel: "live", text: "Moving focus, 3 of 6. To what this depends on, Shift P key. To what depends on this, Shift S key. Next conflict, Shift C key. Back to where the jumps started, Shift Z key." } }),
	step({ id: "8.6", section: "Repeat and help", focus: T.testing, do: "Shift+H four times, within 5 seconds; compare the fourth", actions: ["Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H"],
		expect: { channel: "live", text: "Changing, 4 of 6. Earlier, Shift J key. Later, Shift K key. Longer, Shift I key. Shorter, Shift M key." } }),
	step({ id: "8.7", section: "Repeat and help", focus: T.testing, do: "Shift+H five times, within 5 seconds; compare the fifth", actions: ["Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H"],
		expect: { channel: "live", text: "Links, 5 of 6. Make a link, Shift L key. Link type, Shift T key. Remove link, Shift U key." } }),
	step({ id: "8.8", cannotCheck: "the pause after each “key”", section: "Repeat and help", focus: T.testing, do: "Shift+H six times, within 5 seconds; compare the sixth. There should be a clear pause after each “key”", actions: ["Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H", { wait: 400 }, "Shift+H"],
		expect: { channel: "live", text: "Other, 6 of 6. Repeat last, Shift R key. Help, Shift H key." } }),

	// 9. Turning it off
	step({ id: "9.1", section: "Turning it off", priority: 3, setup: [{ disable: true }], focus: T.impl, do: "gantt-a11y is disabled. Arrow down to “Testing”", actions: ["ArrowDown"],
		expect: { channel: "library", task: T.testing, text: "Task: Testing Start date: 2026-06-13 End date: 2026-06-18" } }),
	step({ id: "9.2", section: "Turning it off", priority: 3, setup: [{ disable: true }], focus: T.testing, do: "gantt-a11y is disabled. Shift+D, Shift+H, Shift+K: nothing from the extension, and Testing does not move", actions: ["Shift+D", { wait: 300 }, "Shift+H", { wait: 300 }, "Shift+K"],
		expect: { channel: "none", task: T.testing, unchanged: T.testing, text: "nothing from this extension; Shift+K does not move the task" } }),
	step({ id: "9.3", section: "Turning it off", priority: 3, setup: [{ disable: true }, { enable: true }], focus: T.impl, do: "gantt-a11y was disabled and enabled again. Arrow down to “Testing”", actions: ["ArrowDown"],
		expect: { channel: "label", task: T.testing, text: "Testing. 13 to 18 June, 5 days. 40 percent done." } }),

	// 10. Cell navigation mode (not in TESTING.md before)
	step({ id: "10.1", cannotCheck: "whether the live region text is heard after the cell, not dropped", section: "Cell navigation mode", priority: 1, source: "recorded", params: { cells: "1" }, focus: { id: T.testing, column: "text" }, do: "Shift+D on the “Testing” name cell", actions: ["Shift+D"],
		expect: { channel: "live", task: T.testing, role: "gridcell", text: "Depends on: Implementation. Required by: Launch." } }),
	step({ id: "10.2", cannotCheck: "whether the live region text is heard after the cell, not dropped", section: "Cell navigation mode", priority: 1, source: "recorded", params: { cells: "1" }, focus: { id: T.testing, column: "text" }, do: "Shift+K on the “Testing” name cell", actions: ["Shift+K"],
		expect: { channel: "live", task: T.testing, role: "gridcell", text: "Starts Sunday 14 June, ends Friday 19 June. Conflict. Launch is now 1 day too early." } }),
	step({ id: "10.3", cannotCheck: "whether the live region text is heard after the cell, not dropped", section: "Cell navigation mode", priority: 1, source: "recorded", params: { cells: "1" }, focus: { id: T.impl, column: "text" }, do: "Shift+S on the “Implementation” name cell", actions: ["Shift+S"],
		expect: { channel: "live", task: T.docs, role: "gridcell", text: "1 of 3, start to start. This depends on Implementation." } }),

	// 11. Brief level
	step({ id: "11.1", section: "Brief level", priority: 3, source: "recorded", params: { verbosity: "brief" }, focus: T.impl, do: "Arrow down to “Testing”", actions: ["ArrowDown"],
		expect: { channel: "label", task: T.testing, text: "Testing. 13 June, 5 days. 40 percent done." } }),
	step({ id: "11.2", section: "Brief level", priority: 1, source: "recorded", params: { verbosity: "brief" }, focus: T.testing, do: "Shift+K", actions: ["Shift+K"],
		expect: { channel: "live", task: T.testing, text: "14 to 19 June. Conflict, Launch." } }),
	step({ id: "11.3", section: "Brief level", priority: 1, source: "recorded", params: { verbosity: "brief" }, focus: T.launch, do: "Shift+P", actions: ["Shift+P"],
		expect: { channel: "label", task: T.testing, text: "1 of 5. Launch depends on this. Testing. 13 June, 5 days. 40 percent done." } }),
	step({ id: "11.4", section: "Brief level", priority: 1, source: "recorded", params: { verbosity: "brief" }, focus: T.testing, do: "Enter. Tab to “+”, Space. Tab to “Save”, Space", actions: [{ form: "open" }, { form: "inc" }, { wait: 1000 }, { form: "save" }],
		expect: { channel: "label", task: T.testing, text: "Saved, 1 change: duration. Conflict, Launch. Testing. 13 June, 6 days. 40 percent done." } }),

	// 12. Detailed level
	step({ id: "12.1", section: "Detailed level", priority: 3, source: "recorded", params: { verbosity: "detailed" }, focus: T.impl, do: "Arrow down to “Testing”", actions: ["ArrowDown"],
		expect: { channel: "label", task: T.testing, text: "Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done." } }),
	step({ id: "12.2", section: "Detailed level", priority: 2, source: "recorded", params: { verbosity: "detailed" }, focus: T.launch, do: "Shift+D", actions: ["Shift+D"],
		expect: { channel: "live", text: "Depends on 5. Testing, finish to start. Documentation, finish to start. Code review, finish to start. Software design, start to start. Budget approval, finish to start. Required by: Marketing prep & PR, start to finish." } }),
	step({ id: "12.3", section: "Detailed level", priority: 1, source: "recorded", params: { verbosity: "detailed" }, focus: T.testing, do: "Shift+K", actions: ["Shift+K"],
		expect: { channel: "live", task: T.testing, text: "1 day later. Starts Sunday, 14 June 2026, ends Friday, 19 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends." } }),
	step({ id: "12.4", section: "Detailed level", priority: 1, source: "recorded", params: { verbosity: "detailed" }, focus: T.launch, do: "Shift+P", actions: ["Shift+P"],
		expect: { channel: "label", task: T.testing, text: "1 of 5, finish to start. Launch depends on this. Testing. In Website redesign. Start 13 June 2026. End 18 June 2026. 5 days. 40 percent done." } }),
	step({ id: "12.5", section: "Detailed level", priority: 1, source: "recorded", params: { verbosity: "detailed" }, focus: T.testing, do: "Enter. Tab to “+”, Space. Tab to “Save”, Space", actions: [{ form: "open" }, { form: "inc" }, { wait: 1000 }, { form: "save" }],
		expect: { channel: "label", task: T.testing, text: "Saved. Duration 6 days, was 5 days. End 19 June 2026, was 18 June 2026. Conflict. Launch is now 1 day too early: must not start before Testing ends. Testing. In Website redesign. Start 13 June 2026. End 19 June 2026. 6 days. 40 percent done." } }),

	// 13. frappe-gantt demo
	step({ id: "13.1", section: "frappe-gantt demo", page: FRAPPE, priority: 3, source: "recorded", focus: "build", do: "Arrow down three times to “Testing” in the task list", actions: ["ArrowDown", "ArrowDown", "ArrowDown"],
		expect: { channel: "label", task: "test", role: "option", text: "Testing. 13 to 17 June, 5 days. 40 percent done." } }),
	step({ id: "13.2", section: "frappe-gantt demo", page: FRAPPE, source: "recorded", focus: "test", do: "Shift+D", actions: ["Shift+D"],
		expect: { channel: "live", task: "test", role: "option", text: "Depends on: Implementation. Required by: Launch." } }),
	step({ id: "13.3", section: "frappe-gantt demo", page: FRAPPE, source: "recorded", focus: "launch", do: "Shift+D twice, within 5 seconds; compare the second", actions: ["Shift+D", { wait: 400 }, "Shift+D"],
		expect: { channel: "live", task: "launch", role: "option", text: "4 of 4: Budget approval. End of list." } }),
	step({ id: "13.4", section: "frappe-gantt demo", page: FRAPPE, source: "recorded", focus: "test", do: "Shift+O", actions: ["Shift+O"],
		expect: { channel: "live", task: "test", role: "option", text: "2 tasks at the same time. Marketing, the whole time. Documentation, first 2 days." } }),
	step({ id: "13.5", section: "frappe-gantt demo", page: FRAPPE, priority: 1, source: "recorded", focus: "launch", do: "Shift+P", actions: ["Shift+P"],
		expect: { channel: "label", task: "test", role: "option", text: "1 of 4. Launch depends on this. Testing. 13 to 17 June, 5 days. 40 percent done." } }),
	step({ id: "13.6", section: "frappe-gantt demo", page: FRAPPE, priority: 1, source: "recorded", focus: "test", do: "Shift+K", actions: ["Shift+K"],
		expect: { channel: "live", task: "test", role: "option", text: "Starts Sunday 14 June, ends Thursday 18 June. Conflict. Launch is now 1 day too early." } }),
	step({ id: "13.7", section: "frappe-gantt demo", page: FRAPPE, source: "recorded", focus: "budget", do: "Shift+K", actions: ["Shift+K"],
		expect: { channel: "live", task: "budget", role: "option", text: "Read-only. Not changed." } }),
	step({ id: "13.8", section: "frappe-gantt demo", page: FRAPPE, source: "recorded", focus: "marketing", do: "Shift+L; arrow down twice to “Retrospective”, Shift+L; compare the last", actions: ["Shift+L", { wait: 300 }, "ArrowDown", "ArrowDown", { wait: 300 }, "Shift+L"],
		expect: { channel: "live", task: "retro", role: "option", text: "Linked. This depends on Marketing." } }),
	step({ id: "13.9", section: "frappe-gantt demo", page: FRAPPE, source: "recorded", focus: "test", do: "Shift+H", actions: ["Shift+H"],
		expect: { channel: "live", task: "test", role: "option", text: "Reading, 1 of 6. Dependencies, Shift D key. Same time, Shift O key. Ends before, Shift B key. Starts after, Shift A key." } }),

	// 14. Orientation (new in this version: not yet heard with a screen reader)
	step({ id: "14.1", isNew: true, section: "Orientation", source: "recorded", focus: T.testing, do: "Shift+V", actions: ["Shift+V"],
		expect: { channel: "live", text: "11 tasks. 1 to 23 June. No conflicts." } }),
	step({ id: "14.2", isNew: true, section: "Orientation", source: "recorded", params: { verbosity: "detailed" }, focus: T.testing, do: "Shift+V (Detailed level)", actions: ["Shift+V"],
		expect: { channel: "live", text: "11 tasks. 1 project, 1 milestone. 1 to 23 June 2026. No conflicts." } }),
	step({ id: "14.3", isNew: true, section: "Orientation", source: "recorded", setup: [{ move: T.testing, start: "2026-06-11" }, { move: T.review, start: "2026-06-06" }],
		focus: T.retro, do: "Shift+V (Testing and Code review were moved into conflicts)", actions: ["Shift+V"],
		expect: { channel: "live", text: "11 tasks. 1 to 23 June. 2 conflicts." } }),
	step({ id: "14.4", isNew: true, section: "Orientation", source: "recorded", focus: T.testing, do: "Shift+W", actions: ["Shift+W"],
		expect: { channel: "live", text: "Testing. In Website redesign. Level 2, 3 of 10." } }),
	step({ id: "14.5", isNew: true, section: "Orientation", source: "recorded", focus: T.project, do: "Shift+W", actions: ["Shift+W"],
		expect: { channel: "live", text: "Website redesign. Top level, 1 of 1." } }),
	step({ id: "14.6", isNew: true, section: "Orientation", priority: 1, source: "recorded", setup: [{ move: T.testing, start: "2026-06-11" }, { move: T.review, start: "2026-06-06" }],
		focus: T.retro, do: "Shift+C (two conflicts in the data)", actions: ["Shift+C"],
		expect: { channel: "label", task: T.review, text: "1 of 2. Conflict. 2 days too early: must not end before Implementation ends. Code review. 6 to 11 June, 5 days. 0 percent done." } }),
	step({ id: "14.7", isNew: true, section: "Orientation", priority: 1, source: "recorded", setup: [{ move: T.testing, start: "2026-06-11" }, { move: T.review, start: "2026-06-06" }],
		focus: T.retro, do: "Shift+C twice, within 5 seconds; compare the second", actions: ["Shift+C", { wait: 400 }, "Shift+C"],
		expect: { channel: "label", task: T.testing, text: "2 of 2. Conflict. 2 days too early: must not start before Implementation ends. Testing. 11 to 16 June, 5 days. 40 percent done." } }),
	step({ id: "14.8", isNew: true, section: "Orientation", priority: 1, source: "recorded", setup: [{ move: T.testing, start: "2026-06-11" }, { move: T.review, start: "2026-06-06" }],
		focus: T.retro, do: "Shift+C, then Shift+Z; compare the last", actions: ["Shift+C", { wait: 400 }, "Shift+Z"],
		expect: { channel: "label", task: T.retro, text: "Back to Retrospective. Retrospective. 22 to 23 June, 1 day. 0 percent done." } }),
	step({ id: "14.9", isNew: true, section: "Orientation", source: "recorded", focus: T.testing, do: "Shift+C", actions: ["Shift+C"],
		expect: { channel: "live", task: T.testing, text: "No conflicts." } }),
	step({ id: "14.10", isNew: true, section: "Orientation", priority: 1, source: "recorded", focus: T.launch, do: "Shift+P twice, then Shift+Z; compare the last", actions: ["Shift+P", { wait: 400 }, "Shift+P", { wait: 400 }, "Shift+Z"],
		expect: { channel: "label", task: T.launch, text: "Back to Launch. Launch. 18 to 19 June, 1 day. 0 percent done." } }),
	step({ id: "14.11", isNew: true, section: "Orientation", source: "recorded", focus: T.testing, do: "Shift+Z (no jump before)", actions: ["Shift+Z"],
		expect: { channel: "live", task: T.testing, text: "Nothing to go back to." } }),
	step({ id: "14.12", isNew: true, section: "Orientation", page: FRAPPE, source: "recorded", focus: "test", do: "Shift+W in the frappe-gantt demo", actions: ["Shift+W"],
		expect: { channel: "live", task: "test", role: "option", text: "Testing. Top level, 6 of 9." } }),
	step({ id: "14.13", isNew: true, section: "Orientation", page: FRAPPE, source: "recorded", focus: "test", do: "Shift+V in the frappe-gantt demo", actions: ["Shift+V"],
		expect: { channel: "live", task: "test", role: "option", text: "9 tasks. 1 to 22 June. No conflicts." } })
];

/** Page URL of a step, relative to the site root. */
export function stepUrl(item) {
	const query = new URLSearchParams(item.params).toString();
	return item.page + (query ? "?" + query : "");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits until the demo in `win` has its live region (the extension is on). */
export async function whenReady(win, item, timeout = 5000) {
	const started = Date.now();
	while (Date.now() - started < timeout) {
		const ready = item.page === FRAPPE ? !!(win.frappeGantt && win.document.querySelector('[role="option"]')) : !!(win.gantt && win.gantt.$root);
		if (ready && win.document.querySelector("[data-gantt-a11y-live]")) {
			return;
		}
		await sleep(50);
	}
	throw new Error("demo not ready: " + item.id);
}

/** True when keyboard focus in `win` is on the step's focus target. */
export function isFocused(win, target) {
	const id = typeof target === "object" ? target.id : target;
	const active = win.document.activeElement;
	const holder = active && active.closest ? active.closest("[data-task-id]") : null;
	return !!holder && holder.getAttribute("data-task-id") === String(id);
}

/** Puts keyboard focus on the target: a dhtmlx row or cell, or a frappe option. */
export async function focusTarget(win, item, target = item.focus, timeout = 5000) {
	const started = Date.now();
	while (Date.now() - started < timeout) {
		if (item.page === FRAPPE) {
			const option = win.document.querySelector(`[role="option"][data-task-id="${target}"]`);
			if (option) {
				option.focus();
			}
		} else if (typeof target === "object") {
			win.gantt.ext.keyboardNavigation.focus({ type: "taskCell", id: target.id, column: target.column });
		} else {
			win.gantt.ext.keyboardNavigation.focus({ type: "taskRow", id: target });
		}
		if (isFocused(win, target)) {
			// a focus request may still be pending in the library: check that it holds
			await sleep(250);
			if (isFocused(win, target)) {
				return;
			}
		}
		await sleep(80);
	}
	throw new Error("could not focus " + JSON.stringify(target));
}

/**
 * Brings a freshly loaded demo into the step's state without key presses:
 * data changes through the chart's public API (the extension does not speak
 * them), turning the extension off or on with the demo's own button, then
 * focus on the target.
 */
export async function prepare(win, item) {
	await whenReady(win, item);
	for (const change of item.setup) {
		if (change.move !== undefined) {
			const gantt = win.gantt;
			const task = gantt.getTask(change.move);
			if (change.start) {
				const [y, m, d] = change.start.split("-").map(Number);
				// the page's own Date: the helper runs this from another window, and gantt checks instanceof Date
				task.start_date = new win.Date(y, m - 1, d);
			}
			if (change.duration) {
				task.duration = change.duration;
			}
			task.end_date = gantt.calculateEndDate({ start_date: task.start_date, duration: task.duration, task });
			gantt.updateTask(task.id);
		}
		if (change.disable || change.enable) {
			// the demo's toggle; click() does not move focus
			win.document.getElementById("toggle").click();
		}
	}
	await focusTarget(win, item);
}
