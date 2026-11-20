# Announcements: how gantt-a11y should speak

Status: design proposal, 16 November 2026. Nothing in this document is implemented by being written here; `src/strings.js` is unchanged. "Today" and "the current text" refer to the working tree as it stood that evening, including `src/core/focus-label.js`, which appeared while this document was being written.

**File paths in sections 1 to 8** (`src/strings.js`, `src/features/form.js`, `form.js`, `src/core/focus-label.js`, `live-region.js`, `strings.js`) name the code as it stood on 16 November 2026 and are left as written. The current files are `src/core/strings.js`, `src/core/engine.js` with `src/adapters/dhtmlx/adapter.js`, `src/adapters/dhtmlx/focus-label.js` and `src/adapters/dom/live-region.js`; see "Implementation notes" at the end. (Note added 20 November 2026.)

This document specifies what the extension says through its live region, in what order, how long it may take, and why. A companion page, [`listen.html`](listen.html), puts every text below into a live region so the variants can be compared by ear.

**Read this first.** The author of the extension, who also wrote this document, does not use a screen reader daily. The document therefore separates three kinds of statement, and every rule and every catalogue row carries one of these labels (a fourth, [U], was added on 20 November 2026):

- **[S] Source**: a published source says this; the reference number follows.
- **[P] Established practice**: no single authoritative source was found, but the practice is visible in shipping products or documentation, which is named.
- **[A] Assumption**: the author's reasoning. It has to be tested with screen reader users before it is treated as a rule. Section 8 says how.
- **[U] User feedback**: a person who uses a screen reader said this; where and when are given, the name is not. One person's view is not a study: it is a reason to change something, not proof that it is right for everyone. (Added 20 November 2026.)

Where no reliable source was found, the text says "not found" instead of reconstructing behaviour from memory.

**How durations were estimated.** Each duration is computed, not measured: words at 170 words per minute, numbers and spelled codes expanded to the words a synthesizer speaks, plus 0.4 s per sentence end and 0.2 s per comma or colon, rounded to half a second. The 170 words per minute figure is an assumption for an unhurried default voice. Real figures depend on the synthesizer and the user's rate, and experienced users listen much faster: a large online study found that blind and low-vision listeners had higher listening rates than sighted ones [26]. Use the numbers to compare texts with each other, not as absolute times.

---

## 1. Prior art

What existing products announce for comparable structures, and in what order, **according to the vendors' documentation** and the other cited pages. Only what those pages state is reported; none of it was tested for this project.

### 1.1 Microsoft Project (desktop and web)

| What | Reported behaviour | Ref |
|---|---|---|
| Moving between cells in the Gantt Chart view's table | The screen reader speaks the cell content first and the column name after it. | [16b] |
| Outline level | After indenting a task, JAWS says "Level 2"; after outdenting, the level one equivalent. | [16b] |
| Expanded or collapsed | Narrator says so only when focus is on a summary task. | [16b] |
| After editing a task in Team Planner | The resource name, the task name, then start and finish dates are announced. | [16a] |
| Overlap in time | In Team Planner, scheduling tasks so that they overlap produces the single word "Overallocated". | [16a] |
| Known gaps stated by Microsoft | JAWS does not announce resource or task names properly in Team Planner; JAWS announces a new column's name only after it is added. Testing was done with Narrator and JAWS; other screen readers "might work". | [16a][16b] |
| Dependencies, link lines, the bar chart pane | **Not found.** The screen reader articles describe the table part of the view. They list no shortcut for moving between bars and do not say how a link or a predecessor is announced. | [16b][16c] |

Microsoft's general documentation explains each of the four link types with a full sentence and a picture, for example that with finish-to-start the dependent task cannot begin until the other is complete, and states that finish-to-start is the default [17]. That the vendor explains the terms sentence by sentence is weak evidence that the bare terms are not self-explanatory.

### 1.2 Excel and Google Sheets

| What | Reported behaviour | Ref |
|---|---|---|
| Excel, moving between cells | The screen reader announces the cell's column and row and its content. The page does not state the order. | [18a] |
| Excel, a cell with a comment | Narrator and JAWS add a short notice about the comment after the cell's content. | [18b] |
| Google Sheets, moving between cells | Content first, then the address: a cell C4 containing a city name is read as the name followed by "C4". | [19] |
| Google Sheets, extra state | Announcements when a cell holds a link, a note or invalid data, and when focus enters a filtered range. | [19] |
| Google Sheets, on demand | A "Verbalize to screen reader" menu speaks selected information when asked. | [19] |

Pattern: **content before coordinates or headers**, and **extra state after the content**.

### 1.3 Outlook and Google Calendar

| What | Reported behaviour | Ref |
|---|---|---|
| Outlook calendar, an event | Title first, then time, date, location, organizer. | [21] |
| Outlook, conflicts or overlapping events | **Not found** in the screen reader articles that were read. | [21] |
| Google Calendar, an open event | Number shortcuts move to one field at a time without moving focus: title, date and time, guests, rooms and location, description, attachments, notifications. Google introduced them so details can be heard on demand instead of by navigating through everything. | [20a][20b] |
| Google Calendar, overlapping events | **Not found.** The help page says some views do not show every event and that a "More" control reveals the rest. | [20a] |

Pattern: **title first**, and **one field per request** for the rest.

### 1.4 Trees and treegrids in the ARIA Authoring Practices

| What | Guidance | Ref |
|---|---|---|
| Role structure | `treegrid` contains `row` elements that contain `gridcell`, `columnheader` or `rowheader`. Rows, cells, or both can be focusable. | [1] |
| Expanded or collapsed | `aria-expanded` on parent rows only, never on leaf rows. | [1][2] |
| Level and position | The example sets `aria-level` (counted from one), `aria-posinset` and `aria-setsize` on each row. The page warns that the last two were not allowed on rows in ARIA 1.1 and that support varies. | [2] |
| When the author must set them | In a tree whose nodes are not all in the DOM (dynamic loading), all three must be set on every node. | [3] |
| Virtualized rows | `aria-rowindex` with `aria-rowcount` when rows are missing from the DOM. | [1] |
| What is read | Screen readers usually switch to application mode in a grid and then speak only focusable elements and their labels. | [1] |
| What a screen reader says for level, position and state | **Not specified by the APG.** It depends on the screen reader and on user settings; NVDA, for example, has a setting for reporting an object's position in its group, such as 1 of 4. | [22] |

Consequence for this extension: level, position and expanded state should reach the user through ARIA attributes, so that the user's own screen reader settings decide how and whether they are spoken. They should not be written into announcement text by default.

### 1.5 Other Gantt components and charts

- **DHTMLX Gantt**: the accessibility guide says ARIA attributes are added and on by default, without listing them, and names no screen reader that it was tested with [33a]. What the library actually exposes on rows has to be checked in the browser's accessibility inspector; this document did not verify it.
- **Kendo UI Gantt**: according to Progress Telerik's accessibility documentation, timeline tasks are tree items with `aria-level`, and each task points to its tooltip with `aria-describedby` for details [34a]. Pattern: short name, details as description.
- **Highcharts (including Highcharts Gantt)**: according to the Highcharts API documentation, the text for a data point is a configurable format, and there is a **separate date format for screen reader users** [34b][34c]. Pattern: speech gets its own date format.
- **Research on accessible charts**: a co-design study with screen reader users argues that a chart needs structure, navigation and description at several levels of detail, so the user can move between an overview and single data points [28]. Pattern: overview first, details by navigation.

### 1.6 Verbosity in screen readers themselves

- JAWS has three verbosity levels for web content, High, Medium and Low, with Medium as the default [23].
- VoiceOver on Mac starts at a high level of detail meant for new users and lets the user change verbosity separately for speech and braille and per kind of control [24a]. A guide written by a blind VoiceOver user describes High, Medium, Low and Custom levels and a rotor for switching between them [24c].
- NVDA exposes separate switches instead of one level: position information, object descriptions, table headers, cell coordinates, symbol level [22].

Pattern: users already expect to control how much is said, and they do it in their screen reader. Anything the extension says through a live region bypasses those settings, which is the reason section 7 turns several decisions into settings.

---

## 2. Principles

### 2.1 Order and length

| # | Rule | Label |
|---|---|---|
| P1 | **Put the distinguishing words first.** In observation, screen reader users listened to the first few words of a line and moved on if it seemed irrelevant; the resulting guideline is keywords first and short sentences [25]. The APG gives the same rule for accessible names [4]. | [S] |
| P2 | **Answer first, context second.** For a reply to a command on the focused task, the first words are the answer ("Saved", "Conflict", "2 of 5", a count). The task name is context the user already has. | [A] |
| P3 | **Say the task name only when it is news**: a different task than the focused one, a task that no longer exists (deleted), or a task just created. Do not repeat the focused task's name in replies about it. | [A] |
| P4 | **Never answer with silence.** A result, an empty result and a refusal each get a short message. Messages about the result of an action are status messages and must reach assistive technology without a focus change [5]. | [S] |
| P5 | **One announcement, one thought, about 8 seconds at most.** Live-region speech cannot be replayed by the user, so it must be short and clear on first hearing [11]. Voice-interface guidance gives the same test: speakable in one or two breaths [29b]. Longer content is split into pages or moved into real, navigable content. | [S] for brevity; the 8-second figure is [A] |
| P6 | **Count before list, and cap the list.** Start a list by saying how many items it has; read a few; offer the rest on request [29a]. The cap used here is 3 names. The source's figure, about five simple items, is for voice assistants; 3 is chosen because task names are multi-word. | [S] for the pattern; the cap is [A] |
| P7 | **Every value carries its meaning.** A bare "25 August" is not understood (the author's VoiceOver finding). Either a label precedes the value ("Start 13 June") or the phrase labels itself: a range ("13 to 17 June"), a unit ("5 days"), a verb ("Ends 20 June"). | [A], from the author's testing |
| P8 | **Names, not numbers.** A dependency is spoken by task name, never by id or row number (the author's finding; the APG: convey purpose, not form [4]). | [S] |
| P9 | **Do not say what the screen reader says.** No role words, no "level 3", no "collapsed" in text when ARIA can carry it [4][2]. | [S] |
| P10 | **One word for one thing.** "End" everywhere, or "finish" everywhere; "depends on" everywhere, or "predecessor" everywhere. See 2.6. | [P]: plain-language practice; not tested here |
| P11 | **Hints are separate from facts.** "Press again for the next 3" is a hint. Hints are spoken after the fact, can be switched off, and are never needed to understand the fact. | [A] |

### 2.2 Punctuation, numbers, dates, durations

| # | Rule | Label |
|---|---|---|
| P12 | **Periods between fields, commas inside a field.** Screen readers turn commas and periods into pauses instead of speaking them [31a][24b]; the author found periods between fields necessary with VoiceOver. A sentence per field also gives braille readers visible boundaries. | [S] for the mechanism; [A] that a period per field is the right amount |
| P13 | **No brackets, dashes, slashes, arrows or other symbols to carry meaning.** How symbols are read differs between screen readers and settings; a test of common symbols found none of the major screen readers reliable across the set, and found a dash read as "dash" where "minus" was meant [31a][31b]. Write "to", "and", "percent" as words. So "13 to 17 June", not "13–17 June"; "Documentation, start to start", not "Documentation (start to start)". | [S] |
| P14 | **Dates: day number and full month name.** Never an ISO date, a numeric date or an abbreviated month in an announcement. How "2026-06-13" or "13 Jun" is pronounced depends on the speech engine and was not verified; `listen.html` has probes for exactly this. Generate with `Intl.DateTimeFormat` using `day: "numeric", month: "long"`, so the order follows the language. | [A]; prior art: a separate speech date format exists in Highcharts [34c] |
| P15 | **Year only when it is news**: when it differs from the current year or the project spans more than one year. **Weekday** in results of moving or resizing, where landing on a weekend matters; not in row labels. | [A] |
| P16 | **Speak the last day of work as the end date.** The library stores end dates non-inclusively: a task whose last day is 17 June has an end date of midnight, 18 June, and the library's own documentation shows a template that subtracts to display the inclusive date [33b]. A spoken "ends 18 June" for a task that visibly ends on the 17th is an error a listener cannot catch. | [S] for the storage model; the requirement is [A] |
| P17 | **Durations in full words with correct plurals**: "5 days", "1 day", never "5d". Unusual abbreviations get mispronounced [25], and WCAG asks for a way to learn an abbreviation's expansion [8]. | [S] |
| P18 | **Ranges with "to"; cross-month ranges repeat the month**: "13 to 17 June", "28 June to 3 July". | [A] |
| P19 | **Percent as a word with a noun**: "40 percent done". | [A] |
| P20 | **No link-type abbreviations** (FS, SS, FF, SF) in any announcement. | [S] [8][25] |

### 2.3 Polite or assertive, and collisions with focus speech

**Rule P21: every live-region announcement in the catalogue is polite. [S]** (Some results are delivered through the row's label instead; see P23.) Reasons:

1. Assertive is for time-critical information that needs immediate attention and should be used sparingly [9][11]. Everything this extension announces is the result of a key the user just pressed or the answer to a question the user just asked. Nothing arrives uninvited.
2. Interruption cannot be relied on anyway. In a 2026 comparison, JAWS with Chrome, Narrator with Edge, TalkBack and Orca treated assertive regions as polite; NVDA interrupted only for `role="alert"`; VoiceOver on macOS and iOS did interrupt [13]. A design that needs interruption to work is broken for most Windows users.
3. An assertive update can discard queued polite ones [11]. With one polite region nothing the extension says can cancel something else it said.
4. NVDA and JAWS prefix an alert with the word "Alert" [12]. Text that also starts with "Warning:" doubles the prefix. The catalogue uses the plain word "Conflict." and no alert role.

**Rule P22: reserve an assertive region, empty, for future use. [S]** One polite and one assertive region is the recommended maximum [11]. Candidates, none of which exist in the extension today: a save that fails on the server after the user has moved on; data replaced under the user by another person's edit. WCAG's AAA criterion on interruptions asks that the user be able to postpone or suppress them [6], so even these should have a setting.

**Rule P23: when focus moves, the screen reader's reading of the new focus and a live-region message compete, and with a live region the order is not under the page's control. [S]** Polite regions wait for a pause, and when that pause comes differs per screen reader [13]; a focus change can interrupt or confuse an announcement [11].

The extension has two ways to deliver a result when focus lands on a row:

- **Live region after the focus change.** The first approach, still the fallback (cell navigation) and the route for deletions. The author's test with VoiceOver and Safari, noted in `src/features/form.js`: the row label is read first and the result after it, whether the region is polite or assertive.
- **Result in the row's label** (`src/core/focus-label.js`). While a result is pending, the row's accessible name is the result, alone or followed by the normal label, until focus leaves the row. The screen reader speaks it as ordinary focus speech: first, in a known order, subject to the user's own speech and braille settings, and available again through the screen reader's own "read current item" command.

The second route removes the race, and it is a good answer to P25 and P26 because the result stays on a braille display instead of flashing past. Its costs, all **[A]** and untested outside VoiceOver:

- While the result is the label, the row has no name. Re-reading the row, by speech or braille, gives the result where the task name should be. The APG expects an accessible name to identify its element [4].
- When the result replaces the label (save, move), nothing speaks the task name or the values that did not change.
- It depends on the screen reader reading a row again when the row is re-rendered and focused. Whether NVDA and JAWS do that as VoiceOver does was not verified.
- The same template feeds the tooltip plugin, so a sighted colleague may see the result text in a tooltip (noted in the code).

Design consequences for the texts:

| Consequence | Label |
|---|---|
| The text must make sense **before, after, or instead of** the row label, because the route differs by mode and screen reader. That is why no result repeats the task name or a value that did not change. | [A] |
| On the row-label route, **the normal label follows the result** whenever the result alone does not identify the task or its new state: a jump (N1 to N3), a created task (F6), a save that changed the name, a save with three or more changes (F2). | [A] |
| The result **may stand alone** when it is complete in itself and the user has not moved: a move or resize (E1 to E3), a save of one or two fields (F1, F4). | [A] |
| On the live-region route, send the announcement **after** focus has settled (the 500 ms used for deletions). The published recommendation is a gap of roughly 350 to 500 ms between updates [11]. | [S] |
| Compose **one message and deliver it once**. A move result and its conflict are one string, not two updates [11][10]. | [S] |
| Provide **"repeat last announcement"** for everything that goes through the live region; those messages cannot otherwise be replayed [11]. | [A] |

**Rule P24: coalesce bursts. [S] for the mechanism, [A] for the numbers.** When updates arrive faster than they can be spoken, only the final state should be announced; with polite regions and rapid changes this is also what tends to happen in practice [9]. The extension already cancels a pending announcement when a new one arrives (`live-region.js`). D9 defines what the surviving announcement says.

**Note on `ariaNotify()`. [S], status to be verified.** A script API for announcements now exists; MDN lists it as newly available since September 2026, with a `priority` option that corresponds to polite and assertive, and advises combining related messages into one call [10]. Sources found during this research disagree about which browsers ship it, and a January 2026 test report planned to keep a live-region fallback [13]. Recommendation: feature-detect it later, keep the live region as the fallback, and do not change texts for it.

### 2.4 Braille

| # | Rule | Label |
|---|---|---|
| P25 | **Assume the announcement is a short-lived flash message on a braille display, or absent.** Screen readers show such messages for a few seconds, user-configurable [15][22]; NVDA showed no live regions in braille at all until 2023 [14]; in emulator tests VoiceOver's braille output lost content for polite regions [13]. | [S] |
| P26 | **Nothing may exist only in an announcement.** Every fact must also be reachable on demand in a form the user can read at their own pace: the row label, a command that can be repeated, or a dialog. | [A] |
| P27 | **The first 40 characters must carry the result.** In "Conflict. 2 days too early for Implementation." the result, "Conflict. 2 days too early", takes the first 26 characters; the whole sentence (46 characters) needs a second 40-cell line only for the task name. "Warning: Testing now starts before…" does not get to the point. (Corrected 20 November 2026: the example was described as fitting one 40-cell line.) | [A] |
| P28 | **Punctuation is text.** Braille shows it. Do not add characters to force pauses in speech (doubled periods, stray commas). | [A] |
| P29 | **Test with a braille display, not only with the on-screen braille viewers**, which do not reproduce a display user's experience [14][11]. | [S] |
| P30 | **Say once how to get help.** The first time focus lands on a task after the page has loaded, after the row label: "Press Shift H for keys." Once per page load, not at the Brief level, and it can be switched off. The first group of the spoken help ends with how to hear the next group. An NVDA user suggested both on the Program-L mailing list on 20 November 2026 [38]. Chart2Music does the same according to its documentation: when the user navigates to the chart, a description tells them that interaction is available, and the H key opens help with a list of keyboard commands [37]. (Added 20 November 2026.) | [U] [P] |

### 2.5 Translation

All [P]: these follow from how the `Intl` APIs and CLDR plural rules are built [35a][35b]; the Ukrainian examples are the author's own language.

- **Whole-sentence templates with named placeholders.** Never build a sentence by joining fragments in code; word order differs between languages.
- **Plural categories, not `one`/`other`.** English has two cardinal forms; other languages have up to six [35a]. Ukrainian needs three for days alone (1 день, 2 дні, 5 днів). `strings.units` and the `one`/`other` pairs in `strings.time` must become `Intl.PluralRules` categories.
- **Keep task names out of grammatical cases.** "Depends on Testing" becomes "Залежить від Testing" in Ukrainian, where the name would have to be in the genitive and cannot be inflected by code. A colon avoids this in every language: "Depends on: Testing" → "Залежить від: Testing". This is the reason the catalogue writes "Depends on: {name}" even for one name.
- **Prefer forms without grammatical gender or person.** "Saved." / "Збережено." instead of "{name} was saved", which needs agreement with a name of unknown gender.
- **Lists through `Intl.ListFormat`, dates through `Intl.DateTimeFormat`, numbers through `Intl.NumberFormat`.**
- **Set `lang` on the live region** when the strings' language differs from the page's, so that the screen reader can pick a matching voice.
- **Every catalogue string needs a translator note** that says what precedes and follows it in speech (for example, "spoken right after the row label").

### 2.6 Terminology

| Decision | Choice | Label |
|---|---|---|
| "Depends on / Required by" or "Predecessors / Successors" | **"Depends on" and "Required by" by default; "Predecessor" and "Successor" as a wording setting.** Microsoft's documentation for Project uses predecessor and successor throughout [17], so trained users will expect them. For everyone else the verb phrase needs no vocabulary. Today `strings.js` uses one pair in the dependency announcement and the other in navigation; whichever is chosen must be used in both (P10). | [A] |
| Spoken confusability | "Dependency" and "dependent" are close to indistinguishable in fast speech, so the plain wording never uses them as nouns: "Launch depends on this", "This depends on Implementation". | [A] |
| Link types in plain language | Not named by default. **Finish to start is not spoken**, being the default [17]. The other three are spoken by their standard names in the dependency list, and as a rule in plain words wherever a conflict is explained: "must not start before Implementation starts". The plain-wording setting replaces the names everywhere with sentences such as "Documentation starts after this starts". | [A] |
| Are "finish to start" and the others understood without explanation? | Unknown. Not by people without project-management training, in this author's expectation. Section 8, task T2. | [A] |
| Lag | Never the word "lag" by default: "at least 3 days after Implementation ends". Negative lag: "at most 2 days before Implementation ends". | [A] |
| "End" or "finish" | **"End"** for dates and verbs, because the library's field and column are labelled "End date"; "finish" survives only inside the three link-type names. Whether "ends" is heard clearly at high speech rates (it is close to "and") is an open question. | [A] |
| "Task" or the task's type | Say the type only when it is not an ordinary task: "Milestone", "Project". Use the words the application shows in its Type field, so that blind and sighted colleagues share vocabulary. | [A] |
| "Conflict" or "Warning" | **"Conflict"**: it names the thing; "warning" names only the tone and collides with the "Alert" prefix [12]. | [A] |

---

## 3. Announcement catalogue

### 3.1 How to read the table

- **Template**: exact text; `{…}` are variable parts. `{start or end}` means the word depends on the link type.
- **Example**: the template filled with the demo project's data; this is the text in `listen.html`.
- **Live**: how the text is delivered. "polite" is the polite live region. "row label, else polite" means the text is spoken as or before the row's label when focus lands on the row (2.3), and falls back to the polite live region when focus does not land there. "n/a" marks text that is neither.
- **Time**: estimated speaking time of the example (see the method above).
- **Label**: [S], [P] or [A] for the wording decision; reference numbers are in the rationale.

All rows are for the Standard verbosity level (section 5). Hints are not part of the texts; with hints on, a hint sentence follows.

| # | Situation | Template | Example | Live | Time | Label | Rationale |
|---|---|---|---|---|---|---|---|
| | **Reading on demand** | | | | | | |
| R1 | Task row label (accessible name of the row, not a live region) | `{name}. {start} to {end}, {duration}. {progress} percent done.` | “Testing. 13 to 17 June, 5 days. 40 percent done.” | n/a (focus) | 5 s | [A] | Name first; self-labelling range and unit. See Alternatives. The example speaks the last day of work (P16); by default the implementation speaks the end date as the library stores it, “Testing. 13 to 18 June, 5 days. 40 percent done.” (Implementation notes, deliberate deviation; note added 20 November 2026.) |
| R2 | Dependencies: none | `No dependencies.` | (same) | polite | 1 s | [S] | A negative answer is still an answer; never silence [5]. |
| R3 | Dependencies: one in a direction | `Depends on: {name}. Required by: {name}.` | “Depends on: Software design. Required by: Testing.” | polite | 3.5 s | [A] | Colon keeps the name in its dictionary form for translation. Default link type not spoken [17]. |
| R4 | Dependencies: 2 or 3 in a direction, one with a non-default type | `Depends on: {name}. Required by {count}. {name}. {name}, {type}. {name}, {type}.` | “Depends on: Software design. Required by 3. Testing. Documentation, start to start. Code review, finish to finish.” | polite | 8.5 s | [A] | Count before list [29a]. One sentence per item when any item carries a type. |
| R5 | Dependencies: more than 3 in a direction (first page) | `Depends on {count}. First 3: {name}, {name}, {name}.` | “Depends on 8. First 3: Implementation, Budget approval, Code review.” | polite | 5 s | [A] | Cap at 3 names [29a]; order: conflicting first, then latest to end. With hints on, "Press again for the next 3." follows. |
| R6 | Dependencies: next page (same key again within 5 seconds) | `{from} to {to} of {count}: {name}, {name}, {name}.` | “4 to 6 of 8: Documentation, Legal review, Translation.” | polite | 4 s | [A] | Position first so the user knows how much is left. |
| R7 | Dependencies: last page | `{from} and {to} of {count}: {name}, {name}. End of list.` | “7 and 8 of 8: Hosting contract, Security audit. End of list.” | polite | 5.5 s | [A] | Explicit end so that silence is not mistaken for a failure. |
| R8 | Tasks at the same time: none | `No tasks at the same time.` | (same) | polite | 2.5 s | [S] | Same as R2. |
| R9 | Tasks at the same time: 1 to 3 | `{count} tasks at the same time. {name}, {extent}. {name}, {extent}.` | “2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.” | polite | 7.5 s | [A] | Extent of overlap instead of raw dates; largest overlap first. |
| R10 | Tasks at the same time: many | `{count} tasks at the same time. {n} the whole time: {name}, {name}, {name}. {m} partly.` | “12 tasks at the same time. 3 the whole time: Marketing prep & PR, Hosting contract, Translation. 9 partly.” | polite | 8.5 s | [A] | Summary by kind of overlap first; names only for the strongest group. |
| R11 | Tasks that end before this starts / start after this ends | `{count} tasks end before this starts. Nearest: {name}, ends {date}.` | “4 tasks end before this starts. Nearest: Implementation, ends 12 June.” | polite | 5 s | [A] | The nearest one is the one that matters for scheduling; the rest on a second press. |
| R12 | Where am I (proposed command) | `In {parent}, in {grandparent}, in {root}. Level {level}.` | “In Backend, in API, in Release 2, in Website redesign. Level 5.” | polite | 5.5 s | [A] | Nearest ancestor first [25]. On demand only; the level itself belongs in aria-level [2]. |
| | **Navigation** | | | | | | |
| N1 | Jumped to a predecessor, several exist | `{n} of {total}. {origin} depends on this.` | “2 of 5. Launch depends on this.” | row label, else polite | 3.5 s | [A] | See Alternatives. |
| N2 | Jumped to a successor, several exist | `{n} of {total}. This depends on {origin}.` | “2 of 3. This depends on Implementation.” | row label, else polite | 3.5 s | [A] | Mirror of N1 with the same verb. |
| N3 | Jumped, only one exists | `{origin} depends on this.` | “Testing depends on this.” | row label, else polite | 2 s | [A] | "1 of 1" adds nothing. |
| N4 | Nothing to jump to | `Depends on nothing. / Nothing depends on this.` | “Depends on nothing.” | polite | 1.5 s | [A] | States the fact instead of an error; focus stays [7]. |
| N5 | Target exists but is filtered out | `{n} of {total}, {name}, is filtered out. Focus did not move.` | “2 of 5, Budget approval, is filtered out. Focus did not move.” | polite | 5.5 s | [A] | Names the task (the fact is still useful) and says where focus is. |
| | **Editing** | | | | | | |
| E1 | Moved by one key press | `Starts {weekday} {date}, ends {weekday} {date}.` | “Starts Sunday 14 June, ends Thursday 18 June.” | row label, else polite | 3.5 s | [A] | See Alternatives. |
| E2 | Moved by several key presses in a row (spoken once, after the last press) | `{n} days later. Starts {weekday} {date}, ends {weekday} {date}.` | “10 days later. Starts Tuesday 23 June, ends Saturday 27 June.” | row label, else polite | 5.5 s | [A] | One summary instead of ten messages [9][11]. See D9. |
| E3 | Duration changed | `{duration}. Ends {weekday} {date}.` | “6 days. Ends Thursday 18 June.” | row label, else polite | 3 s | [A] | New value first; the end date is the consequence. |
| E4 | Duration already at the minimum | `Already {duration}, the minimum.` | “Already 1 day, the minimum.” | polite | 2.5 s | [A] | Says why nothing happened [7]. |
| E5 | Task is read-only | `Read-only. Not changed.` | (same) | polite | 2 s | [A] | Reason first, then the outcome. No name: the user is on the task. |
| E6 | Task is a project (summary) task | `Not changed. A project takes its dates from its subtasks.` | (same) | polite | 4.5 s | [A] | Outcome, then the rule, so the user knows what to edit instead. |
| E7 | Duration key on a milestone | `A milestone has no duration.` | (same) | polite | 2 s | [A] | Kept from the current text, minus the name. |
| | **Conflicts** | | | | | | |
| C1 | One conflict on the task just changed (appended to E1 to E3 in the same message) | `Conflict. {amount} too early for {other}.` | “Conflict. 2 days too early for Implementation.” | row label, else polite | 3.5 s | [A] | See Alternatives. |
| C2 | One conflict on another task, caused by this change | `Conflict. {other} is now {amount} too early.` | “Conflict. Testing is now 3 days too early.” | row label, else polite | 3.5 s | [A] | The task that is now wrong is named first; the cause is the task just changed. |
| C3 | Conflict on demand or at the Detailed level: with the rule | `Conflict. {amount} too early: must not {start or end} before {other} {starts or ends}.` | “Conflict. 2 days too early: must not start before Implementation ends.” | polite | 5 s | [A] | The rule in plain words replaces the link-type name [17]. |
| C4 | The same for a link with lag | `Conflict. {amount} too early: must {start or end} at least {lag} after {other} {starts or ends}.` | “Conflict. 2 days too early: must start at least 3 days after Implementation ends.” | polite | 6 s | [A] | The lag is spoken as the rule it creates, not as the word "lag". |
| C5 | Several conflicts | `{count} conflicts. Largest: {other}, {amount} too early.` | “3 conflicts. Largest: Testing, 4 days too early.” | polite | 4 s | [A] | Count and the worst one; the full list on demand (proposed command). |
| C6 | A conflict that existed is gone after this change | `Conflict resolved.` | (same) | row label, else polite | 1 s | [A] | Confirms the fix; otherwise the user has to ask. |
| | **Task form** | | | | | | |
| F1 | Saved, one or two fields changed | `Saved. {field} {new}, was {old}. Ends {date}.` | “Saved. Duration 8 days, was 5. Ends 20 June.” | row label, else polite | 4.5 s | [A] | See Alternatives. |
| F2 | Saved, three or more fields changed | `Saved, {count} changes: {field}, {field}, {field}, {field}, {field}.` | “Saved, 5 changes: name, start, duration, progress, type.” | row label, else polite | 4.5 s | [A] | Field names only; the row label must follow, because it carries the values. |
| F3 | Saved, nothing changed | `Saved, no changes.` | (same) | row label, else polite | 1.5 s | [S] | Confirms that Save was accepted [5]. |
| F4 | Saved, a changed field is not a column in the table | `Saved. {field} {new}, was {old}.` | “Saved. Priority high, was normal.” | row label, else polite | 3 s | [A] | Always spoken with its value: the row label cannot confirm it. |
| F5 | Cancelled | `Cancelled. Nothing changed.` | (same) | row label, else polite | 2 s | [A] | Answers the worry behind Escape: did my edits go anywhere. |
| F6 | Created | `Created {name}.` | “Created Security audit.” | row label, else polite | 1.5 s | [A] | The name is new information here. |
| F7 | New task discarded | `New task discarded.` | (same) | polite | 1.5 s | [A] | Kept. |
| F8 | Deleted | `Deleted {name}.` | “Deleted Retrospective.” | polite | 1 s | [A] | The name is needed: the row no longer exists to be read. |
| F9 | Deleted a task with subtasks or links | `Deleted {name} and {count} subtasks. {count} links removed.` | “Deleted Backend and 6 subtasks. 4 links removed.” | polite | 3.5 s | [A] | Side effects a sighted user would see disappear. |
| F10 | Value changed while the form is open (plus/minus buttons) | `{field} {value}. Ends {date}.` | “Duration 6 days. Ends 18 June.” | polite | 3 s | [A] | Debounced; label before value because focus is on a button, not on the value. |
| | **Structure** | | | | | | |
| S1 | Chart is empty | `No tasks.` | (same) | n/a (description of the grid) | 1 s | [A] | Belongs in the grid's accessible description, read on entry. |
| S2 | Summary of the chart (proposed command) | `{count} tasks, {shown} shown. {start} to {end}. {conflicts} conflicts.` | “5,000 tasks, 212 shown. 1 June 2026 to 30 March 2027. 3 conflicts.” | polite | 8.5 s | [A] | The overview a sighted user gets from the scroll bar and the time scale [28]. |
| | **Help** | | | | | | |
| H1 | Keyboard help, first of three groups (quick form) | `{group}, {n} of {total}. {action}, {key}. {action}, {key}. {action}, {key}. {action}, {key}.` | “Reading, 1 of 3. Dependencies, Shift D. Same time, Shift O. Ends before, Shift B. Starts after, Shift A.” | polite | 9.5 s | [A] | At most four keys per group; action before key. The full list is a dialog. See D13. Changed on 20 November 2026 ([U] [P], P30): when there is more than one group, the first ends with `Press again within 5 seconds for the next group.`, at every level, Brief included, because help is asked for; the key is not named again because it was just pressed. |
| H2 | Help hint, the first time focus lands on a task after the page has loaded | `Press {key} for keys.` | “Press Shift H for keys.” | polite, 500 ms after focus | 2 s | [U] [P] | Added 20 November 2026, see P30. After the row label, not before it: the row's own name comes first (P1). Once per page load; not at Brief; can be switched off. |
| | **Meta** | | | | | | |
| M1 | Repeat the last announcement (proposed command) | `(the last announcement again)` | “Saved. Duration 8 days, was 5. Ends 20 June.” | polite | 4.5 s | [A] | Live-region speech cannot be replayed by the screen reader [11]. |
| M2 | Nothing to repeat | `Nothing to repeat.` | (same) | polite | 1.5 s | [A] | No silence. |

Rows over 8 seconds, and why they stay:

- **R4, R10, S2** (8.5 s): answers to an explicit question, built from independent short sentences, so stopping speech early loses only the tail. R4 is at the cap of three names with two qualifiers, the worst case for that row.
- **H1** (9.5 s): four key bindings; splitting further would turn ten keys into five or more presses. The full help is a dialog (D13).

### 3.2 Where the texts were deliberately shortened

| Cut | Saved in the example | Risk accepted |
|---|---|---|
| Task name removed from replies about the focused task (save, move, duration, errors) | 1 to 3 words per message | If the row label is not read, the task is unidentified. |
| Year removed unless it differs | 3 spoken words per date | Ambiguity in multi-year projects; rule P15 restores it there. |
| "Start date:" / "End date:" replaced by a range in the row label | about 2 s per row | Unlabelled range. |
| "finish to start" not spoken | 3 words per link | Silence must be learned as "default type". |
| The rule removed from the conflict that follows a change | about 1.5 s | The user must ask to learn which rule is broken. |
| Old-and-new values replaced by field names when 3 or more fields change | about 10 s for five fields | Values come only from the row label. |
| Names after the third replaced by a count | unbounded | The name the user wants may be on a later page. |
| "Warning:" and "now" removed from conflicts | 2 words | None identified. |

### 3.3 What the catalogue needs that the extension does not do today

These are behaviour changes, listed so the texts are not read as drop-in replacements for `strings.js`:

1. Paging: the same reading command pressed again within about 5 seconds continues the list (R6, R7, R10).
2. A list dialog for long results (D2, D13).
3. Commands that do not exist: repeat last announcement (M1), where am I (R12), conflicts of this task (C3 to C5), chart summary (S2), back to the task a jump started from (D10).
4. Ordering of dependencies by conflict and by end date instead of link order (R5).
5. Extent of overlap for concurrent tasks (R9).
6. Size of a conflict in duration units (C1), and detection that a conflict disappeared (C6).
7. A burst counter for moves (E2), and the choice per result between "result alone" and "result, then row label" (2.3).
8. Plural categories, a speech date formatter, inclusive end dates (P14 to P17, 2.5).
9. Disambiguation of duplicate task names (D4).
10. Verbosity, hints and wording settings (sections 5 and 7).

---

## 4. Alternatives for the most important announcements

For each: the scenario, two to four variants, what each puts first, whom it suits, what it risks, and the choice. Every variant is on `listen.html` under the same letter.

### 4.1 Task row label

**Scenario.** Focus lands on the task Testing: an ordinary task, 13 to 17 June 2026, 5 days, 40% complete. This text is the row's accessible name (the library builds it from gantt.templates.tooltip_text), not a live-region message.

| | Text | Time | Puts first | Suits | Risk |
|---|---|---|---|---|---|
| **A** | “Testing. Start date: 13 June 2026. End date: 17 June 2026.” | 7 s | Name, then every value behind its full field label (today's demo template). | Newcomers: each value is labelled with the same words as the form. | Longest. The year and the words "date" repeat on every row; no duration or progress. |
| **B** (chosen) | “Testing. 13 to 17 June, 5 days. 40 percent done.” | 5 s | Name, then the time span as one phrase, then duration, then progress. | Regular users who move through many rows. | "13 to 17 June" has no field label; relies on the range reading as start and end. |
| **C** | “Testing. Start 13 June. End 17 June. 5 days. 40 percent done.” | 6 s | Name, then short labelled fields, one sentence per field. | Newcomers and braille readers: one field per sentence, each with a label. | Five sentence pauses per row make fast row-by-row scanning slower. |

**Choice: B.** The name is the only part that differs on every row, so it goes first [25][4]. A range ("13 to 17 June") and a unit ("5 days") label themselves, which keeps the author's rule that no bare value is spoken, at about 70% of the length of A. C is the Detailed-level form. Assumption: that a spoken range is understood as start and end without labels.

### 4.2 Dependencies on demand (Shift+D)

**Scenario.** Focus is on Implementation. It depends on Software design (finish to start). Three tasks depend on it: Testing (finish to start), Documentation (start to start), Code review (finish to finish).

| | Text | Time | Puts first | Suits | Risk |
|---|---|---|---|---|---|
| **A** | “Depends on: Software design (finish to start). Required by: Testing (finish to start), Documentation (start to start), Code review (finish to finish).” | 9.5 s | Direction, then every name with its link type in brackets (today's text). | Users trained in project management who want every link type every time. | Longest. Brackets are not spoken reliably, so a type can attach to the wrong name; the default type is repeated. |
| **B** (chosen) | “Depends on: Software design. Required by 3. Testing. Documentation, start to start. Code review, finish to finish.” | 8.5 s | Direction and count, then names; a link type only when it is not the default finish to start. | Regular users; anyone listening for one specific name. | Silence about the type has to be learned as meaning finish to start. "Start to start" is still jargon. |
| **C** | “Starts after Software design ends. 3 tasks wait for this. Testing starts after this ends. Documentation starts after this starts. Code review ends after this ends.” | 11 s | The scheduling rule itself in plain words, one sentence per link. | Newcomers and people without project-management training. | Longest to hear in full. "Starts after it starts" is exact but easy to mishear at speed. |

**Choice: B.** Count first lets the listener decide whether to keep listening [29a]; names carry the meaning (the author's finding); finish to start is the default link type [17], so saying it each time adds words and no information. One sentence per item when any item has a qualifier keeps the type attached to its own name. C is offered as the plain-language wording setting.

### 4.3 Result of saving the task form

**Scenario.** The user changed the duration of Testing from 5 to 8 days and pressed Save. The form closes and focus returns to the row. Today the result is spoken in place of the row label; on the fallback route it follows the row label.

| | Text | Time | Puts first | Suits | Risk |
|---|---|---|---|---|---|
| **A** | “Saved Testing. Duration: 5 days to 8 days. Ends 20 June 2026.” | 6.5 s | Confirmation with the task name, then old value to new value (today's text). | Newcomers who want the full sentence. | "5 days to 8 days" sounds like a range. The name is spoken twice whenever the row label is also read. |
| **B** (chosen) | “Saved. Duration 8 days, was 5. Ends 20 June.” | 4.5 s | Confirmation word, then the new value, then the old one. | Everyone; the first word already answers "did it work". | No task name: when the result replaces the row label, nothing identifies the task. |
| **C** | “Saved, 1 change: duration.” | 2 s | Confirmation and which field changed; values are left to the row label, which must follow. | Experienced users; braille readers (fits a 40-cell line). | The user must read the row to get the new value; a wrong value typed by mistake is not echoed. |

**Choice: B.** Silence after an action is the failure the author observed, and a save result is a status message in the WCAG sense [5]. "Saved" comes first so that even an interrupted announcement confirms the action. New value before old, because the new one is the current truth; "was" removes the range ambiguity of "5 days to 8 days". The name is dropped because the user has not left the row; when the name itself changed, the row label follows the result.

### 4.4 Link conflict after a change

**Scenario.** Testing depends on Implementation (finish to start). Implementation ends 12 June. The user moved Testing two days earlier, to 11 June.

| | Text | Time | Puts first | Suits | Risk |
|---|---|---|---|---|---|
| **A** | “Warning: Testing now starts before Implementation ends.” | 3 s | A warning word, then both task names and the broken rule (today's text). | Newcomers: a full sentence with both names. | Does not say by how much. "Warning" doubles with the "Alert" prefix some screen readers add to alerts [12]. |
| **B** (chosen) | “Conflict. 2 days too early for Implementation.” | 3.5 s | Category word, then the size of the problem, then the other task. | Everyone; tells how many key presses fix it, and is short enough to follow a move result. | Does not say which rule is broken (start or end); "too early" leaves the subject implicit. |
| **C** | “Conflict. 2 days too early: must not start before Implementation ends.” | 5 s | Category word, size, then the rule in plain words with the other task. | Newcomers; anyone who asks for the conflict on demand. | Too long to append to a move result without passing 8 seconds. |
| **D** | “Conflict with Implementation. Earliest start 13 June.” | 3.5 s | Category word, the other task, then the date that fixes it. | Users who think in dates and go straight to the fix. | Hides the rule and the size; "earliest start" becomes "earliest end" for two of the four link types. |

**Choice: B.** One short category word first works like an earcon and fits the start of a braille line. "N days too early" is true for all four link types and for links with lag, so one pattern covers every case and the user never has to decode a link-type name. B is what follows a change; C is what the conflicts command and the Detailed level speak.

### 4.5 Tasks at the same time (Shift+O)

**Scenario.** Focus is on Testing, 13 to 17 June. Marketing prep & PR runs 10 to 18 June; Documentation runs 5 to 14 June.

| | Text | Time | Puts first | Suits | Risk |
|---|---|---|---|---|---|
| **A** | “2 tasks at the same time: Documentation, Marketing prep & PR.” | 4.5 s | Count, then names in start order (today's text). | Quick check of who else is active. | Says nothing about how much they overlap; a one-day and a full overlap sound the same. |
| **B** (chosen) | “2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.” | 7.5 s | Count, then names with the extent of overlap, largest overlap first. | Everyone; answers "how much" without date arithmetic. | "First 2 days" is relative to the focused task, which has to be understood once. |
| **C** | “2 tasks at the same time. Documentation, 5 to 14 June. Marketing prep & PR, 10 to 18 June.” | 8.5 s | Count, then names with their own dates. | Users who want raw dates and will compare them themselves. | The listener has to compute the overlap in their head while the next item is already being spoken. |

**Choice: B.** A sighted user sees the extent of overlap at a glance, so the extent is the information to speak, not the raw dates. Largest overlap first puts the most relevant task where an impatient listener will still hear it [25].

### 4.6 Moving a task with the keyboard (Alt+Shift+Right)

**Scenario.** The user moves Testing one day later: from 13 to 17 June to 14 to 18 June.

| | Text | Time | Puts first | Suits | Risk |
|---|---|---|---|---|---|
| **A** | “Testing moved to 14 June 2026, ends 18 June 2026.” | 5.5 s | Task name, the verb, then start and end with the year (today's text). | Newcomers; a complete sentence. | Name and year repeat on every key press; four words pass before the first new fact. |
| **B** (chosen) | “Starts Sunday 14 June, ends Thursday 18 June.” | 3.5 s | The new start with its weekday, then the new end. | Everyone; the weekday exposes a move onto a weekend. | Does not say how far the task moved. |
| **C** | “1 day later. 14 to 18 June.” | 3.5 s | The size and direction of the move, then the new span. | Experienced users; the shortest form. | No weekday; "14 to 18 June" unlabelled. |

**Choice: B.** The user pressed the key and is focused on the task, so name and verb are known; the new start is the news. For a burst of presses the chosen form gains C's first sentence as a summary (see D9).

### 4.7 Go to predecessor (Shift+P) when there are several

**Scenario.** Launch depends on five tasks. The user presses Shift+P a second time; focus moves to the second of them and the screen reader reads that row.

| | Text | Time | Puts first | Suits | Risk |
|---|---|---|---|---|---|
| **A** | “Predecessor 2 of 5, finish to start.” | 3 s | The relation as a noun, position, then link type (today's text). | Users who know the term predecessor. | Does not say whose predecessor; after a few jumps the starting task is forgotten. |
| **B** (chosen) | “2 of 5. Launch depends on this.” | 3.5 s | Position, then the relation as a sentence that names the task the user started from. | Everyone; no jargon, and the origin is restated. | The link type is left out unless it is unusual. |
| **C** | “Predecessor 2 of 5 of Launch.” | 2.5 s | The relation as a noun, position, then the origin. | Users who chose project-management wording. | "Of 5 of Launch" is awkward to hear. |

**Choice: B.** The new row's own label is read after this text, so the text only adds what the row cannot say: position in the set and what the set is. Naming the origin matters because the next press continues around the origin's list.


---

## 5. Verbosity levels

**Are three levels needed?** The pattern is familiar to users: JAWS and VoiceOver both have three [23][24c]. The argument against is cost: every level multiplies the texts to translate and test. The proposal is three levels defined by **rules applied to the same templates**, not three sets of strings, plus a separate switch for hints. Whether users want this inside one component, in addition to their screen reader's own verbosity, is open (section 8, T10). All of this section is **[A]**.

| | Brief | Standard (default) | Detailed |
|---|---|---|---|
| For | Daily users who know the chart | Everyone until they choose | New users; careful review |
| Row label | “Testing. 13 June, 5 days.” (3 s) | “Testing. 13 to 17 June, 5 days. 40 percent done.” (5 s) | “Testing. Start 13 June. End 17 June. 5 days. 40 percent done.” (6 s) |
| Names in a list before "and more" | 3 | 3 | 5 |
| Link types | Only non-default | Only non-default | Always, as plain sentences |
| Save | “Saved, 1 change: duration.” (2 s) | “Saved. Duration 8 days, was 5. Ends 20 June.” (4.5 s) | “Saved. Duration 8 days, was 5 days. End 20 June, was 17 June.” (6 s) Every change with old and new value, at most two changes per message |
| Move | “14 to 18 June.” (2 s) | “Starts Sunday 14 June, ends Thursday 18 June.” (3.5 s) | “1 day later. Starts Sunday 14 June, ends Thursday 18 June.” (5 s) |
| Conflict after a change | “Conflict, Implementation.” (1.5 s) | “Conflict. 2 days too early for Implementation.” (3.5 s) | “Conflict. 2 days too early: must not start before Implementation ends. Earliest start 13 June.” (6.5 s) |
| Weekday in edit results | No | Yes | Yes |
| Year | Only when different | Only when different | Always |
| Parent name in row label | No | No | Yes |
| Errors | “Read-only.” (1 s) | “Read-only. Not changed.” (2 s) | “Read-only. Not changed. Ask the project owner to unlock it.” (5 s) (application-supplied advice) |

Not affected by level: counts, the first word of results ("Saved", "Conflict", "Created", "Deleted"), and refusals. A Brief user must still learn that something failed.

**Hints** (how to get more, which key to press) are a separate on/off switch, on by default, and each distinct hint is spoken at most three times per session and then drops out by itself. The decay is an assumption modelled on the idea that hints are for learning.

---

## 6. Edge cases

Each case gives the text, its estimated time, and the reasoning. The five cases the brief marks as most important (D2, D6, D7, D8, D9) are worked through in most detail. Everything here is **[A]** unless a reference is given.

### D1. Deep nesting

A task on level 5 with four ancestors.

- **Row label: no ancestors.** “Rate limiting. 13 to 17 June, 5 days. 40 percent done.” (5.5 s). The level belongs in `aria-level`, where the user's screen reader decides how to say it [2]. Naming four ancestors on every row would put 8 or more words before or after the name on every arrow press.
- **Parent only, at the Detailed level**: “Rate limiting. In Backend. 13 to 17 June, 5 days. 40 percent done.” (6.5 s).
- **All ancestors on demand** ("where am I"), nearest first: “In Backend, in API, in Release 2, in Website redesign. Level 5.” (5.5 s). Nearest first because the nearest ancestor is the most likely answer to "what is this part of" (P1). File paths and breadcrumbs go the other way (“Website redesign, Release 2, API, Backend. Level 5.” (4 s)); this is a real choice to test, not a settled one.
- More than five ancestors: the nearest three, then "and 4 more levels up", with a second press for the rest.

### D2. Many dependencies

**The limit.** Up to 3 names in one direction are spoken in full. From 4 upward the announcement gives the count and the first 3. Reasoning: a voice-design source recommends opening a list with its count, keeping simple one-word items to about five, reading long items one at a time, and paging the rest with "more" [29a]. Task names are usually two to five words, so three names already take 4 to 6 seconds. Screen reader users are faster and more practised listeners than voice-assistant customers [26], so the limit may be too low; it is a setting (section 7).

| Count | Text | Time |
|---|---|---|
| 0 | “No dependencies.” | 1 s |
| 1 | “Depends on: Software design.” | 2 s |
| 3 | “Depends on 3: Software design, Budget approval, Code review.” | 4 s |
| 8, first press | “Depends on 8. First 3: Implementation, Budget approval, Code review.” | 5 s |
| 8, second press | “4 to 6 of 8: Documentation, Legal review, Translation.” | 4 s |
| 8, third press | “7 and 8 of 8: Hosting contract, Security audit. End of list.” | 5.5 s |
| 25 | “Depends on 25. Last to end: Security audit, 12 June. 1 in conflict: Legal review.” | 7.5 s |

**Which three first.** Not link order (creation order means nothing to the listener). First any dependency in conflict, then the ones that end last, because the predecessor that ends last is the one that decides when this task can start.

**When both directions are long**, the first press covers "Depends on" only and ends with the count of the other direction: "Required by 6." The second direction has its own pages.

**Access to the rest**, in order of cost:

1. **Press the same key again** within about 5 seconds for the next three. "Press twice" is an established convention in screen readers; NVDA uses a second press of the same command to spell what it just read [36]. After the last page the next press starts over.
2. **Walk them one at a time** with go-to-predecessor (Shift+P), which already cycles around the list and says "2 of 8".
3. **A list dialog** from 10 upward: a real dialog with a heading and a list, one task per item ("Legal review. Ends 10 June. In conflict."), which the user reads at their own speed with ordinary screen reader commands and on a braille display, and from which Enter jumps to the task. Long or structured content does not belong in a live region: it is flattened to plain text and cannot be re-read [11]. This is the only form that works for 25.

**For 25 the first press does not list names at all.** It gives the count and the two facts a sighted user would look for in a fan of 25 link lines: which one drives the start, and whether any is broken. For comparison, `listen.html` includes all 25 names in one message (23.5 s).

### D3. Many columns

- **Row focus (the default mode): the row label does not grow with the number of columns.** With 4, 10 or 20 columns it stays name, time span, duration, progress. The products surveyed read one cell or one field per step, not whole records [16b][19][20a].
- **Cell focus (`keyboard_navigation_cells`)**: the cell's value. If the grid exposes column headers in its markup, the screen reader adds the header according to the user's settings [22] and the text must not repeat it. If it does not, value first and column name after, as Microsoft Project and Google Sheets do [16b][19]: “Anna Kowalska, Owner” (1.5 s).
- **Everything else on demand** ("row details"): columns in table order as "label value" sentences, four per message, pressed again for more: “Details, 1 of 3. Owner Anna Kowalska. Priority high. Status in review. Budget 12,000 euros.” (8 s). Here the label comes first because the user is hearing a list of different fields, not moving down one column.
- Columns already in the row label are skipped in the details.

### D4. Long names, HTML, emoji, codes

- **In its own row label a name is never cut.** It is the task's identity, and the listener can stop speech at any moment.
- **Inside lists, a name is cut after 6 words** at a word boundary: “Depends on 2: Migrate customer accounts from the legacy, Budget approval.” (4.5 s). Listeners judge by the first words [25]. Risk: two long names with the same first six words become identical; then the duplicate rule below applies.
- **HTML**: reduce to text (the extension does). All character references should be decoded, not only the six handled today, and `<br>` and block boundaries should become a space. Images inside a name contribute their `alt` text or nothing.
- **Emoji**: screen readers speak an emoji by its name, and the names differ between screen readers [32a][32b]. In the row label leave the name as written; it is the user's content. In lists drop a leading emoji so the distinguishing word comes first: “Depends on 2: Launch, Testing.” (2.5 s).
- **Codes ("PRJ-1423")**: leave untouched by default. How a synthesizer reads the code varies and was not verified; `listen.html` has probes. A team that puts a code at the start of every name pushes the distinguishing words back on every row, so a setting moves it to the end: “Fix login, PRJ-1423. 13 to 17 June, 5 days.” (6 s). Never drop it: people search by it.
- **Duplicate names**: when two tasks in one announcement have the same name, add the parent: “Depends on 2: Testing in Backend, Testing in Mobile app.” (4.5 s). The APG asks for names that are unique among items of the same kind [4].
- **Empty name**: "Unnamed task" plus the row's position.

### D5. Special kinds of task

| Case | Text | Time | Note |
|---|---|---|---|
| No dates | “Translation. Not scheduled.” | 2 s | Time queries skip it and say so: "1 task has no dates." |
| Zero duration, ordinary task | “Sign-off. 20 June, no duration.” | 3 s | One date, not a range from a day to the same day. |
| Milestone | “Go-live. Milestone, 20 June.” | 3 s | Name first, type second; the type explains the missing duration. |
| Project (summary) | “Website redesign. Project, 1 to 22 June, 10 tasks. 35 percent done.” | 6.5 s | The count of contained tasks replaces the duration. |
| Collapsed parent | The same text; "collapsed" comes from `aria-expanded` [1]. | | The count tells what is hidden. |
| Collapsed parent hiding a conflict | “Website redesign. Project, 1 to 22 June, 10 tasks. 35 percent done. 2 conflicts inside.” | 8 s | Otherwise a conflict is unreachable without opening every branch. |

In lists a milestone is introduced by its type: "milestone Go-live, on 15 June".

### D6. Tasks at the same time

**What to exclude.** The task itself, its ancestors and its descendants (the extension does this). Proposal: also project (summary) tasks from other branches, because a summary bar overlaps everything under it and adds a name without adding a fact.

**How to say how much they overlap.** In words relative to the focused task, in the chart's duration unit:

| Overlap | Phrase |
|---|---|
| The other task covers all of this one | "the whole time" |
| It covers the beginning of this one | "first 2 days" |
| It covers the end of this one | "last 3 days", "last day" |
| It lies inside this one | "2 days in the middle" |
| A milestone inside | "milestone Go-live, on 15 June" |

Days are counted the way durations are counted in the chart (working days if the chart uses a work calendar). No percentages: "40 percent of the time" requires arithmetic to become days.

| Count | Text | Time |
|---|---|---|
| 0 | “No tasks at the same time.” | 2.5 s |
| 1 | “1 task at the same time: Documentation, first 2 days.” | 4.5 s |
| 2 | “2 tasks at the same time. Marketing prep & PR, the whole time. Documentation, first 2 days.” | 7.5 s |
| 12, first press | “12 tasks at the same time. 3 the whole time: Marketing prep & PR, Hosting contract, Translation. 9 partly.” | 8.5 s |
| 12, second press | “Partly, 1 to 3 of 9: Documentation, first 2 days. Code review, 2 days in the middle. Launch, last day.” | 9.5 s |

**Order**: whole-time overlaps first, then by length of overlap, longest first. Today's order is by start date.

**For 12**, the first message groups by kind of overlap. A sighted user looking at twelve parallel bars sees at once which run alongside for the full length and which only touch; that grouping is the summary. From about 10 upward the list dialog from D2 is the better tool. The 12-task second press is at 9.5 s; it stays because each of its three sentences is complete on its own.

**Prior art for the one-word version**: according to Microsoft's support article, Project says only "Overallocated" when tasks overlap in Team Planner [16a]. That is a different question (one person, too much work), but it shows a shipped product answering overlap with a state word and leaving the detail to navigation.

### D7. Link conflicts after a change

**One pattern for all four link types.** In every type the conflict is the same fact: a date of the dependent task comes before the date the link allows. So the task is "too early", by an amount:

| Link type | Short form after a change | Full form on demand |
|---|---|---|
| Finish to start | “Conflict. 2 days too early for Implementation.” | “Conflict. 2 days too early: must not start before Implementation ends.” |
| Start to start | same pattern | “Conflict. 1 day too early: must not start before Implementation starts.” |
| Finish to finish | same pattern | “Conflict. 3 days too early: must not end before Implementation ends.” |
| Start to finish | same pattern | “Conflict. 1 day too early: must not end before Launch starts.” |
| With lag | same pattern | “Conflict. 2 days too early: must start at least 3 days after Implementation ends.” |
| With lead | same pattern | “Conflict. 1 day too early: may start at most 2 days before Implementation ends.” |

The short form takes 3.5 s; the full forms 5 s to 6 s.

**Why the short form after a change.** The conflict is appended to the result of the change in the same message, because two updates in quick succession can collide or be dropped [11]: “Starts Thursday 11 June, ends Monday 15 June. Conflict. 2 days too early for Implementation.” (6.5 s). With the full form that message passes 8 seconds, and a burst summary with a conflict comes close to 10. The short form still gives what the user needs to act: something is wrong, with which task, and by how many days, which for a move is also the number of key presses that fixes it.

**Which task is the subject.** The task the user just changed is implicit. When the change breaks a link on another task, that task is named first: “Conflict. Testing is now 3 days too early.” (3.5 s).

**Several conflicts**: “3 conflicts. Largest: Testing, 4 days too early.” (4 s). Count first, then the largest. The list is on demand through a conflicts command, one sentence per conflict in the full form, three per page.

**When a conflict goes away**: “Starts Saturday 13 June, ends Wednesday 17 June. Conflict resolved.” (4.5 s). Without it, the user who moved a task to fix a conflict has to ask whether it worked.

**Are the link-type names understood?** The design avoids needing an answer: no conflict text contains a link-type name. For comparison, `listen.html` includes a jargon version (“Conflict: finish-to-start link from Implementation violated by 2 days.”). Microsoft's own help explains each type with a sentence [17]. Whether "start to start" in the dependency list is understood is task T2.

**Politeness**: polite (2.3). The conflict is the consequence of the key the user just pressed and travels with that key's result.

**Not a prompt.** The announcement never asks a question ("Move back?") because a live region cannot take an answer, and voice guidance warns that a listener has only seconds to respond to spoken options [29a].

### D8. Saving the form

After Save the form closes and focus returns to the row. Depending on the delivery route (2.3) the result is heard instead of the row label, before it, or after it. The texts are written to work in all three positions (rule P23).

| Case | Text | Time | Reasoning |
|---|---|---|---|
| One field | “Saved. Duration 8 days, was 5. Ends 20 June.” | 4.5 s | New value, then old. The end date is spoken because it changed as a consequence. |
| Two fields | “Saved. Start 15 June, was 13 June. Progress 60 percent, was 40.” | 6 s | Still one message under 8 s. |
| Five fields | “Saved, 5 changes: name, start, duration, progress, type.” | 4.5 s | Five old-and-new pairs would take about 15 s. The row label must follow this message, because it is what carries the new values. |
| Five fields, Detailed | “Saved, 5 changes. Name Acceptance testing, was Testing. Start 15 June, was 13 June.” then “Duration 8 days, was 5. Progress 60 percent, was 40. Type project, was task.” | 6.5 s + 6.5 s | Two messages; the second is sent only after a pause, and is what the repeat command pages through. |
| Nothing changed | “Saved, no changes.” | 1.5 s | The user pressed Save and must hear that it was accepted [5]. |
| Field that is not a column | “Saved. Priority high, was normal.” | 3 s | Always with its value, even among five changes: the row label cannot confirm it. |
| Save caused a conflict | “Saved. Start 11 June, was 13 June. Conflict. 2 days too early for Implementation.” | 6.5 s | One message (P23). |
| Save refused by validation | “Not saved. Name is empty.” | 2.5 s | The item in error is identified and described in text [7]. Focus should go to the field. |

**"Was", not "to".** Today's "Duration: 5 days to 8 days" is heard as a range. "8 days, was 5" cannot be.

**The threshold of three.** One or two changes are spoken with values, three or more as field names followed by the row label. Changes to fields outside the table are always spoken with values and do not count toward the three.

**A changed name** is always followed by the row label, so the new name is heard as the row's name and not only as a value.

**Consequential changes.** If the user changed the duration and the end date moved, the end date is not a second "change"; it is spoken once as "Ends 20 June".

**Cancel**: “Cancelled. Nothing changed.” **Delete**: “Deleted Retrospective.” with the name, because the row is gone and the screen reader will read a different row next.

### D9. Many key presses in a row

The user holds or repeats Alt+Shift+Right ten times.

**What must not happen**: ten announcements queued behind each other, each naming a date that is already wrong.

The answer depends on the delivery route (2.3).

**On the row-label route (the code today).** Every key press re-renders the row and focuses it again, so every press is spoken as focus speech. No waiting is needed and a single press is confirmed at once. The proposal is that the text for each press is the **running total**:

1. First press: “Starts Sunday 14 June, ends Thursday 18 June.” (3.5 s).
2. Second press within about a second: “2 days later. Starts Monday 15 June, ends Friday 19 June.”
3. Tenth press: “10 days later. Starts Tuesday 23 June, ends Saturday 27 June.” (5.5 s).
4. A conflict that exists at that moment is part of the same text: “4 days earlier. Starts Tuesday 9 June, ends Saturday 13 June. Conflict. 4 days too early for Implementation.” (8 s). It is at the 8-second limit and stays one message because the alternative is two competing updates.
5. Presses in opposite directions net out: 6 later and 2 earlier is "4 days later". A net of zero is "Back where it started. 13 to 17 June."
6. The counter resets after about a second without a press.

Whatever the user hears last is complete and correct, however many presses came before it. This works well only if each new focus announcement cuts off the one before it; if a screen reader queues them instead, the user hears ten sentences. That behaviour was not verified for any screen reader and is the first thing to check on `listen.html`, which simulates this route on a focusable row.

**On the live-region route (cell navigation, fallback): trailing announcement with a summary.**

1. Each key press cancels the pending announcement and restarts a quiet-time timer of about 350 ms. The published range for spacing updates is 350 to 500 ms [11].
2. When the timer fires, the text is the same running total as above.
3. Conflicts that appeared and disappeared during the burst are not mentioned.

**The cost of the live-region route**: a single press is confirmed about a third of a second later than it could be. That delay may feel like a silent failure, which is the complaint this project started with; task T4 measures it.

**Alternatives**, all on `listen.html` as a simulation:

- *Every press speaks in full, without a total.* Immediate, but the outcome depends on the screen reader, and screen readers differ in when they speak polite updates [13]: one that interrupts for each update would give a usable stutter of dates; one that queues them would read ten stale messages. Which happens where was not tested.
- *Every press speaks a minimal tick, then a summary.* “14 June.” (1 s) per press, then the summary. Gives rhythm and immediate feedback; same queueing risk. Offered as a setting.
- *A non-speech sound per press.* No published guidance found for web pages; not proposed.

**The same rule for duration keys** and for the plus and minus buttons in the form (already debounced at 350 ms in `form.js`).

**Reaching a limit during a burst** stops the count and says so: "3 days shorter. 1 day, the minimum. Ends Saturday 13 June."

### D10. Going to a predecessor when there are several

- **Text**: “2 of 5. Launch depends on this.” (3.5 s). Position first, because that is the part no row label can supply; then the relation as a sentence that names the task the user started from.
- **Where focus went** is not said by the announcement. Focus moves and the row's normal label follows the position text (today's code puts the position before the label), so saying the name in the message would speak it twice in a row.
- **Unusual link type** goes after the position: “3 of 5, start to start. Launch depends on this.” (4.5 s).
- **One only**: “Testing depends on this.” (2 s), with no "1 of 1".
- **Order of the cycle**: the same as in the dependency announcement (conflicts first, then latest to end), so "2 of 5" means the same item in both.
- **The way back.** After three jumps the user is far from where they started. A "back to origin" command returns focus and says “Back to Launch.” (1.5 s).
- Parents are expanded so the target can be focused (the extension does this). The expansion changes the table, so with hints on the message adds "Opened Backend."

### D11. Errors and refusals

Pattern: **what did not happen, then why, then (if there is one) what to do instead.** No task name, no "Error:" prefix, no apology. WCAG asks that the item in error be identified and the error described in text [7].

| Case | Text | Time |
|---|---|---|
| Read-only | “Read-only. Not changed.” | 2 s |
| Project task | “Not changed. A project takes its dates from its subtasks.” | 4.5 s |
| Milestone, duration key | “A milestone has no duration.” | 2 s |
| Minimum duration | “Already 1 day, the minimum.” | 2.5 s |
| No predecessor / successor | “Depends on nothing.” / “Nothing depends on this.” | 1.5 s |
| Target filtered out | “2 of 5, Budget approval, is filtered out. Focus did not move.” | 5.5 s |
| Link refused: loop | “Link not created. It would make a loop: Implementation already depends on Testing.” | 5.5 s |
| Link refused: rule | “Link not created. A project cannot be linked to its own subtask.” | 5 s |

- **Polite.** The user pressed a key and is waiting; nothing needs to be interrupted.
- **Repeated on every press.** The extension's technique for re-announcing identical text is needed here.
- The extension cannot create links today; the two link texts are included so the pattern is settled before the feature exists.
- "Read-only" should also be exposed as `aria-readonly` on the row or grid [1], so the user learns it before trying.

### D12. Empty chart, one task, 5000 tasks

- **Empty**: the chart's accessible description says “No tasks.”, with the hint “No tasks. Press Control Enter to add one.” if the application allows adding. This is read on entry, not announced.
- **One task**: nothing special. Reading commands answer “No dependencies.”, “No tasks at the same time.”
- **5000 tasks**:
  - Position ("row 2,431 of 5,000") must come from `aria-rowindex` and `aria-rowcount`, because the library renders only visible rows and the screen reader cannot count them [1]. Whether the library sets these was not verified.
  - A **summary command** gives the overview that a sighted user takes from the scroll bar and time scale [28]: “5,000 tasks, 212 shown. 1 June 2026 to 30 March 2027. 3 conflicts.” (8.5 s).
  - **Time queries need a scope.** "At the same time" across 5000 tasks can return hundreds. The first answer gives the total and the count in the nearest scope, and continues there: “214 tasks at the same time. 12 in the same project, Backend. Press again for those.” (8 s).
  - Counts are exact. "About 200" would hide whether a filter changed anything.
  - All queries must stay fast enough to answer within the quiet-time window; otherwise say "Working" first [5].

### D13. Keyboard help

Ten key bindings in one message take about half a minute (31.5 s), cannot be replayed, and vanish from a braille display. Two forms are proposed.

**1. A help dialog (primary).** A real dialog: a heading, three short headed groups, each a list of "action, key". The user reads it with their own commands, at their own pace, in speech or braille, and can search it. This follows directly from the limits of live regions [11] and from P26.

**2. Spoken help in groups (quick form)**, on the help key without opening anything; the same key again continues:

| Group | Text | Time |
|---|---|---|
| 1 | “Reading, 1 of 3. Dependencies, Shift D. Same time, Shift O. Ends before, Shift B. Starts after, Shift A.” | 9.5 s |
| 2 | “Moving focus, 2 of 3. To what this depends on, Shift P. To what depends on this, Shift S.” | 8.5 s |
| 3 | “Changing, 3 of 3. Earlier, Alt Shift Left. Later, Alt Shift Right. Longer, Alt Shift Up. Shorter, Alt Shift Down.” | 10 s |

- **Grouped by what the user wants to do**, at most four keys per group. Groups 1 and 3 are near 10 s; they stay whole because each item is three or four words and a group of related keys is easier to remember than an arbitrary split.
- **Action first, key second**: the listener is scanning for an action ("how do I hear dependencies"), so the action is the distinguishing word (P1). The opposite order is on `listen.html` for comparison.
- **Action names shortened to one to three words** ("Same time", not "tasks at the same time").
- **Key names as words separated by spaces** ("Shift D"), not "shift+d": the plus sign may be spoken.
- **Mnemonic first letters** (D, O, B, A, P, S) are already in use; the help text should use the word that carries the letter where possible.
- The group label and position come first so that a second press is recognisably the next page.
- **The first group says how to go on** (added 20 November 2026, [U] [P], P30): “… Starts after, Shift A. Press again within 5 seconds for the next group.” Only the first group, and only when there is a next one.

---

## 7. Settings, not rules

These decisions depend most on personal habit, experience and equipment. They should be options with the catalogue's choice as the default. Order: most likely to matter first. All **[A]**; the argument for having settings at all is that announcements bypass the verbosity controls users already have in their screen readers (1.6), and that WCAG's AAA criterion wants interruptions to be suppressible [6].

| Setting | Values | Default | Why it is personal |
|---|---|---|---|
| Verbosity | Brief, Standard, Detailed | Standard | Experience with the chart; speech rate. |
| Hints | On, off | On, each hint at most three times | Needed once, noise afterwards. |
| Wording for links | Plain ("depends on"), project management ("predecessor") | Plain | Training. |
| Link types | Only unusual, always, never; as names or as sentences | Only unusual, names | Whether the user schedules with all four types. |
| Names before "and more" | 1 to 10 | 3 | Speech rate and memory; braille users may want more. |
| Feedback while repeating a key | Summary after a pause, a tick per press plus summary, every press in full | Summary | Screen reader behaviour differs [13]; some users want rhythm. |
| Weekday in dates | Never, edit results, always | Edit results | Calendar-driven or not. |
| Year in dates | When different, always | When different | Multi-year projects. |
| Task codes in names | As written, at the end, omitted in lists | As written | Whether the team uses codes as names. |
| Row label fields and order | A list of fields | Name, span, duration, progress | The question the user asks most differs per role. |
| Order of ancestors | Nearest first, root first | Nearest first | Habit from file paths. |
| Automatic conflict announcements | With the change, only on demand | With the change | Some users will want silence while rearranging many tasks. |
| Delay before announcing after focus moves | 0 to 1000 ms | 500 ms | Depends on screen reader and speech rate. |
| Announcements at all | On, off per feature | On | Already possible through `options.features`. |

Not settings: the first word of a result, the politeness level, and the rule that refusals are always spoken.

Settings belong to the person, not the page: they should be stored per user and be changeable from the keyboard without leaving the chart.

---

## 8. Open questions for user testing

Everything labelled [A] is a hypothesis. This section turns the important ones into tasks.

**Who.** Five to eight people who use a screen reader daily; a mix of NVDA, JAWS and VoiceOver; at least two who use a braille display; at least two with project-planning experience and two without. Participants use their own machine, speech rate and settings. Recruiting through organisations of blind people and paying participants is the norm.

**Material.** The demo chart for real tasks; `listen.html` for comparing wordings side by side. Rotate the order of variants between participants.

**Method note.** Ask for the answer to a factual question after each announcement ("when does it end?"), not only for a preference. Preference and comprehension often differ.

| # | Question | Task for the participant | What to record |
|---|---|---|---|
| T1 | Row label: range or labelled fields? (P7, row A/B/C) | Arrow through 12 rows in each variant. "Which task ends last? Which is longest?" | Correct answers, time, where speech was cut off, preference. |
| T2 | Are link-type names understood? (2.6) | Hear "Documentation, start to start". "Explain in your own words what that means for Documentation." Then the plain sentence. | Correct explanations per variant, by planning experience. |
| T3 | Is "finish to start" as silence learnable? | After ten minutes of use: "What type of link is there between Testing and Implementation?" | Whether the unspoken default is inferred. |
| T4 | Burst feedback and its delay (D9) | "Move Testing ten days later. What day does it start now?" in each of the three strategies. Then one single press: "Did anything happen?" | Correct date; whether the single-press delay is noticed; preference. |
| T5 | Save result and the row label (P23, D8) | Change the duration, save. "What changed, and when does the task end now? Which task are you on?" with the result instead of the label, before it, and after it through the live region; with and without the task name. | What was actually heard, in what order, per screen reader; missed announcements; whether the participant can still name the task. |
| T6 | Conflict wording (D7) | Move a task into a conflict. "What is wrong, and what would you do?" for variants A to D. | Whether the participant names the other task and the amount; number of key presses to fix. |
| T7 | "Too early": is the implicit subject understood? | As T6, with a conflict on another task. "Which task is in the wrong place?" | Correct task named. |
| T8 | Overlap wording (D6) | "Which tasks run alongside Testing for its whole length? Which only partly?" variants A to C. | Correct answers; whether "first 2 days" is understood as relative to the focused task. |
| T9 | List limit and paging (D2) | On a task with 8 predecessors: "Does this task depend on Legal review?" (the fifth). | Whether paging is discovered; whether the dialog or one-by-one navigation is preferred; preferred limit. |
| T10 | Is a verbosity setting inside the component wanted? (5) | Use Brief and Detailed for five minutes each. | Which level each participant keeps; whether they expected their screen reader's setting to govern this. |
| T11 | Where am I: order of ancestors (D1) | On a level-5 task: "What is this task part of?" in both orders. | Speed and preference. |
| T12 | Pronunciation in the participant's own setup (P13, P14, P17) | Play the probes on `listen.html` (ISO date, "13 Jun", "5d", "PRJ-1423", "FS", en dash, emoji, ampersand). | What was actually spoken, per screen reader and voice. This replaces assumptions with a table. |
| T13 | Help: dialog or spoken groups? (D13) | "Find out how to hear which tasks run at the same time" with each form. | Time to the key; whether the spoken groups are remembered. |
| T14 | Braille (2.4) | T5, T6 and T9 with speech off and a braille display. | What appeared on the display, for how long, what was readable. |
| T15 | "Ends" versus "finishes" at the participant's speech rate | Hear "Starts Sunday 14 June, ends Thursday 18 June" at their own rate. "What is the second date?" | Mishearings. |
| T16 | Depends on / required by versus predecessor / successor | Free choice after trying both; ask what they would call the relation unprompted before hearing either. | The words people use themselves. |
| T17 | Weekday in move results | Move a task onto a weekend without being told. | Whether the weekday is noticed and wanted. |
| T19 | Is a row without its name disorienting? (2.3) | After a save, ask the participant to read the current row again with their screen reader's own command. | Whether hearing the result in place of the name confuses, and whether they expected the name. |
| T18 | Does anything need to interrupt? (P21) | At the end: "Was there a moment when you learned something too late?" | Candidates for assertive, or confirmation that there are none. |

**What can be checked without participants** (by the author, with VoiceOver, NVDA and JAWS): whether a re-rendered, re-focused row is read again, and whether a new focus announcement cuts off the previous one, in each screen reader (the row-label route of 2.3 and D9 depends on both); what a braille display shows while a result is the row's label; the order of row label and announcement on the live-region route (T5's mechanics); what `listen.html`'s probes produce in each screen reader (T12's raw data); what ARIA attributes the library puts on rows (1.5, D1, D12); whether queued polite announcements pile up during a burst (D9).

**What stays unknown after this research**: how Microsoft Project presents dependencies and the bar chart to screen readers; how Outlook and Google Calendar convey overlapping events; default speech rates of the screen readers; how each synthesizer reads ISO dates and codes.

---

## 9. References

Only sources that were opened and read for this document in November 2026. Where a source was seen only through a summary, that is stated.

**W3C**

- [1] W3C WAI. *ARIA Authoring Practices Guide: Treegrid Pattern.* https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/
- [2] W3C WAI. *ARIA Authoring Practices Guide: Treegrid Email Inbox Example.* https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/examples/treegrid-1/
- [3] W3C WAI. *ARIA Authoring Practices Guide: Tree View Pattern.* https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
- [4] W3C WAI. *ARIA Authoring Practices Guide: Providing Accessible Names and Descriptions.* https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
- [5] W3C WAI. *Understanding WCAG 2.2, SC 4.1.3 Status Messages.* https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- [6] W3C WAI. *Understanding WCAG 2.2, SC 2.2.4 Interruptions.* https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html
- [7] W3C WAI. *Understanding WCAG 2.2, SC 3.3.1 Error Identification.* https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- [8] W3C WAI. *Understanding WCAG 2.2, SC 3.1.4 Abbreviations.* https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html

**Live regions**

- [9] MDN Web Docs. *ARIA live regions.* https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
- [10] MDN Web Docs. *Document: ariaNotify() method.* https://developer.mozilla.org/en-US/docs/Web/API/Document/ariaNotify
- [11] Sara Soueidan. *Accessible notifications with ARIA Live Regions*, Part 1 and Part 2. https://sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/ and https://sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2
- [12] Patrick H. Lauke, TetraLogical (2024). *Why are my live regions not working?* https://tetralogical.com/blog/2024/05/01/why-are-my-live-regions-not-working/
- [13] Adrian Roselli (2026). *Live Region Support.* https://adrianroselli.com/2026/01/live-region-support.html
- [14] Adrian Roselli (2023). *JAWS, NVDA, and VoiceOver Braille Viewers.* https://adrianroselli.com/2023/01/jaws-nvda-and-voiceover-braille-viewers.html
- [15] W3C WAI Interest Group mailing list (2020). Thread *Screen Readers, Braille Displays and Live Regions.* https://lists.w3.org/Archives/Public/w3c-wai-ig/2020OctDec/0045.html

**Products**

- [16a] Microsoft Support. *Use a screen reader to create a new project in Project.* https://support.microsoft.com/en-US/accessibility/project/use-a-screen-reader-to-create-a-new-project-in-project
- [16b] Microsoft Support. *Use a screen reader to review or edit an existing project in Project.* https://support.microsoft.com/en-us/accessibility/project/use-a-screen-reader-to-review-or-edit-an-existing-project-in-project
- [16c] Microsoft Support. *Use a screen reader to work with views in Project.* https://support.microsoft.com/en-us/accessibility/project/use-a-screen-reader-to-work-with-views-in-project
- [17] Microsoft Support. *Link tasks in a project.* https://support.microsoft.com/en-us/project/link-tasks-in-a-project
- [18a] Microsoft Support. *Use a screen reader to explore and navigate Excel.* https://support.microsoft.com/en-US/accessibility/excel/use-a-screen-reader-to-explore-and-navigate-excel
- [18b] Microsoft Support. *Use a screen reader to work with comments in Excel.* https://support.microsoft.com/en-gb/accessibility/excel/use-a-screen-reader-to-work-with-comments-in-excel
- [19] Google Docs Editors Help. *Use Google Sheets with a screen reader.* https://support.google.com/docs/answer/1632199?hl=en
- [20a] Google Calendar Help. *Use Google Calendar with a screen reader.* https://support.google.com/calendar/answer/6101541?hl=en
- [20b] Google Workspace Updates (2022). *New Google Calendar shortcuts improve glanceability for screen reader users.* https://workspaceupdates.googleblog.com/2022/09/google-calendar-announce-shortcuts+.html
- [21] Microsoft Support. *Basic tasks using a screen reader with the calendar in Outlook.* https://support.microsoft.com/en-us/office/basic-tasks-using-a-screen-reader-with-the-calendar-in-outlook-857e6fd5-72b0-409d-973d-c8dc6b77a817
- [33a] DHTMLX. *Gantt documentation: Accessibility.* https://docs.dhtmlx.com/gantt/guides/accessibility/
- [33b] DHTMLX. *Gantt API: task_end_date template* (inclusive end dates). https://docs.dhtmlx.com/gantt/api/template/task_end_date/
- [34a] Progress Telerik. *Gantt: Accessibility Support.* https://www.telerik.com/design-system/docs/components/gantt/accessibility
- [34b] Highcharts. *Gantt API: accessibility.point.valueDescriptionFormat.* https://api.highcharts.com/gantt/accessibility.point.valueDescriptionFormat
- [34c] Highcharts. *Gantt API: accessibility.point.dateFormat.* https://api.highcharts.com/gantt/accessibility.point.dateFormat

**Screen readers**

- [22] NV Access. *NVDA User Guide.* https://api.nvaccess.org/documentation/userGuide.html
- [23] Freedom Scientific. *JAWS Web Verbosity.* https://support.freedomscientific.com/SurfsUp/7-WebVerbosity.htm
- [24a] Apple. *VoiceOver User Guide: Customize verbosity in VoiceOver on Mac.* https://support.apple.com/guide/voiceover/vo27984/mac
- [24b] Apple. *VoiceOver User Guide: Change VoiceOver Verbosity settings (Text tab).* https://support.apple.com/en-az/guide/voiceover/cpvouverbtext/10/mac/26
- [24c] Levi Gobin, AppleVis (2025). *A Guide to Verbosity Options in macOS VoiceOver.* https://applevis.com/comment/183067 (AppleVis is a community of blind and low-vision users of Apple products.)
- [36] NV Access. *NVDA Commands Quick Reference.* https://download.nvaccess.org/documentation/keyCommands.html

**Research**

- [25] Mary Frances Theofanos and Janice (Ginny) Redish (2003). *Guidelines for Accessible and Usable Web Sites: Observing Users Who Work With Screen Readers.* Interactions 10(6), 38–51. https://doi.org/10.1145/947226.947227 (authors' version read at https://cs.unibg.it/verdicchio/Guidelines%20for%20Accessible%20and%20Usable%20Web%20Sites.pdf)
- [26] Danielle Bragg and co-authors (2018). *A Large Inclusive Study of Human Listening Rates.* CHI 2018. https://doi.org/10.1145/3173574.3174018 (abstract and introduction read)
- [28] Jonathan Zong, Crystal Lee, Alan Lundgard, JiWoong Jang, Daniel Hajas, Arvind Satyanarayan (2022). *Rich Screen Reader Experiences for Accessible Data Visualization.* Computer Graphics Forum 41(3). https://arxiv.org/abs/2205.04917 (abstract read)

**Speech and voice design**

- [29a] Amazon Alexa design guide. *Patterns: Lists.* https://developer.amazon.com/en-US/alexa/alexa-haus/patterns-and-components/patterns-lists
- [29b] Amazon Alexa design guide. *Design principles: Be brief.* https://developer.amazon.com/alexa/alexa-haus/design-principles/be-brief
- [31a] Paul Bohman, Deque (2014). *Why Don't Screen Readers Always Read What's on the Screen? Part 1: Punctuation and Typographic Symbols.* https://www.deque.com/blog/dont-screen-readers-read-whats-screen-part-1-punctuation-typographic-symbols/
- [31b] Eleven Ways (2023). *How screen readers read special characters: an update.* https://elevenways.be/en/articles/screenreaders-special-characters
- [32a] Steve Faulkner. *Short note on emoji text alternative variations.* https://html5accessibility.com/stuff/?p=675
- [32b] Chris Ferdinandi. *The accessibility of emoji.* https://gomakethings.com/the-accessibility-of-emoji/

**Internationalisation**

- [35a] MDN Web Docs. *Intl.PluralRules.* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
- [35b] Unicode CLDR. *Language Plural Rules* (linked from [35a]; not opened). https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html

**Added 20 November 2026**

- [37] Chart2Music documentation: https://chart2music.com/docs/ ("Press the H key to get help, including a list of keyboard commands") and the README, https://github.com/julianna-langston/chart2music ("telling the user that there is interaction available"). Read on 20 November 2026. The exact text of the description and an option to turn it off were not found in the pages read; the API reference was not read.
- [38] A message from an NVDA user to the Program-L mailing list, 20 November 2026, passed on to the author. Not linked; the name is not given here.

Numbers [27] and [30] are intentionally unused: two sources considered during research were dropped because they were seen only through third-party summaries.

---

## Implementation notes

Added 16 November 2026, after this document was turned into code. Everything above is unchanged, apart from corrections of 20 November 2026: "Read this first" now names one author, and three notes are marked with that date (file paths, P27, R1); and additions of 20 November 2026 after user feedback, each marked with that date: the label [U], rule P30, the change to H1, row H2, a point in D13 and references [37] and [38]; this section records where the implementation decides something the document leaves open, or deliberately departs from it. The decisions were made by the project owner.

File paths in the sections above refer to the code as it stood on 16 November 2026. The code now has an engine in `src/core/` and an adapter in `src/adapters/dhtmlx/` (see [ADAPTERS.md](ADAPTERS.md)): `src/strings.js` is `src/core/strings.js`, `src/features/form.js` became part of `src/core/engine.js` and `src/adapters/dhtmlx/adapter.js`, and `src/core/focus-label.js` is `src/adapters/dhtmlx/focus-label.js`.

### Deliberate deviation

- **End dates (P16).** The extension speaks by default the end date that the library itself shows in its form and stores (`task.end_date`, non-inclusive), not the last day of work. Reason: a screen reader user and a sighted colleague looking at the same task should name the same date. Speaking the last day of work is available as the option `endDate: "lastDay"`, off by default. Dates are still pronounced through `Intl` as P14 asks (day and full month, year only when it differs).

### Decisions where the document is open or inconsistent

| # | Where | Decision |
|---|---|---|
| a | D8, two-field example without "Ends" | "Ends {date}." is spoken after one or two changed table fields whenever the end date changed. |
| b | R4 and D2, list of 2 or 3 dependencies | Without unusual link types: "Depends on 3: A, B, C." With any unusual type: "Required by 3." followed by one sentence per task. |
| c | D2, threshold for a summary without names | From 10 dependencies in one direction, the first press gives the count, the deciding task and the conflicts; names follow on further presses. 10 is the threshold the document gives for the list dialog. |
| d | N3 with an unusual link type | "This depends on Build, finish to finish." / "Testing depends on this, start to start." |
| e | Moving a milestone (not in the catalogue) | "On Sunday 21 June." |
| f | C5 when the changed task itself is the one too early | "2 conflicts. Largest: 2 days too early for Implementation." |
| g | Order of "Required by" (only "Depends on" is specified) | Tasks in conflict first, then the one that starts first. |
| h | D6, projects from other branches | Not counted as "at the same time". (The option `features.time.includeProjects` was removed on 2026-11-18, with the other fine-tuning options, before the first release.) |
| i | Section 5, Detailed level, link types | Spoken by name every time; the plain-sentence wording (4.2 C) is not implemented. |
| k | S2, R12, C5, D10: keys | Shift+V overview, Shift+W where am I, Shift+C next conflict, Shift+Z back. Help gains a group "Orientation" (Shift+W, Shift+V); Shift+C and Shift+Z join "Moving focus". |
| l | S2, chart summary | "{count} tasks, {shown} shown." only when some tasks have no row; otherwise "{count} tasks." The period, then "No conflicts." or "{count} conflicts.", then "{count} tasks without dates." when there are any. Brief: tasks and period, conflicts only when there are some. Detailed: also the number of projects and milestones, and the largest conflict. |
| m | R12, where am I | The task's name first, then ancestors nearest first, then "Level {level}, {n} of {total}." with the position among the siblings that have a row; a top-level task: "Top level, {n} of {total}." Brief: name and nearest parent. Detailed: also "{count} subtasks inside." |
| n | C5, conflicts on demand | Not a spoken list: each press moves focus to the next task that is too early (largest conflict first) and speaks "{n} of {total}." with the full form (C3) before the row label, like the jumps. With one conflict the position is left out. |
| o | D10, back to origin | The origin is the task where a series of Shift+P, Shift+S or Shift+C presses started; arrowing to another task and jumping again starts a new series. Without one: "Nothing to go back to." |
| p | Keys for moving a task and changing its duration (4.6, D9, D13 examples use Alt+Shift+arrows) | Since 2026-11-17: Shift+J earlier, Shift+K later, Shift+I longer, Shift+M shorter. According to the vendors' documentation (sources in docs/KEYS.md), Alt/Option+Shift+arrows are indent and outdent in Microsoft Project and Bryntum, and group and ungroup in Google Sheets; that Left Alt+Shift can switch the input language on Windows is a common Windows setting reported by the project owner; Microsoft's pages read for docs/KEYS.md do not document it. The texts are unchanged; the examples in this document keep the old keys. Sources and reasons: docs/KEYS.md. |
| q | 2.3 and D9: the row-label route for keyboard edits | Since 2026-11-18 keyboard edits (and Shift+C when the conflict is on the focused task) use the live region, after the row is re-rendered; the row label is left as the task's own label. Focus stays on the same row, and VoiceOver in Safari did not announce the re-focus of that row, so the result in the label was not heard (found by the project owner with VoiceOver). The result is now heard after the row instead of before it, 500 ms after the re-render (fixed; the option `features.edit.delay` was removed on 2026-11-18): an immediate live region update was not heard either, most likely because the screen reader was still handling the replaced row. With the 500 ms wait the result is heard (confirmed by the project owner with VoiceOver in Safari, macOS 26.2, 2026-11-18). The form results (saved, created, cancelled) keep the row-label route, but the label is set when Save or Cancel is pressed, before the library re-renders the row and focuses it; the extension no longer re-renders the row itself after the form closes, which had moved focus too early and replaced the focused row (VoiceOver silent). Tried in between on 2026-11-18: the live region, which the project owner heard after the row, the wrong order. With the label set at Save, "Saved, no changes." is heard first (confirmed by the project owner with VoiceOver in Safari, macOS 26.2, saving with Enter and with Space). Two earlier checks had run older JavaScript modules kept by Safari's cache; the demo server now forbids caching and the demo's event log (?debug=1) says which version runs. Jumps, back and the next conflict on another task keep the row-label route too, because focus moves to another row. |
| r | Cell navigation mode (2.3) | From 2026-11-18 (morning) the row-label route also worked on cells, by wrapping the focused column's template; removed the same day after the pre-release review: it was a second replacement of a shared template on top of the first. In cell mode every result, jumps and the task form included, now goes through the live region and is heard after the cell. |
| s | 2.3, the result in the row's label | Changed on 2026-11-18 after the pre-release review. The result is always followed by the row's own label, so the row never loses the task's name ("Cancelled. Nothing changed." alone did). It is removed when focus leaves the row (to another element, to nothing, or to another window) and at the latest 5 seconds after focus landed; it is never spoken twice (the 600 ms fallback could repeat a result that had been heard). With the tooltip plugin, which shows the same template to sighted users, results go to the live region instead. After a keyboard edit or a link change the data is read again and what was stored is spoken; a change refused by the application gets "Not changed. The change was not accepted." (new text). |
| t | P30, H1, H2: the help hint (2026-11-20) | "Press Shift H for keys." goes through the live region, 500 ms after focus first lands on a task, so that it is heard after the row label; the row-label route would put it before the label. It is dropped when anything else was spoken within those 500 ms (it would replace that text in the live region) and once help has been asked for. Once per page load: the flag lives in the engine module, so enabling the extension again on the same page does not repeat it. The adapter reports focus through the optional `onTaskFocus` (ADAPTERS.md). Switch: `features.helpHint: false`; also off with `features.help: false` and at Brief. The first help group ends with "Press again within 5 seconds for the next group." at every level. Checked with the automated tests (unit and browser, Chromium and WebKit); **not yet checked with a screen reader, neither VoiceOver nor NVDA.** |
| j | D13, spoken help items | Each item ends with the word "key": "Dependencies, Shift D key." Found by the project owner with VoiceOver: after a single capital letter and a period ("Shift D. Same time") VoiceOver heard an initial and made no pause between items. |

### Known, not changed yet (recorded 2026-11-20)

- **Hints have no switch.** Section 5 says hints are "a separate on/off switch, on by default"; "Not implemented" below says the option was removed on 2026-11-18. The code follows the latter: the two hints ("Press again for the next {count}.", "Opened {name}.") are always on, at most three times each per session. Only the help hint (P30) has a switch, `features.helpHint`.
- **Hints at the Brief level.** The two hints above are also spoken at Brief. Section 5 does not say whether they should be; the help hint (P30) is not spoken at Brief.

### Not implemented

- All dialogs (D2, D13). Help is spoken in groups only. Repeat last announcement (M1), where am I (R12), conflicts on demand (C5), chart summary (S2) and back to origin (D10) are implemented (decisions k to o).
- Settings from section 7 other than verbosity, end date and per-feature on/off. Hints, names before "and more", weekday and year were options until 2026-11-18; they now follow the verbosity level (removed before the first release to keep the API small).
- ARIA attributes on the library's rows and grid (`aria-rowindex`, `aria-rowcount`, `aria-posinset`, `aria-readonly` on rows, the grid's description for an empty chart): they would require changing the library's DOM rather than using its public API.
- "Not saved. {reason}." for a save refused by validation: the reason is known only to the application code that refuses it.
