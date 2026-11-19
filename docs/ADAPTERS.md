# Adapters

gantt-a11y has two parts:

- **The engine** (`src/core/`): every command, text and rule: dependencies, pages, conflicts, overlaps in time, bursts of edits, links, the form results, help, verbosity levels. It knows nothing about a particular Gantt library and nothing about the DOM. Its entry point is `createEngine(adapter, options)` in `src/core/engine.js`.
- **An adapter** (`src/adapters/<library>/`): reads data from the chart, binds keys, listens to the chart's events, moves focus, and speaks through a live region.

`src/adapters/dhtmlx/` is the adapter for dhtmlx-gantt, `src/adapters/frappe/` for frappe-gantt (a chart without keyboard navigation, see the last section), and `src/adapters/dom/live-region.js` is the live region both use. `test/memory-adapter.js` is a minimal adapter over plain arrays, used by the engine's unit tests; it is the shortest working example.

```js
import { createEngine } from "./gantt-a11y/src/index.js";

const engine = createEngine(myAdapter, options);   // options: see README, "Options"
// ...
engine.disable();   // unbinds every key, unsubscribes from the form, removes the row label
```

The engine returns only `{ disable }`; `src/adapters/dhtmlx/index.js` shows how an entry point wraps it (a guard against enabling twice, `disable()` that also removes the adapter's live region, `refresh()`).

## Data the engine works with

```text
task  { id, name, start, end, duration, parent, type, readonly, progress }
link  { id, source, target, type, lag, readonly }
```

| Field | Meaning |
|---|---|
| `task.name` | Plain text or HTML; the engine reduces it to text for speech. |
| `task.start`, `task.end` | `Date`. `end` is what the library stores; for day-based charts usually the start of the day after the last day of work. The engine speaks it as is by default (option `endDate: "lastDay"` speaks the day before for midnight ends). |
| `task.duration` | Number in the chart's duration unit. |
| `task.parent` | Parent task id, or `null` at the top level. |
| `task.type` | `"task"`, `"project"` (summary task whose dates follow its subtasks) or `"milestone"` (no duration). |
| `task.readonly` | `true` if the task must not be changed, including when the whole chart is read-only. |
| `task.progress` | 0 to 1, or `undefined`. |
| `link.type` | `"finish_to_start"`, `"start_to_start"`, `"finish_to_finish"` or `"start_to_finish"`; `null` for anything else. |
| `link.lag` | In duration units; negative for lead. `0` if none. |

## The adapter interface

Every method is called by the engine; none is called by the user. Optional parts are marked; without them the features that need them do nothing.

### Data

| Method | Returns | Used for |
|---|---|---|
| `getTasks()` | all tasks | time queries, the year rule for dates |
| `getTask(id)` | a task or `null` | everything |
| `getLinks()` | all links | dependencies, jumps, conflicts, links |
| `getChildIds(id)` | direct children ids | row label of a collapsed project, position in "where am I" |
| `getAncestorIds(id)` | parent ids, nearest first | "at the same time" leaves them out, "where am I" |
| `getDescendantIds(id)` | all ids inside the task | time queries, project row label, deletion counts |
| `isTaskVisible(id)` | `boolean` | jumps (expand or report "filtered out"), collapsed projects, "shown" in the overview, positions |
| `getDurationUnit()` | `"day"`, `"hour"`, ... | how durations and amounts are spoken |
| `getDurationStep()` | number | how much "longer" and "shorter" (Shift+I, Shift+M) change |
| `durationBetween(start, end)` | number of duration units | conflict size, extent of overlap |
| `endDate(start, duration, taskId?)` | `Date` | moves, duration changes, lag |
| `addDays(date, days)` | `Date` | moves by calendar days |
| `typeLabel(type)` | text, optional | the form result for a changed type |

### Changes

| Method | Effect |
|---|---|
| `updateTask(id, { start, end, duration })` | Ask the library to store the new dates and re-render the task. Do not change the stored task before the library allows it: its own checks (dhtmlx: `onBeforeTaskUpdate`) may refuse the change, and then the task must stay as it was. The engine reads the task again with `getTask` afterwards and announces what was stored, or "Not changed. The change was not accepted." through `announce` (after a short delay, see README, "How it works"). |
| `canLink({ source, target, type })` | The application's own rule for a new link. The engine checks read-only, same task, existing link and loops itself. |
| `addLink({ source, target, type })` | Create the link; return its id, or `null` if the chart refused it. The engine then looks for the id in `getLinks()` and announces the link only if it is there. |
| `removeLink(id)` | Remove it; return `true` if it is gone. The engine checks `getLinks()` afterwards and says "Link not removed." if it is still there. |

### Focus and speech

| Method | Effect |
|---|---|
| `getFocusedTaskId()` | Id of the task with keyboard focus, or `null`. Commands only act on a focused task. |
| `focusTask(id)` | Move keyboard focus to the task's row, expanding collapsed parents; return `{ moved }`, `false` when the task cannot get focus (filtered out, hidden). |
| `announce(text, { delay }?)` | Speak through a visually hidden `aria-live="polite"` region (one per chart). Each call must be announced even if the text repeats; `delay` in ms. |
| `announceOnFocus(id, text, { refresh, fallback }?)` | Make `text` the first thing heard the next time focus lands on the task's row, followed by its normal label (the row never loses the task's name). Remove it when focus leaves the row and a few seconds after it landed; never speak it twice. `refresh`: re-render the row now. If focus does not land on the row (within about 600 ms), fall back to `announce`; every adapter must support this (`fallback: false`: do not; the engine confirms later, as for the task form). If the row already has focus, the message counts as delivered. Where the row's name cannot carry a message without sighted users seeing it (dhtmlx with the tooltip plugin) or does not come from the row (cell navigation), speak through `announce` after the row is read instead. Do not re-render the row after focus has landed on it: VoiceOver did not announce a re-rendered row that already had focus. Why this exists: a re-rendered or newly focused row is read before any live region (README, "How it works"). |
| `cancelOnFocus(id)` | Drop the message waiting for the task's row, without speaking it, and give the row its normal label again. The engine calls it when `focusTask` did not move focus. |

### Keys

`keys` is an object with three functions. The engine normalises keys to the form `"shift+d"`, `"alt+shift+left"`, refuses keys without a modifier, and never binds a key twice.

| Function | Effect |
|---|---|
| `keys.isTaken(key)` | `true` if the key is already bound through the library's own shortcut API (dhtmlx: `gantt.getShortcutHandler` on task rows and cells) or by the adapter. The engine then refuses it. Keys the page handles with its own `keydown` listeners cannot be seen this way (there is no public API to list listeners); an application that has such keys remaps ours with `options.shortcuts`. |
| `keys.add(key, handler)` | Call `handler()` when the key is pressed while a task row (or cell) has focus. |
| `keys.remove(key)` | Undo `add`. |

### The task form (optional)

| Method | Effect |
|---|---|
| `onForm(listener)` | Call `listener(event)` for the events below; return a function that unsubscribes. |
| `formSnapshot(id)` | The task as the form edits it: the task fields plus any extra fields (by key). |
| `formFields()` | Extra fields of the form: `[{ key, label }]`. |
| `columnFields()` | Keys of the fields shown as table columns (`"name"`, `"start"`, `"duration"`, extra keys). A change to a column is confirmed by the row label; others are spoken with their value. |

Form events, in the order they happen:

| Event | When |
|---|---|
| `{ type: "open", id, values }` | The form opened. `values`: `{ start, end, duration }` as shown in it. |
| `{ type: "values", values }` | A date or duration changed while it is open (debounce key presses, about 350 ms). |
| `{ type: "save", id, isNew, before, after? }` | Save was pressed; `before` is `formSnapshot(id)` from before the change (`null` for a new task). `after` (optional) is the same snapshot of the form's new values: with it the engine puts the result into the row label before the library re-renders and focuses the row, so it is heard first; without it the result is spoken through the live region after the form has closed. |
| `{ type: "cancel", id, isNew?, returnTo? }` | Cancel was pressed. `isNew`: the task was created in this form and not saved, so the library removes it; `returnTo`: the task whose row focus goes back to then (the engine puts "New task discarded." there). |
| `{ type: "delete", id }` | Delete was pressed (the deletion may still be declined). |
| `{ type: "close" }` | The form closed. The engine then looks at the data to decide what happened. |

### The row label (optional)

`setRowLabel(provider)`: when `provider` is a function, use `provider(taskId)` as each task row's accessible name; `null` restores the previous name. Only called when `features.rowLabel` is on.

## What a chart without keyboard navigation needs

The engine acts on "the task with keyboard focus". If the library has no keyboard navigation, the adapter has to provide at least: a focusable element per task with an accessible name and a role that fits its container (for example `role="row"` in a `role="treegrid"`, or `role="option"` in a `role="listbox"`), Up and Down arrows to move between them, and `getFocusedTaskId()` / `focusTask()` / `keys` on top of that. `announceOnFocus` then works the same way: set the element's accessible name for the moment focus lands on it.

`src/adapters/frappe/adapter.js` (experimental) does exactly this: a `role="listbox"` with a `role="option"` per task and a roving `tabindex`, keys read from `KeyboardEvent.code`, so that a key is found by its position on any keyboard layout and Alt combinations work on macOS, and `announceOnFocus` setting the option's `aria-label`, one message per task, until focus leaves it or 5 seconds after it landed. Optional parts it leaves out: the task form (`onForm` and the rest), because frappe-gantt has none.
