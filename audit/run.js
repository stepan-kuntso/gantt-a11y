// Runs the audit in audit/PROTOCOL.md (version 2) on the pages in
// audit/profiles.js and writes audit/private/results/<date>-v2.json and .md
// (all pages) and audit/results/ (the demos of this repository only).
//
//   npm run audit                    all profiles (public demos need a network)
//   npm run audit -- --local         only the demos in this repository
//   npm run audit -- --fixtures      only the test pages of the audit itself
//   npm run audit -- demo-frappe-plain  only the profiles named
// A run of only some profiles writes <date>-v2-partial.* instead.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { profiles } from "./profiles.js";
import { serve } from "./serve.js";
import { CHECKS, PROTOCOL_VERSION, renderMarkdown } from "./report.js";
import { DEFAULT_KEYS } from "../src/core/engine.js";

/** "Shift + K" and "shift+k" alike; modifiers in one order; "esc" as "escape". */
function canonicalKey(key) {
	const parts = String(key).toLowerCase().replace(/\s/g, "").split("+").map((part) => (part === "esc" ? "escape" : part));
	const order = ["ctrl", "alt", "shift", "meta"];
	const mods = parts.slice(0, -1).sort((a, b) => order.indexOf(a) - order.indexOf(b));
	return [...mods, parts[parts.length - 1]].join("+");
}

/** The extension's default keys against the keys the library documents. */
async function keyConflicts(page, profile) {
	const lib = profile.libraryKeys;
	if (!lib) {
		return result("keyConflicts", "could not determine", "The profile lists no documented keys of the library.");
	}
	const libraryKeys = new Set(lib.keys.map(canonicalKey));
	const overlap = Object.entries(DEFAULT_KEYS).filter(([, key]) => libraryKeys.has(canonicalKey(key))).map(([id, key]) => `${key} (${id})`);
	const total = Object.keys(DEFAULT_KEYS).length;
	if (!profile.extension) {
		return result("keyConflicts", "not applicable",
			`No gantt-a11y adapter on this page. Against the ${lib.keys.length} documented keys, the extension's ${total} default keys would overlap: ${overlap.length ? overlap.join(", ") : "none"}.`,
			"", { sources: lib.sources });
	}
	// on the page: which of the extension's keys are actually bound where a task has focus
	const bound = await page.evaluate((keys) => {
		if (!window.gantt || !window.gantt.getShortcutHandler) {
			return null;
		}
		return keys.filter((key) => !!window.gantt.getShortcutHandler(key, "taskRow")).length;
	}, Object.values(DEFAULT_KEYS));
	const boundText = bound === null ? "" : ` ${bound} of ${total} are bound on task rows on this page.`;
	return overlap.length
		? result("keyConflicts", "fail", `Overlap with the ${lib.keys.length} documented keys of ${profile.library}: ${overlap.join(", ")}.${boundText}`, "", { sources: lib.sources })
		: result("keyConflicts", "pass", `None of the extension's ${total} default keys is among the ${lib.keys.length} documented keys of ${profile.library}.${boundText}`, "", { sources: lib.sources });
}

const args = process.argv.slice(2);
const onlyLocal = args.includes("--local");
const onlyFixtures = args.includes("--fixtures");
const only = args.filter((a) => !a.startsWith("--"));
const selected = profiles.filter((p) => {
	if (only.length) {
		return only.includes(p.id);
	}
	if (onlyFixtures) {
		return p.fixture;
	}
	return !p.fixture && (!onlyLocal || p.local);
});
const fullRun = !only.length && !onlyLocal && !onlyFixtures;

// pages with long navigation need more Tab presses before the chart
const TAB_LIMIT = { local: 120, public: 300 };
const BAR_TAB_LIMIT = 40;
const CELL_STEPS = 8;
// numeric dates without word boundaries: cell texts are often joined without spaces ("Build4/5/2025")
const DATE_PATTERN = /\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/.]\d{1,2}[/.]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}\b|\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i;
const DEPENDENCY_WORDS = /depend|predecessor|successor|required by|\blinks?\b|\b\d+\s*(?:FS|SS|FF|SF)\b/i;
const KEY_WORDS = /\b(?:Tab|Shift|Ctrl|Control|Alt|Option|Enter|Escape|Esc|F2|arrow keys?|Up|Down)\b/;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (text) => String(text == null ? "" : text).replace(/\s+/g, " ").trim();
const cut = (text, n = 160) => (clean(text).length > n ? clean(text).slice(0, n - 1) + "…" : clean(text));
const quote = (text, n = 140) => "“" + cut(text, n) + "”";

function result(id, value, evidence, note = "", extra = {}) {
	return { id, title: CHECKS[id].title, result: value, evidence: cut(evidence, 500), note, ...extra };
}

// ---- reading the page ----

/** Role, name, description and properties from Chromium's accessibility tree. */
async function axOf(page, cdp, locate) {
	const marked = await page.evaluate((locate) => {
		let el = locate.active ? document.activeElement : document.querySelectorAll(locate.selector)[locate.index || 0];
		// widgets that keep DOM focus on the grid and point at the active cell
		const active = locate.active && el && el.getAttribute("aria-activedescendant");
		if (active && document.getElementById(active)) {
			el = document.getElementById(active);
		}
		if (locate.row && el) {
			el = el.closest('[role="row"]') || el;
		}
		if (!el || el === document.body) {
			return false;
		}
		el.setAttribute("data-audit-ax", "");
		return true;
	}, locate);
	if (!marked) {
		return null;
	}
	try {
		const { result: handle } = await cdp.send("Runtime.evaluate", { expression: "document.querySelector('[data-audit-ax]')" });
		const { node } = await cdp.send("DOM.describeNode", { objectId: handle.objectId });
		const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { backendNodeId: node.backendNodeId, fetchRelatives: false });
		const ax = nodes[0];
		const props = {};
		for (const p of ax.properties || []) {
			props[p.name] = p.value && p.value.value;
		}
		return {
			role: ax.role && ax.role.value,
			name: clean(ax.name && ax.name.value),
			description: clean(ax.description && ax.description.value),
			ignored: !!ax.ignored,
			props
		};
	} finally {
		await page.evaluate(() => document.querySelectorAll("[data-audit-ax]").forEach((el) => el.removeAttribute("data-audit-ax")));
	}
}

/** Where keyboard focus is, relative to the chart; the column header of a focused cell. */
function where(page, selectors) {
	return page.evaluate((sel) => {
		let a = document.activeElement;
		const active = a && a.getAttribute && a.getAttribute("aria-activedescendant");
		if (active && document.getElementById(active)) {
			a = document.getElementById(active);
		}
		const row = a && a.closest ? a.closest(sel.taskRow) : null;
		const bar = a && a.closest ? a.closest(sel.bar) : null;
		const chart = a && a.closest ? a.closest(sel.chart) : null;
		const rowId = row ? (row.getAttribute("data-task-id") || row.getAttribute("data-id") || row.getAttribute("data-uid") || row.getAttribute("aria-rowindex") || String([...document.querySelectorAll(sel.taskRow)].indexOf(row))) : null;
		let header = "";
		const cell = a && a.closest ? a.closest('[role="gridcell"], [role="cell"], td') : null;
		if (cell) {
			const grid = cell.closest('[role="grid"], [role="treegrid"], table') || document;
			const scope = cell.closest(".b-grid, .e-gantt, .k-gantt") || document;
			const headers = [...scope.querySelectorAll('[role="columnheader"]')];
			const col = cell.getAttribute("aria-colindex");
			const byData = cell.dataset && cell.dataset.column && headers.find((h) => h.dataset && h.dataset.column === cell.dataset.column);
			const byIndex = col && headers.find((h) => h.getAttribute("aria-colindex") === col);
			const rowEl = cell.closest('[role="row"], tr');
			const cells = rowEl ? [...rowEl.querySelectorAll('[role="gridcell"], [role="cell"], td')] : [];
			const sameGridHeaders = [...grid.querySelectorAll('[role="columnheader"]')];
			const fallback = (sameGridHeaders.length ? sameGridHeaders : headers)[cells.indexOf(cell)];
			header = ((byData || byIndex || fallback || {}).textContent || "").replace(/\s+/g, " ").trim();
		}
		const isInput = !!a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable);
		return {
			inRow: !!row, inBar: !!bar, inChart: !!chart, rowId, header, isInput,
			key: a ? a.tagName + (a.id || "") + (a.className || "") + (rowId || "") + header : "",
			role: a ? a.getAttribute("role") || a.tagName.toLowerCase() : null,
			text: a ? (a.getAttribute("aria-label") || a.value || a.textContent || "").trim().slice(0, 100) : ""
		};
	}, selectors);
}

function announcements(page) {
	return page.evaluate(() => {
		const read = (selector) => [...document.querySelectorAll(selector)].map((el) => el.textContent.replace(/\s+/g, " ").trim()).filter(Boolean).join(" | ");
		return { live: read('[aria-live]:not([aria-live="off"])'), alert: read('[role="alert"], [role="status"]') };
	});
}

function barBoxes(page, selector) {
	return page.evaluate((selector) => [...document.querySelectorAll(selector)].map((el) => {
		const r = el.getBoundingClientRect();
		return { x: Math.round(r.x), w: Math.round(r.width) };
	}), selector);
}

function taskNames(page, selectors) {
	return page.evaluate((sel) => [...document.querySelectorAll(sel.taskRow)].map((row) => {
		const cell = row.querySelector('[role="gridcell"], td, .gantt_tree_content');
		return ((cell ? cell.textContent : row.textContent) || "").replace(/\s+/g, " ").trim();
	}).filter((t) => t.length > 2), selectors);
}

// ---- dates and numbers typed into editors ----

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** The same date format, one or more days later; null if the format is not recognised. */
function shiftDate(text, days) {
	const value = String(text).trim();
	let m;
	const add = (y, mo, d) => {
		const date = new Date(y, mo, d + days);
		return date;
	};
	if ((m = value.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/))) {
		const d = add(+m[1], +m[2] - 1, +m[3]);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}${m[4]}`;
	}
	if ((m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/))) {
		// month first unless the first number cannot be a month
		const monthFirst = +m[1] <= 12;
		const d = monthFirst ? add(+m[3], +m[1] - 1, +m[2]) : add(+m[3], +m[2] - 1, +m[1]);
		const pad = (n, like) => (like.length === 2 ? String(n).padStart(2, "0") : String(n));
		return monthFirst ? `${pad(d.getMonth() + 1, m[1])}/${pad(d.getDate(), m[2])}/${d.getFullYear()}${m[4]}`
			: `${pad(d.getDate(), m[1])}/${pad(d.getMonth() + 1, m[2])}/${d.getFullYear()}${m[4]}`;
	}
	if ((m = value.match(/^([A-Z][a-z]{2})[a-z]*\.? (\d{1,2}),? (\d{4})(.*)$/)) && MONTHS.includes(m[1])) {
		const d = add(+m[3], MONTHS.indexOf(m[1]), +m[2]);
		return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}${m[4]}`;
	}
	if ((m = value.match(/^(\d{1,2}) ([A-Z][a-z]{2})[a-z]* (\d{4})(.*)$/)) && MONTHS.includes(m[2])) {
		const d = add(+m[3], MONTHS.indexOf(m[2]), +m[1]);
		return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}${m[4]}`;
	}
	return null;
}
const shiftNumber = (text, delta) => (/\d/.test(text) ? String(text).replace(/\d+(?:\.\d+)?/, (n) => String(Number(n) + delta)) : null);

// ---- following documented keyboard steps ----

async function runSteps(page, profile, steps, press) {
	const sel = profile.selectors;
	const log = [];
	for (const step of steps) {
		if (typeof step === "string") {
			await press(step);
			log.push(step);
			continue;
		}
		if (step.tabTo) {
			let found = false;
			for (let i = 0; i < 25 && !found; i++) {
				found = await page.evaluate((target) => {
					const a = document.activeElement;
					if (!a || a === document.body) {
						return false;
					}
					if (target.selector) {
						return !!a.closest(target.selector);
					}
					const labels = [a.getAttribute("aria-label"), a.getAttribute("placeholder"), a.getAttribute("title"),
						...(a.labels ? [...a.labels].map((l) => l.textContent) : []),
						...(a.getAttribute("aria-labelledby") || "").split(" ").filter(Boolean).map((id) => (document.getElementById(id) || {}).textContent)];
					const wrap = a.closest(".e-float-input, .e-input-group, .b-field, .k-form-field, div");
					if (wrap && wrap.querySelector("label")) {
						labels.push(wrap.querySelector("label").textContent);
					}
					return labels.some((l) => l && l.replace(/\s+/g, " ").trim().toLowerCase().startsWith(target.label));
				}, step.tabTo);
				if (!found) {
					await press("Tab");
				}
			}
			if (!found) {
				return { ok: false, log, error: `Tab did not reach ${step.tabTo.selector ? "an element matching " + step.tabTo.selector : "a field labelled “" + step.tabTo.label + "”"}` };
			}
			log.push(`Tab to ${step.tabTo.label ? "“" + step.tabTo.label + "”" : step.tabTo.selector}`);
			continue;
		}
		if (step.cellTo) {
			const wanted = step.cellTo.toLowerCase();
			let at = await where(page, sel);
			const moves = [];
			for (const key of ["ArrowRight", "ArrowLeft"]) {
				for (let i = 0; i < 12 && !at.header.toLowerCase().startsWith(wanted); i++) {
					const before = at.key;
					await press(key);
					moves.push(key);
					at = await where(page, sel);
					if (at.key === before) {
						break;
					}
				}
			}
			if (!at.header.toLowerCase().startsWith(wanted)) {
				return { ok: false, missing: true, log, error: `no cell under a column header starting “${step.cellTo}” could be reached with the arrow keys` };
			}
			log.push(`arrows to the “${at.header}” cell`);
			continue;
		}
		if (step.typeDate !== undefined || step.typeNumber !== undefined) {
			const value = await page.evaluate(() => {
				const a = document.activeElement;
				return a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA") ? a.value : (a && a.isContentEditable ? a.textContent : null);
			});
			if (value === null) {
				return { ok: false, log, error: "focus is not in a text field" };
			}
			const next = step.typeDate !== undefined ? shiftDate(value, step.typeDate) : shiftNumber(value, step.typeNumber);
			if (next === null) {
				return { ok: false, unknownFormat: true, log, error: `the audit does not recognise the format of “${value}”` };
			}
			await press("ControlOrMeta+A");
			await page.keyboard.type(next, { delay: 30 });
			log.push(`type “${next}” (was “${value}”)`);
			continue;
		}
		if (step.typeOption !== undefined) {
			const target = await page.evaluate((n) => {
				const a = document.activeElement;
				if (!a || a.tagName !== "SELECT") {
					return null;
				}
				const option = a.options[a.selectedIndex + n];
				return option ? { text: option.text.trim(), was: a.options[a.selectedIndex].text.trim() } : null;
			}, step.typeOption);
			if (!target) {
				return { ok: false, log, error: "focus is not in a list box with a further option" };
			}
			await page.keyboard.type(target.text, { delay: 60 });
			log.push(`type \u201c${target.text}\u201d in the list box (was \u201c${target.was}\u201d)`);
			continue;
		}
		return { ok: false, log, error: "unknown step " + JSON.stringify(step) };
	}
	return { ok: true, log };
}

// ---- one page ----

async function auditProfile(browser, profile, base) {
	const out = { id: profile.id, name: profile.name, library: profile.library, extension: profile.extension, url: profile.url, checks: [] };
	const pause = profile.local ? 80 : 300;
	const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
	const cdp = await page.context().newCDPSession(page);
	await cdp.send("Accessibility.enable");
	const press = async (key) => {
		await page.keyboard.press(key);
		await sleep(pause);
	};
	const sel = profile.selectors;
	try {
		let response;
		try {
			response = await page.goto(profile.local ? base + profile.url : profile.url, { waitUntil: "load", timeout: 45000 });
		} catch (error) {
			out.status = "skipped";
			out.reason = "The page did not load: " + cut(error.message, 200);
			return out;
		}
		if (!response || response.status() >= 400) {
			out.status = "skipped";
			out.reason = `HTTP ${response ? response.status() : "no response"}`;
			return out;
		}
		await sleep(profile.local ? 1000 : 6000);
		const inventory = await page.evaluate((sel) => ({
			title: document.title,
			rows: document.querySelectorAll(sel.taskRow).length,
			bars: document.querySelectorAll(sel.bar).length,
			links: document.querySelectorAll(sel.link).length,
			login: !!document.querySelector('input[type="password"]')
		}), sel);
		out.title = inventory.title;
		out.inventory = inventory;
		out.finalUrl = page.url();
		try {
			out.version = (await page.evaluate(profile.version)) || null;
		} catch (error) {
			out.version = null;
		}
		if (inventory.login) {
			out.status = "skipped";
			out.reason = "The page asks for a login.";
			return out;
		}
		if (!inventory.rows) {
			out.status = "skipped";
			out.reason = `No task rows found with "${sel.taskRow}" (the page may have changed).`;
			return out;
		}
		out.status = "checked";
		const names = await taskNames(page, sel);

		// ---- level a: what is in the accessibility tree, before any key press ----
		const treeRow = await axOf(page, cdp, { selector: sel.taskRow, index: Math.min(profile.editFrom || 0, inventory.rows - 1) });
		const treeRowDom = await page.evaluate((sel) => [...document.querySelectorAll(sel.taskRow)].map((row) => ({
			text: row.textContent.replace(/\s+/g, " ").trim(),
			position: !!((row.getAttribute("aria-posinset") && row.getAttribute("aria-setsize")) || row.getAttribute("aria-rowindex")),
			level: row.getAttribute("aria-level")
		})), sel);
		const treeLinks = [];
		for (let i = 0; i < Math.min(inventory.links, 5); i++) {
			const ax = await axOf(page, cdp, { selector: sel.link, index: i });
			if (ax && !ax.ignored && ax.name) {
				treeLinks.push(`${ax.role} ${quote(ax.name, 90)}`);
			}
		}

		// ---- 1. keyboard focus reaches a task row ----
		await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
		let tabs = 0;
		let arrows = 0;
		let at = await where(page, sel);
		const tabLimit = profile.local ? TAB_LIMIT.local : TAB_LIMIT.public;
		while (!at.inRow && tabs < tabLimit) {
			await press("Tab");
			tabs++;
			at = await where(page, sel);
			if (!at.inRow && at.inChart) {
				for (let i = 0; i < 3 && !at.inRow; i++) {
					await press("ArrowDown");
					arrows++;
					at = await where(page, sel);
				}
			}
		}
		const reached = at.inRow;
		out.checks.push(reached
			? result("focusRow", "pass", `Tab ×${tabs}${arrows ? ", ArrowDown ×" + arrows : ""}: focus on ${at.role} ${quote(at.text)}`)
			: result("focusRow", "fail", `Tab ×${tabLimit}${arrows ? " (and ArrowDown inside the chart)" : ""} never put focus on a task row; last focus: ${at.role} ${quote(at.text, 60)}`));

		// move to the task used for the rest (a plain task with links)
		if (reached) {
			for (let i = 0; i < (profile.editFrom || 0); i++) {
				await press("ArrowDown");
			}
			at = await where(page, sel);
		}

		// ---- level b: what focus lands on, here and on the cells the arrow keys reach ----
		const focusItems = [];
		let focusRowAx = null;
		let focusRowDom = null;
		if (reached) {
			const focusAx = await axOf(page, cdp, { active: true });
			focusRowAx = await axOf(page, cdp, { active: true, row: true });
			focusRowDom = await page.evaluate((sel) => {
				let a = document.activeElement;
				const active = a.getAttribute("aria-activedescendant");
				if (active && document.getElementById(active)) {
					a = document.getElementById(active);
				}
				const row = a.closest(sel.taskRow) || a.closest('[role="row"]');
				const grid = row && row.closest('[role="treegrid"], [role="grid"], [role="listbox"]');
				return row && {
					posinset: row.getAttribute("aria-posinset"), setsize: row.getAttribute("aria-setsize"),
					rowindex: row.getAttribute("aria-rowindex"), rowcount: grid ? grid.getAttribute("aria-rowcount") : null
				};
			}, sel);
			if (focusAx) {
				focusItems.push({ via: "focus", header: at.header, name: focusAx.name, description: focusAx.description, role: focusAx.role });
			}
			// cells reached with Right arrow (cell navigation); then back
			let moved = 0;
			for (let i = 0; i < CELL_STEPS; i++) {
				const before = (await where(page, sel)).key;
				await press("ArrowRight");
				const now = await where(page, sel);
				if (now.key === before || !now.inRow) {
					break;
				}
				moved++;
				const ax = await axOf(page, cdp, { active: true });
				if (ax) {
					focusItems.push({ via: `ArrowRight ×${moved}`, header: now.header, name: ax.name, description: ax.description, role: ax.role });
				}
			}
			for (let i = 0; i < moved; i++) {
				await press("ArrowLeft");
			}
		}
		const focusText = (item) => clean(`${item.name} ${item.description}`);
		const describeFocus = (item) => `${item.via}: ${item.role}${item.header ? " in column “" + item.header + "”" : ""} ${quote(focusText(item), 110)}`;

		// ---- level c: documented commands ----
		const commands = profile.commands || {};
		const runCommand = async (key) => {
			if (!key || !reached) {
				return "";
			}
			const before = await announcements(page);
			const nameBefore = (await axOf(page, cdp, { active: true }) || {}).name;
			await press(key);
			await sleep(800);
			const after = await announcements(page);
			const nameAfter = (await axOf(page, cdp, { active: true }) || {}).name;
			if (after.live !== before.live && after.live) {
				return after.live;
			}
			if (after.alert !== before.alert && after.alert) {
				return after.alert;
			}
			return nameAfter !== nameBefore ? nameAfter : "";
		};
		const depCommand = await runCommand(commands.dependencies);
		const whereCommand = await runCommand(commands.whereAmI);

		// ---- 3 to 8. information checks on three levels ----
		const ownName = names[Math.min(profile.editFrom || 0, names.length - 1)] || "";
		const informationCheck = (id, { tree, focus, command, commandKey, note }) => {
			const levels = {
				tree: tree ? { found: true, evidence: tree } : { found: false },
				focus: !reached ? { found: false, evidence: "focus never reached a task row" } : (focus ? { found: true, evidence: focus } : { found: false }),
				command: !commandKey ? { found: false, evidence: "no documented command" } : (command ? { found: true, evidence: `${commandKey}: ${quote(command)}` } : { found: false, evidence: `${commandKey}: nothing new` })
			};
			const value = levels.focus.found || levels.command.found ? "pass" : (levels.tree.found ? "present but not reachable" : "fail");
			const parts = [`a) tree: ${levels.tree.found ? tree : "no"}`, `b) focus: ${levels.focus.found ? focus : (levels.focus.evidence || "no")}`, `c) command: ${levels.command.found ? levels.command.evidence : levels.command.evidence || "no"}`];
			return result(id, value, parts.join(". "), note || "", { levels });
		};

		const firstWith = (test) => focusItems.find((item) => test(focusText(item), item));
		// name
		const nameFocus = firstWith((text) => text.length > 0);
		out.checks.push(informationCheck("taskName", {
			tree: treeRow && treeRow.name ? `${treeRow.role} ${quote(treeRow.name)}` : null,
			focus: nameFocus ? describeFocus(nameFocus) : null
		}));
		// dates
		const treeDates = (treeRow && DATE_PATTERN.test(treeRow.name) && treeRow.name) || (treeRowDom.find((r) => DATE_PATTERN.test(r.text)) || {}).text;
		const datesFocus = firstWith((text) => DATE_PATTERN.test(text));
		out.checks.push(informationCheck("taskDates", {
			tree: treeDates ? quote(treeDates) : null,
			focus: datesFocus ? describeFocus(datesFocus) : null,
			note: datesFocus && datesFocus.via !== "focus" ? "On another cell of the row: heard only when moving to it with the arrow keys." : ""
		}));
		// dependencies
		const otherNames = names.filter((n) => n !== ownName && n.length > 2);
		const isDependencyText = (text, item) => (item && /predecessor|successor|depend/i.test(item.header || "") && text.length > 0)
			|| (DEPENDENCY_WORDS.test(text) && otherNames.some((n) => text.includes(n)));
		const depFocus = firstWith((text, item) => isDependencyText(text, item));
		const linkFocusable = await page.evaluate((s) => [...document.querySelectorAll(s)].filter((el) => el.tabIndex >= 0).length, sel.link);
		out.checks.push(informationCheck("dependencies", {
			tree: treeLinks.length ? `link elements: ${treeLinks.join("; ")}` : null,
			focus: depFocus ? describeFocus(depFocus) : (linkFocusable ? `${linkFocusable} link elements are focusable` : null),
			command: depCommand && isDependencyText(depCommand) ? depCommand : (depCommand ? "" : ""),
			commandKey: commands.dependencies
		}));
		// dependency names: the reachable dependency text names tasks
		const reachableDep = (depFocus ? focusText(depFocus) : "") + " " + (depCommand || "");
		const namedReachable = otherNames.filter((n) => reachableDep.includes(n));
		const namedTree = otherNames.filter((n) => treeLinks.join(" ").includes(n));
		out.checks.push(namedReachable.length
			? result("dependencyNames", "pass", `In reachable dependency text: ${namedReachable.slice(0, 4).map((n) => quote(n, 40)).join(", ")}`)
			: namedTree.length
				? result("dependencyNames", "present but not reachable", `Only in the accessibility tree: ${namedTree.slice(0, 4).map((n) => quote(n, 40)).join(", ")}`)
				: result("dependencyNames", "not applicable", "No dependency text found at any level."));
		// level
		const treeLevel = treeRow && treeRow.props.level ? `${treeRow.role}: level ${treeRow.props.level}` : (treeRowDom.find((r) => r.level) ? "aria-level on rows" : null);
		const focusLevel = focusRowAx && focusRowAx.props.level ? `${focusRowAx.role} holding focus: level ${focusRowAx.props.level}` : null;
		const isFlat = (focusRowAx || treeRow || {}).role === "option";
		out.checks.push(isFlat
			? result("level", "not applicable", "A flat list of options has no levels.")
			: informationCheck("level", { tree: treeLevel, focus: focusLevel, command: whereCommand && /level/i.test(whereCommand) ? whereCommand : "", commandKey: commands.whereAmI }));
		// position
		const treePosition = treeRowDom.some((r) => r.position) ? "aria-posinset/aria-setsize or aria-rowindex on rows" : null;
		const focusPosition = focusRowDom && ((focusRowDom.posinset && focusRowDom.setsize) || (focusRowDom.rowindex && focusRowDom.rowcount))
			? `row holding focus: aria-posinset ${focusRowDom.posinset}, aria-setsize ${focusRowDom.setsize}, aria-rowindex ${focusRowDom.rowindex}, aria-rowcount ${focusRowDom.rowcount}` : null;
		out.checks.push(informationCheck("position", {
			tree: treePosition, focus: focusPosition,
			command: whereCommand && /\b\d+ of \d+\b/.test(whereCommand) ? whereCommand : "", commandKey: commands.whereAmI,
			note: "Without explicit attributes a screen reader counts the rows in the DOM, which is right only while every row is rendered and none is filtered out."
		}));

		// ---- 9. a live region on the page ----
		const regions = await page.evaluate(() => [...document.querySelectorAll('[aria-live]:not([aria-live="off"]), [role="status"], [role="log"], [role="alert"]')]
			.map((el) => (el.getAttribute("role") ? "role=" + el.getAttribute("role") : "aria-live=" + el.getAttribute("aria-live"))));
		out.checks.push(regions.length
			? result("liveRegion", "pass", `${regions.length}: ${regions.slice(0, 4).join(", ")}`)
			: result("liveRegion", "fail", "No aria-live region or status/log/alert role on the page"));

		// ---- 15. keyboard help on the page ----
		const helpText = commands.help ? await runCommand(commands.help) : "";
		const helpOnPage = await page.evaluate(({ sel, words }) => {
			const re = new RegExp(words);
			const chart = document.querySelector(sel.chart);
			const shortcuts = [...document.querySelectorAll("[aria-keyshortcuts]")].length;
			const described = [...document.querySelectorAll(`${sel.chart} [aria-describedby], ${sel.chart}[aria-describedby], [role="grid"][aria-describedby], [role="treegrid"][aria-describedby]`)]
				.map((el) => (el.getAttribute("aria-describedby") || "").split(" ").map((id) => (document.getElementById(id) || {}).textContent || "").join(" "))
				.filter((t) => re.test(t));
			let pageText = "";
			const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
			for (let n = walker.nextNode(); n; n = walker.nextNode()) {
				const el = n.parentElement;
				if (!el || (chart && chart.contains(el)) || el.closest("script, style, [hidden], [aria-hidden='true']")) {
					continue;
				}
				const t = n.textContent.replace(/\s+/g, " ").trim();
				if (t.length > 12 && re.test(t) && /(press|key|shortcut|navigate|arrow)/i.test(t)) {
					pageText = t;
					break;
				}
			}
			return { shortcuts, described: described[0] || "", pageText };
		}, { sel, words: KEY_WORDS.source });
		const helpWays = [];
		if (helpText) {
			helpWays.push(`${commands.help} (documented command): ${quote(helpText)}`);
		}
		if (helpOnPage.shortcuts) {
			helpWays.push(`${helpOnPage.shortcuts} elements with aria-keyshortcuts`);
		}
		if (helpOnPage.described) {
			helpWays.push(`a description of the chart: ${quote(helpOnPage.described)}`);
		}
		if (helpOnPage.pageText) {
			helpWays.push(`text on the page outside the chart (written by the page's authors): ${quote(helpOnPage.pageText)}`);
		}
		out.checks.push(helpWays.length
			? result("keyboardHelp", "pass", helpWays.join(". "), helpText || helpOnPage.shortcuts || helpOnPage.described ? "" : "Only the page's own text: a product configured differently may have none.")
			: result("keyboardHelp", "fail", "No help command in the documentation, no aria-keyshortcuts, no description of the chart, and no page text about keys."));

		// ---- 14. focus after closing the task form ----
		if (reached) {
			const startRow = (await where(page, sel)).rowId;
			// only a dialog that appears after Enter counts (not, say, a consent banner already open)
			const markDialogs = () => page.evaluate(() => {
				const visible = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], [aria-modal="true"], .gantt_cal_light')]
					.filter((el) => el.offsetParent !== null || el.getClientRects().length);
				const fresh = visible.filter((el) => !el.hasAttribute("data-audit-seen"));
				visible.forEach((el) => el.setAttribute("data-audit-seen", ""));
				const d = fresh[0];
				return d ? (d.getAttribute("aria-label") || d.getAttribute("role") || d.className || "dialog").toString().slice(0, 60) : null;
			});
			await markDialogs();
			await press("Enter");
			await sleep(1000);
			const dialog = await markDialogs();
			if (!dialog) {
				out.checks.push(result("formFocus", "not applicable", "Enter on a task row opened no dialog."));
				if (!(await where(page, sel)).inRow) {
					await press("Escape");
				}
			} else {
				await press("Escape");
				await sleep(1000);
				const back = await where(page, sel);
				out.checks.push(back.inRow && back.rowId === startRow
					? result("formFocus", "pass", `Enter opened ${quote(dialog, 60)}; after Escape focus is back on the same task row (${back.role} ${quote(back.text)})`)
					: result("formFocus", "fail", `Enter opened ${quote(dialog, 60)}; after Escape focus is on ${back.role} ${quote(back.text)}${back.inRow ? " (another row)" : ""}`));
			}
			// cell navigation may leave the cell editor open after Enter
			if ((await where(page, sel)).isInput) {
				await press("Escape");
				await press("Escape");
			}
		} else {
			out.checks.push(result("formFocus", "could not determine", "Focus never reached a task row."));
		}

		// ---- 10 to 13. edits along documented keyboard paths ----
		const paths = profile.paths || {};
		let announced = null;
		const edit = async (id, kind) => {
			const p = paths[kind];
			if (!p) {
				return result(id, "could not determine", "The audit has no information on a keyboard path for this.");
			}
			if (p.none) {
				return result(id, "no documented keyboard path", p.none, "", { sources: p.sources });
			}
			if (!reached) {
				return result(id, "could not determine", "Focus never reached a task row.", "", { sources: p.sources });
			}
			// move to the cell first, so that "before" is the element the edit happens on
			const lead = [];
			while (lead.length < p.steps.length && p.steps[lead.length] && p.steps[lead.length].cellTo) {
				lead.push(p.steps[lead.length]);
			}
			let run = await runSteps(page, profile, lead, press);
			const spot = await where(page, sel);
			const nameBefore = (await axOf(page, cdp, { active: true }) || {}).name;
			const before = await announcements(page);
			const boxes = await barBoxes(page, sel.bar);
			const links = await page.evaluate((s) => document.querySelectorAll(s).length, sel.link);
			if (run.ok) {
				const rest = await runSteps(page, profile, p.steps.slice(lead.length), press);
				run = { ...rest, log: [...run.log, ...rest.log] };
			}
			await sleep(1500);
			const after = await announcements(page);
			const boxesAfter = await barBoxes(page, sel.bar);
			const linksAfter = await page.evaluate((s) => document.querySelectorAll(s).length, sel.link);
			const focusNow = await where(page, sel);
			const nameAfter = (await axOf(page, cdp, { active: true }) || {}).name;
			const changed = kind === "date" ? boxesAfter.filter((b, i) => boxes[i] && b.x !== boxes[i].x).length
				: kind === "duration" ? boxesAfter.filter((b, i) => boxes[i] && b.w !== boxes[i].w).length
					: linksAfter - links;
			const steps = run.log.join(", ") || "(none)";
			// leave any editor or dialog that is still open
			if (focusNow.isInput || !focusNow.inRow) {
				await press("Escape");
				await press("Escape");
			}
			if (!run.ok) {
				const value = run.unknownFormat ? "could not determine" : "fail";
				const note = run.unknownFormat ? "A limit of the audit, not of the page." : "The documented keys did not work in this demo; the demo's configuration (for example, which columns it shows or whether editing is on) may be the reason.";
				return result(id, value, `Steps: ${steps}. Stopped: ${run.error}.`, note, { sources: p.sources });
			}
			if (changed > 0 && !announced) {
				const ways = [];
				if (after.live && after.live !== before.live) {
					ways.push(`live region: ${quote(after.live)}`);
				}
				if (after.alert && after.alert !== before.alert) {
					ways.push(`role alert/status: ${quote(after.alert)}`);
				}
				// only a change on the same element counts, not a move to another one
				if (nameAfter && nameAfter !== nameBefore && focusNow.rowId === spot.rowId && focusNow.header === spot.header) {
					ways.push(`accessible name of the focused element changed: ${quote(nameBefore, 70)} → ${quote(nameAfter, 110)}`);
				}
				announced = { kind, ways, focus: `${focusNow.role} ${quote(focusNow.text, 60)}` };
			}
			const what = kind === "link" ? `link elements ${links} → ${linksAfter}` : `${changed} bar(s) ${kind === "date" ? "moved" : "changed width"}`;
			return changed > 0
				? result(id, "pass", `Steps: ${steps}. ${what}.`, "", { sources: p.sources })
				: result(id, "fail", `Steps: ${steps}. ${what}.`, "The documented keys were pressed, but nothing changed in this demo; its configuration may be the reason.", { sources: p.sources });
		};
		out.checks.push(await edit("changeDate", "date"));
		out.checks.push(await edit("changeDuration", "duration"));
		out.checks.push(await edit("createLink", "link"));
		if (announced) {
			out.checks.push(announced.ways.length
				? result("editAnnounced", "pass", `After the ${announced.kind} edit: ${announced.ways.join("; ")}.`)
				: result("editAnnounced", "fail", `After the ${announced.kind} edit nothing reached assistive technology: no live region or alert text, and the focused element's name did not change (focus: ${announced.focus}).`));
		} else {
			const none = out.checks.filter((c) => ["changeDate", "changeDuration", "createLink"].includes(c.id)).every((c) => c.result === "no documented keyboard path");
			out.checks.push(result("editAnnounced", none ? "no documented keyboard path" : "not applicable", none ? "No documented keyboard path for any edit." : "No keyboard edit succeeded, so there was no result to announce."));
		}

		// ---- 16. the extension's keys against the library's documented keys ----
		out.checks.push(await keyConflicts(page, profile));

		// ---- 2. keyboard focus reaches a task bar (last: it moves focus away) ----
		if (!inventory.bars) {
			out.checks.push(result("focusBar", "could not determine", `No bars found with "${sel.bar}".`));
		} else {
			let barTabs = 0;
			let barArrows = 0;
			let atBar = await where(page, sel);
			while (!atBar.inBar && barTabs < BAR_TAB_LIMIT) {
				await press("Tab");
				barTabs++;
				atBar = await where(page, sel);
			}
			if (!atBar.inBar && reached) {
				for (let i = 0; i < 4 && !atBar.inBar; i++) {
					await press("ArrowRight");
					barArrows++;
					atBar = await where(page, sel);
				}
			}
			const focusable = await page.evaluate((s) => [...document.querySelectorAll(s)].filter((el) => el.tabIndex >= 0 || el.querySelector("[tabindex]")).length, sel.bar);
			out.checks.push(atBar.inBar
				? result("focusBar", "pass", `Tab ×${barTabs}${barArrows ? ", ArrowRight ×" + barArrows : ""}: focus on ${atBar.role} ${quote(atBar.text)}`)
				: result("focusBar", "fail", `Tab ×${BAR_TAB_LIMIT} and ArrowRight never put focus on a bar; ${focusable} of ${inventory.bars} bars have a tabindex`));
		}
		return out;
	} catch (error) {
		out.status = out.status || "error";
		out.error = cut(error.message, 300);
		return out;
	} finally {
		await page.close();
	}
}

const server = await serve(process.cwd());
const browser = await chromium.launch();
const started = new Date();
const report = { protocol: PROTOCOL_VERSION, date: started.toISOString(), browser: "Chromium " + browser.version(), profiles: [] };
try {
	for (const profile of selected) {
		process.stdout.write(`${profile.id} … `);
		const out = await auditProfile(browser, profile, server.url);
		report.profiles.push(out);
		console.log(out.status === "checked" ? out.checks.map((c) => `${c.id}:${c.result}`).join(" ") : out.status + ": " + (out.reason || out.error));
		if (!profile.local) {
			await sleep(3000);
		}
	}
} finally {
	await browser.close();
	await server.close();
}

// Everything goes to audit/private/results/ (not in git). Only the demos of
// this repository go to audit/results/: results for other libraries' pages
// are not published until they have been confirmed by hand (PROTOCOL.md).
const name = `${started.toISOString().slice(0, 10)}-v${PROTOCOL_VERSION}${fullRun ? "" : "-partial"}`;
const write = (dir, data, previous) => {
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, name + ".json"), JSON.stringify(data, null, "\t") + "\n");
	fs.writeFileSync(path.join(dir, name + ".md"), renderMarkdown(data, { previous: fullRun ? path.join(previous, "2026-11-16.json") : null }));
	console.log(`${dir}/${name}.json and .md`);
};
const published = path.join("audit", "results");
write(path.join("audit", "private", "results"), report, path.join("audit", "private", "results"));
const profileOf = (id) => profiles.find((p) => p.id === id) || {};
const ours = report.profiles.filter((p) => profileOf(p.id).local && !profileOf(p.id).fixture);
if (ours.length) {
	write(published, { ...report, profiles: ours }, published);
}
