# Study tasks

Twelve tasks for a participant who uses a screen reader, on `demo/study.html` (a project "Website redesign" with ten tasks). They turn the open questions in [ANNOUNCEMENTS.md, section 8](../ANNOUNCEMENTS.md#8-open-questions-for-user-testing) into concrete tasks; the question each one serves is in brackets.

**Reload the page before each task** unless the task says it continues: reloading restores the original plan. Expected answers are for the original plan with the extension on; [baseline.md](baseline.md) says which tasks can be done without it.

Success levels used in every task: **success** (correct, without help), **partial** (correct after a hint, or only part correct), **fail** (wrong, or given up). Time limits are guides for when to offer a hint, not cut-offs.

## 1. The size of the plan (S2)

**Ask:** "How many tasks are in this plan, and when does it start and end?"

**Expected:** 11 tasks (the project and ten tasks in it), from 1 June to 23 June. With the extension, Shift+V says "11 tasks. 1 to 23 June. No conflicts."

**Success:** both numbers and both dates right within 3 minutes. Note whether the participant found the overview key or counted rows.

## 2. Which task ends last, which takes longest (T1)

**Ask:** "Of the tasks in Website redesign, which ends last, and which takes the longest?"

**Expected:** Retrospective ends last (22 to 23 June); Documentation takes longest (10 days).

**Success:** both right. Record time, where speech was cut off, and whether the participant had to come back to rows.

## 3. What a link type means (T2, T3)

**Ask:** "What does Documentation depend on? What does that mean for when Documentation can start?"

**Expected:** It depends on Implementation, start to start: Documentation can start once Implementation has started.

**Success:** names Implementation and explains the start-to-start relation in their own words. Record the explanation verbatim and the participant's planning experience.

## 4. A dependency on the second page (T9)

**Ask:** "Does Launch depend on Budget approval?"

**Expected:** Yes. Launch depends on five tasks; Budget approval is on the second page (Shift+D again within 5 seconds).

**Success:** "yes", with Budget approval named. Record whether the participant discovered paging alone, from the hint, or not at all.

## 5. Tasks at the same time (T8)

**Ask:** "Which tasks run at the same time as Testing for its whole length, and which only for part of it?"

**Expected:** Marketing prep & PR for the whole time; Documentation only for Testing's first 2 days.

**Success:** both right, including that "first 2 days" refers to Testing's first two days.

## 6. Moving a task (T4, T17)

**Ask:** "Move Testing two days later. What day does it start now?"

**Expected:** Monday 15 June. Pressing Shift+K twice quickly gives one total: "2 days later. Starts Monday 15 June, ends Saturday 20 June. Conflict. Launch is now 2 days too early."

**Success:** Testing starts on 15 June in the chart, and the participant says so. Record whether the weekday was noticed, and whether a single press seemed to do nothing (the total comes after the presses stop).

## 7. What is wrong now (T6, T7) — continues from task 6, do not reload

**Ask:** "Is anything wrong in the plan now? Which task, and by how much?"

**Expected:** Launch is now 2 days too early (it must not start before Testing ends).

**Success:** names Launch and 2 days. Record whether the participant understood which task is in the wrong place (T7), and what they would do about it.

## 8. Finding every conflict — continues from task 7, do not reload

**Ask:** "Go to each task that has a scheduling conflict."

**Expected:** Shift+C moves focus to Launch: "Conflict. 2 days too early: must not start before Testing ends." followed by Launch's row. There is only one conflict.

**Success:** focus reaches Launch and the participant can say why it is in conflict. Record whether the key was found through help (Shift+H).

## 9. Changing a task in the form (T5, T19)

**Ask:** "Using the task's form, make Testing one day longer and save. Then tell me what changed, when Testing ends now, and which task you are on."

**Expected:** Enter opens the form; "+" next to the duration; Save. Heard: "Saved. Duration 6 days, was 5. Ends 19 June. Conflict. Launch is now 1 day too early." followed by the row. Focus is on Testing.

**Success:** all three parts: duration 6 (was 5), ends 19 June, on Testing. Record the order in which things were heard, anything missed, and, after the participant reads the row again with the screen reader's own command, whether the result in place of the name confused them (T19).

## 10. Following links and coming back (D10)

**Ask:** "Go to the task that Testing depends on, then to the task that one depends on. Then go back to Testing."

**Expected:** Shift+P to Implementation, Shift+P to Software design, Shift+Z: "Back to Testing."

**Success:** reaches Software design and returns to Testing without arrowing through the list.

## 11. Making a link (stage 7)

**Ask:** "Make Retrospective depend on Code review."

**Expected:** Shift+L on Code review, then Shift+L on Retrospective: "Linked. This depends on Code review."

**Success:** the link exists afterwards (the facilitator checks it on screen) and it goes the right way.

## 12. Where am I, found through help (T13, T11)

**Ask:** "Find out which key tells you where you are in the plan, and use it on Testing."

**Expected:** Shift+H, then Shift+H again for the second group: "Orientation, 2 of 6. Where am I, Shift W key. Overview of the chart, Shift V key." On Testing, Shift+W: "Testing. In Website redesign. Level 2, 3 of 10."

**Success:** finds and uses the key within 3 minutes. Record how many help groups were heard and whether the participant remembered other keys from them.

## Optional, if time allows

- **Levels (T10):** repeat tasks 2 and 6 with `study.html?verbosity=brief` and `?verbosity=detailed`, five minutes each. Ask which they would keep, and whether they expected their screen reader's own verbosity setting to control this.
- **Pronunciation (T12):** `docs/listen.html` probes in the participant's own setup.
