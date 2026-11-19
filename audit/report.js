// The checks (audit/PROTOCOL.md describes each), the Markdown table, and the
// list of cells that changed since the previous protocol version.
import fs from "node:fs";

export const PROTOCOL_VERSION = 2;

export const CHECKS = {
	focusRow: { title: "Keyboard focus reaches a task row" },
	focusBar: { title: "Keyboard focus reaches a task bar" },
	taskName: { title: "A task's name is available", levels: true },
	taskDates: { title: "A task's dates are available", levels: true },
	dependencies: { title: "Dependencies are available as text", levels: true },
	dependencyNames: { title: "Dependencies name the tasks" },
	level: { title: "Level in the hierarchy is available", levels: true },
	position: { title: "Position in the list is available", levels: true },
	liveRegion: { title: "The page has a live region" },
	editAnnounced: { title: "The result of an edit reaches the user" },
	changeDate: { title: "Dates can be changed from the keyboard" },
	changeDuration: { title: "Duration can be changed from the keyboard" },
	createLink: { title: "A link can be created from the keyboard" },
	formFocus: { title: "Focus returns to the task after closing the form" },
	keyboardHelp: { title: "The page tells the user which keys exist" },
	keyConflicts: { title: "The extension's keys do not overlap the library's documented keys" }
};

const SHORT = {
	pass: "pass",
	fail: "fail",
	"present but not reachable": "tree only",
	"no documented keyboard path": "no path",
	"not applicable": "n/a",
	"could not determine": "?"
};

// Checks renamed or replaced since version 1.
const V1_ID = { editAnnounced: "liveAfterEdit" };

// Why a cell can differ from version 1.
const REASON = {
	taskName: "Version 2 counts a name only on an element that keyboard focus reaches, or after a documented command; a name elsewhere in the accessibility tree is “present but not reachable”.",
	taskDates: "Version 2 counts dates only on what keyboard focus reaches (including the cells the arrow keys reach) or after a documented command.",
	dependencies: "Version 1 counted dependency text anywhere in the accessibility tree; version 2 requires it on an element that keyboard focus reaches, or after a documented command.",
	dependencyNames: "Version 2 looks only at dependency text that can be reached from the keyboard.",
	level: "Version 2 looks at the row that holds keyboard focus, and at documented commands.",
	position: "Version 2 looks at the row that holds keyboard focus, and at documented commands (gantt-a11y's Shift+W).",
	editAnnounced: "Replaces “text in a live region after an edit”: a live region, an alert or status, or a change of the focused element's name all count.",
	changeDate: "Version 2 follows the keyboard paths documented by each library (sources in profiles.js); without one the result is “no documented keyboard path”.",
	changeDuration: "Version 2 follows the keyboard paths documented by each library (sources in profiles.js); without one the result is “no documented keyboard path”.",
	createLink: "Version 2 follows the keyboard paths documented by each library (sources in profiles.js); without one the result is “no documented keyboard path”.",
	focusRow: "Same method in both versions: a difference between the two runs.",
	focusBar: "Same check, but in version 2 it runs after the edit attempts and so starts from another place on the page; the difference may come from that.",
	liveRegion: "Same method in both versions: a difference between the two runs.",
	formFocus: "Same check, but in version 2 Enter is pressed on the task row after the arrow keys have explored its cells; on a grid with cell editing Enter may then open a cell editor, which this check counts as a form."
};

const md = (text) => String(text == null ? "" : text).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

function previousCells(file) {
	if (!file || !fs.existsSync(file)) {
		return null;
	}
	const old = JSON.parse(fs.readFileSync(file, "utf8"));
	const cells = {};
	for (const p of old.profiles) {
		for (const c of p.checks || []) {
			cells[`${p.id}/${c.id}`] = c;
		}
	}
	return { date: old.date.slice(0, 10), cells };
}

export function renderMarkdown(report, { previous = null } = {}) {
	const prev = previousCells(previous);
	const checked = report.profiles.filter((p) => p.status === "checked");
	const skipped = report.profiles.filter((p) => p.status !== "checked");
	const changes = [];
	const cellOf = (p, id) => {
		const c = p.checks.find((x) => x.id === id);
		if (!c) {
			return "";
		}
		let text = SHORT[c.result] || c.result;
		if (prev) {
			const old = prev.cells[`${p.id}/${V1_ID[id] || id}`];
			const oldShort = old ? SHORT[old.result] || old.result : "(new check)";
			if (!old || oldShort !== text) {
				text += " †";
				changes.push({ profile: p.name, check: CHECKS[id].title, from: oldShort, to: text.replace(" †", ""), reason: old ? REASON[id] : "New check in version 2." });
			}
		}
		return text;
	};

	const lines = [];
	lines.push(`# Gantt accessibility audit, ${report.date.slice(0, 10)} (protocol version ${report.protocol})`);
	lines.push("");
	lines.push("> This audit checks keyboard behaviour and what the browser hands to assistive technology, in an automated browser (" + report.browser + "). It is not a test with a screen reader and not a statement about WCAG conformance. See [PROTOCOL.md](../PROTOCOL.md) for what each check does, what each result means and what it does not prove, and its threats to validity.");
	lines.push("");
	lines.push("Results: **pass**; **fail**; **tree only** (present in the accessibility tree, but not on anything keyboard focus reaches and not after a documented command); **no path** (no documented keyboard path); **n/a** (not applicable); **?** (could not determine)." + (prev ? ` † marks a cell that differs from the version 1 run of ${prev.date} (audit/results/${prev.date}.md); the reasons are listed under the table.` : ""));
	lines.push("");
	if (checked.length) {
		lines.push("| Check | " + checked.map((p) => md(p.name)).join(" | ") + " |");
		lines.push("|---|" + checked.map(() => "---").join("|") + "|");
		for (const id of Object.keys(CHECKS)) {
			lines.push(`| ${CHECKS[id].title} | ${checked.map((p) => cellOf(p, id)).join(" | ")} |`);
		}
		lines.push("");
	}
	if (prev && changes.length) {
		lines.push(`## Changes since version 1 (${prev.date})`);
		lines.push("");
		lines.push("| Page | Check | Version 1 | Version 2 | Why |");
		lines.push("|---|---|---|---|---|");
		for (const c of changes) {
			lines.push(`| ${md(c.profile)} | ${md(c.check)} | ${md(c.from)} | ${md(c.to)} | ${md(c.reason)} |`);
		}
		lines.push("");
	}
	if (skipped.length) {
		lines.push("## Not checked");
		lines.push("");
		for (const p of skipped) {
			lines.push(`- ${md(p.name)} (${p.url}): ${md(p.reason || p.error || p.status)}`);
		}
		lines.push("");
	}
	lines.push("## Pages");
	lines.push("");
	for (const p of report.profiles) {
		lines.push(`### ${md(p.name)}`);
		lines.push("");
		lines.push(`- URL: ${p.url}${p.finalUrl && !p.finalUrl.startsWith("http://127.0.0.1") && p.finalUrl !== p.url ? " (opened as " + p.finalUrl + ")" : ""}`);
		lines.push(`- Library: ${md(p.library)}${p.version ? " " + md(p.version) : " (version not visible on the page)"}; gantt-a11y: ${p.extension ? "on" : "off"}`);
		if (p.inventory) {
			lines.push(`- Found: ${p.inventory.rows} task rows, ${p.inventory.bars} bars, ${p.inventory.links} link elements`);
		}
		lines.push(`- Status: ${p.status}${p.reason ? " — " + md(p.reason) : ""}${p.error ? " — error: " + md(p.error) : ""}`);
		lines.push("");
		if (p.checks && p.checks.length) {
			lines.push("| Check | Result | Evidence |");
			lines.push("|---|---|---|");
			for (const c of p.checks.slice().sort((a, b) => Object.keys(CHECKS).indexOf(a.id) - Object.keys(CHECKS).indexOf(b.id))) {
				const sources = c.sources && c.sources.length ? ` Sources: ${c.sources.join("; ")}.` : "";
				lines.push(`| ${CHECKS[c.id].title} | ${c.result} | ${md(c.evidence)}${c.note ? " _" + md(c.note) + "_" : ""}${md(sources)} |`);
			}
			lines.push("");
		}
	}
	return lines.join("\n");
}
