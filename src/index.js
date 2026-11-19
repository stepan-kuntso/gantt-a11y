/**
 * gantt-a11y: screen reader helpers for Gantt charts.
 *
 * - enableGanttA11y(gantt, options): for dhtmlx-gantt (src/adapters/dhtmlx).
 * - enableFrappeGanttA11y(gantt, options): for frappe-gantt, experimental
 *   (src/adapters/frappe).
 * - createEngine(adapter, options): the library-independent engine
 *   (src/core), for another Gantt library; see docs/ADAPTERS.md.
 */
export { enableGanttA11y } from "./adapters/dhtmlx/index.js";
export { enableFrappeGanttA11y } from "./adapters/frappe/index.js";
export { createEngine } from "./core/engine.js";
