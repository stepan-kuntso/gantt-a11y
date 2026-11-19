# Keys: what other tools use, and why gantt-a11y uses what it uses

Collected on 2026-11-16/17 from official documentation only: every statement about another product below is **according to the vendor documentation** named in its row, not a result of testing those products. Every row names its source. "Not found" means the pages read did not say; it is not a statement that the key is free. "Not retrieved" means the page could not be read (see the end).

## Similar actions in other tools

| Tool | Action | Keys | Source |
|---|---|---|---|
| Microsoft Project (desktop) | Indent / outdent a task | Alt+Shift+Right / Alt+Shift+Left | https://support.microsoft.com/en-us/accessibility/project/keyboard-shortcuts-for-project ("Outline a project") |
| Microsoft Project | Move a task up / down (whole row selected) | Alt+Shift+Up / Alt+Shift+Down | same page |
| Microsoft Project | Reschedule a task in Team Planner (Project Online only) | Ctrl+arrow keys | same page |
| Microsoft Project | Move a timeline item to the next bar (Project Online only) | Ctrl+Up / Ctrl+Down | same page |
| Microsoft Project | Change a task's dates or duration in the Gantt view | not found | same page |
| Microsoft Project | Link / unlink tasks | Ctrl+F2 / Ctrl+Shift+F2 | same page ("Edit in a view") |
| Microsoft Project | Scroll the timescale | Alt+Left / Alt+Right | same page |
| Microsoft Project | Extend the selection by a row / to the first or last row | Shift+Up/Down; Ctrl+Shift+Up/Down | same page |
| Bryntum Gantt | Indent / outdent selected tasks | Alt+Shift+Right / Alt+Shift+Left | https://bryntum.com/docs/api/Gantt/view/Gantt (Keyboard shortcuts) |
| Bryntum Gantt (Grid) | Move between cells; extend the selection | Arrow keys; Shift+arrows | https://bryntum.com/docs/api/Grid/view/Grid (Keyboard shortcuts) |
| Bryntum Gantt | Edit a cell (dates, duration): start / finish / cancel | Enter or F2 / F2 or Ctrl+Enter / Escape | https://bryntum.com/docs/api/Grid/feature/CellEdit (Keyboard shortcuts) |
| Bryntum Gantt | Move a task or change its duration directly | not found | Grid, CellEdit, Gantt, TaskEdit pages |
| Syncfusion Gantt | Collapse / expand the selected row | Ctrl+Shift+Up / Ctrl+Shift+Down | https://help.syncfusion.com/gantt-sdk/javascript/gantt-chart/accessibility (Keyboard navigation) |
| Syncfusion Gantt | Collapse / expand all | Ctrl+Up / Ctrl+Down | same page |
| Syncfusion Gantt | Extend the cell selection | Shift+arrows | same page |
| Syncfusion Gantt | Edit / add a task in a dialog; save; cancel | Ctrl+F2 / Ctrl+Insert; Enter; Esc | same page |
| Syncfusion Gantt | Focus the Gantt chart | Alt+J | same page (JavaScript version) |
| Syncfusion Gantt | Move a task or change its duration directly | not found | same page |
| Kendo UI for jQuery Gantt | Expand / collapse a task (timeline) | Alt+Right / Alt+Left | https://demos.telerik.com/kendo-ui/gantt/keyboard-navigation |
| Kendo UI for jQuery Gantt | Expand / collapse a task (list; reversed) | Alt+Left / Alt+Right | same page |
| Kendo UI for jQuery Gantt | Scroll the timeline | Left / Right | same page |
| Kendo UI for jQuery Gantt | Open the cell editor / edit popup | Enter | same page |
| Kendo UI for jQuery Gantt | Move a task or change its duration | not found | same page |
| Kendo UI demo page (not the component) | Focus the Gantt | Alt+W | same page (added by the demo's own script) |
| DHTMLX Gantt (incl. PRO) | Indent / outdent a task | Shift+Right / Shift+Left | https://docs.dhtmlx.com/gantt/guides/keyboard-navigation/ |
| DHTMLX Gantt | Expand / collapse a branch | Shift+Down / Shift+Up | same page |
| DHTMLX Gantt | Expand / collapse the tree | Ctrl+Left / Ctrl+Right | same page |
| DHTMLX Gantt | Scroll the chart | Alt+Up/Down/Left/Right | same page |
| DHTMLX Gantt | New task; undo; redo | Ctrl+Enter; Ctrl+Z; Ctrl+R | same page |
| DHTMLX Gantt | Inline editors: open/close; next/previous editor | Enter (Space opens); Tab / Shift+Tab | https://docs.dhtmlx.com/gantt/guides/inline-editing/ |
| DHTMLX Gantt | Move a task or change its duration from the keyboard | not found (no PRO-only keys documented) | both pages |
| frappe-gantt 1.2.2 | Anything | no keyboard handling | its README and source |
| Jira Cloud | Next / previous work item | J / K | https://support.atlassian.com/jira-software-cloud/docs/use-keyboard-shortcuts/ |
| Jira Cloud | Next / previous column | N / P | same page |
| Jira Cloud | Create; open; assign; assign to me; comment | C; O; A; I; M | same page |
| Jira Cloud | Timeline / Plans: move items, change dates, indent | not found | same page |
| Asana | Timeline / Gantt keys | not retrieved | https://help.asana.com/s/article/keyboard-shortcuts |
| Microsoft Excel | Extend the selection by a cell / to the edge of data | Shift+arrow / Ctrl+Shift+arrow | https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f |
| Microsoft Excel | Move to the edge of the data region | Ctrl+arrow | same page |
| Microsoft Excel | Open a cell's validation list | Alt+Down | same page |
| Microsoft Excel | Enter today's date / the time | Ctrl+; / Ctrl+Shift+: | same page |
| Microsoft Excel | Increase or decrease a value or a date by one | not found | same page |
| Microsoft Excel | Alt+Shift+arrows | not found | same page |
| Google Sheets | Group / ungroup rows or columns | Alt+Shift+Right / Left (Mac: Option+Shift) | https://support.google.com/docs/answer/181110 |
| Google Sheets | Expand / collapse grouped rows or columns | Alt+Shift+Down / Up (Mac: Option+Shift) | same page |
| Google Sheets | Next / previous sheet | Alt+Down / Alt+Up (Mac: Option) | same page |
| Google Sheets | Insert date; time; date and time | Ctrl+; ; Ctrl+Shift+; ; Ctrl+Alt+Shift+; (some locales: Ctrl+Shift+D for the date) | same page |
| Google Sheets | Increase or decrease a value or a date by one | not found | same page |

## Browsers, operating systems and screen readers

| Where | Keys | Meaning | Source |
|---|---|---|---|
| Windows | Windows key+Space / +Shift+Space | Switch input language and keyboard layout | https://support.microsoft.com/en-us/windows/keyboard-shortcuts-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec |
| Windows | Ctrl+Shift | Switch the keyboard layout when several are installed | same page |
| Windows | Left Alt+Shift | Switch input language: not found on the two Microsoft pages read (the language settings page documents only Windows key+Space and the taskbar icon). It is the setting the project owner reports; it was not confirmed from documentation here. | same page; https://support.microsoft.com/en-us/windows/manage-the-input-and-display-language-settings-in-windows-12a10cb4-8626-9b77-0ccb-5013e0c7c7a2 |
| Windows | Alt+Left / Alt+Right | Back / forward | first Windows page |
| Windows | Windows key+arrows | Snap, maximise, minimise windows | first Windows page |
| Windows | Ctrl+arrows; Shift+arrows | Move by word or paragraph; select (in text) | first Windows page |
| macOS | Control+Up; Control+Down | Mission Control; the app's windows | https://support.apple.com/en-us/102650 |
| macOS | Option+Shift+arrows | Extend the text selection by word or paragraph | same page |
| macOS | Option+arrows; Command+arrows; Shift+arrows | Move by word; to line or document start/end; select (in text) | same page |
| macOS | Fn+Control+arrows | Tile windows | https://support.apple.com/guide/mac-help/mchl9674d0b0/mac |
| macOS | Control+Space; Control+Option+Space | Previous / next input source | https://support.apple.com/en-us/102650 |
| Chrome (Windows) | Alt+Left/Right; Ctrl+Left/Right | Back/forward; move by word or move a focused tab | https://support.google.com/chrome/answer/157179 |
| Chrome (Windows) | Ctrl+Shift+N, T, W, B, O, G, D, M, J | Browser commands | same page |
| Chrome (Mac) | Command+Left/Right; Command+Option+arrows | Back/forward; switch tabs, cycle focus | same page |
| Chrome (Mac) | Command+Shift+N, T, W, B, M, J, G, D, I, H, R | Browser commands | same page |
| Safari | Option+arrows; Command+Up/Down; Command+Shift+T, H, D, R | Scroll; top/bottom; browser commands | https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac |
| Firefox | all | not retrieved | https://support.mozilla.org/kb/keyboard-shortcuts-perform-firefox-tasks-quickly |
| VoiceOver | VO = Control+Option (or Caps Lock); VO+Shift+letters | VoiceOver commands | https://support.apple.com/guide/voiceover/general-commands-cpvokys01/mac |
| VoiceOver | single letters and Shift+letter when single-key Quick Nav is on (b/B next/previous button; the full letter list is not published) | Quick Nav | https://support.apple.com/guide/voiceover/quick-nav-vo27943/mac |
| NVDA | single letters h l i t k n f u v e b x c r q s m g d o a p w (Shift = previous), comma | Browse mode single-letter navigation | https://download.nvaccess.org/documentation/keyCommands.html |
| NVDA | Control+Alt+arrows | Table navigation | same page |
| JAWS | single letters A B C D E F G H I J K L M N O P Q R S T U V X Z (Shift = previous) | Navigation Quick Keys (virtual cursor) | https://support.freedomscientific.com/Content/Documents/Manuals/JAWS/Keystrokes.pdf |
| JAWS | Alt+Left/Right; Ctrl+Shift+Left/Right | Back/forward; select a word | same document |

## What follows

According to the documentation in the tables above:

1. **Every modifier with an arrow already means something.** Alt/Option+Shift+arrows: indent, outdent and move in Microsoft Project and Bryntum, group and ungroup in Google Sheets, word selection on macOS; on Windows, the input language switch reported by the project owner (not documented on the pages read). Ctrl+Shift+arrows: collapse and expand in Syncfusion, selection in Project, Excel and JAWS. Ctrl+arrows: Mission Control on macOS, expand/collapse in dhtmlx. Alt+arrows: back/forward in browsers, scrolling in dhtmlx, expand/collapse in Kendo. Shift+arrows: indent and expand in dhtmlx. Control+Option+arrows: VoiceOver itself. Command or Windows key with arrows: the operating system.
2. **No tool documents keys for moving a task or changing its duration** in a Gantt view, except Project Online's Team Planner (Ctrl+arrows). There is no convention to follow, only conventions to avoid.
3. **Shift with a letter is given no meaning** on the documentation pages above for these browsers, operating systems and Gantt components. Screen readers use letters (with Shift for "previous") only in browse mode / the virtual cursor; the extension's keys work in focus mode (NVDA) or forms mode (JAWS), as all its other keys already do.

## The keys chosen for earlier, later, longer, shorter

Until 2026-11-17 the four editing keys were Alt+Shift with the arrows, which, according to the vendors' documentation in the tables above, Microsoft Project and Bryntum use for indent and outdent and Google Sheets for group and ungroup; that Left Alt+Shift can switch the input language on Windows is a common Windows setting reported by the project owner; Microsoft's pages read for this page do not document it (see the Windows rows). (Moved here from the README on 2026-11-19.)

| Command | Before | Now |
|---|---|---|
| Earlier | Alt+Shift+Left | **Shift+J** |
| Later | Alt+Shift+Right | **Shift+K** |
| Longer | Alt+Shift+Up | **Shift+I** |
| Shorter | Alt+Shift+Down | **Shift+M** |

**Why these.** On a QWERTY keyboard, J and K sit side by side, I above and M below them: the four keys form a small cross that keeps the meaning of the old arrows (left earlier, right later, up longer, down shorter). They are Shift with a letter, like the extension's other keys, so nothing in the tables above gives them another meaning, and they do not use Alt, so the Windows language switch and macOS Option characters are not involved. None of them was used by the extension before.

**The compromise.**

- The cross is a picture of the keyboard, not a word: "J" does not stand for "earlier". It has to be learned once, and help (Shift+H) speaks it.
- On AZERTY keyboards M is not below J and K; J, K and I are in place. On QWERTZ the cross is unchanged.
- Jira's documentation lists bare J and K for next and previous item. That is a different key (no Shift) in a different product, but a Jira user may expect J and K to move focus.
- According to their documentation, JAWS uses J ("Jump to line"), K, I and M as Navigation Quick Keys in the virtual cursor, and NVDA uses k, i and m in browse mode. As for every other key of the extension, the chart has to be in focus or forms mode.
- On non-English layouts the keys are found by position: the frappe adapter reads `KeyboardEvent.code`, and dhtmlx-gantt matches the key code (read in its source, not in its documentation), which browsers report for the Latin letter on that key. This was not tested with a Ukrainian or other layout in this repository.

## The other 13 keys, by the same criteria

| Key | Command | Doubts |
|---|---|---|
| Shift+D | dependencies | none found in the sources above (Google Sheets uses Ctrl+Shift+D for the date in some locales: another key) |
| Shift+O | same time | the letter is a weak reminder ("overlap") |
| Shift+B | ends before | none found |
| Shift+A | starts after | none found |
| Shift+W | where am I | none found |
| Shift+V | overview | the letter is a weak reminder ("overview" has no letter left free that reads better) |
| Shift+P | to what this depends on | none found (Jira: bare P is previous column) |
| Shift+S | to what depends on this | none found |
| Shift+C | next conflict | none found (Jira: bare C creates an item) |
| Shift+Z | back | **doubtful**: Shift+Command+Z is Redo on macOS, according to Apple (https://support.apple.com/en-us/102650); a slip of Command turns "back" into "redo" in an application that follows it |
| Shift+L | make a link | none found |
| Shift+T | link type | none found |
| Shift+U | remove link | none found |
| Shift+R | repeat | none found |
| Shift+H | help | none found |

All of them share the screen reader condition (focus or forms mode) and the untested non-English layouts. Shift+Z is the only one with a specific risk; it is left as it is and listed here.

## Pages that could not be read

- **Firefox**: the support page returned a bot check. It was not bypassed.
- **Asana**: the help centre pages load, but their article text is rendered by script and did not come through.
- **Microsoft Windows**: the old "keyboard shortcuts in Windows" address returned 404; the current page was read instead.
