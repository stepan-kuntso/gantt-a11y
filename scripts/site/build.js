// Builds the static site in site/ (npm run site). The output is committed, so
// serving the folder needs no build step; this script only regenerates it.
// Everything the pages load is copied into site/ (no network requests).
import fs from "node:fs";
import path from "node:path";
import { markdownToHtml } from "./markdown.js";
import { DEFAULT_KEYS } from "../../src/core/engine.js";
import { defaultStrings } from "../../src/core/strings.js";
import { spokenKey } from "../../src/core/keys.js";
import { COMMAND_GROUPS } from "../../src/core/text/help.js";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "site");
const HERE = path.join(ROOT, "scripts", "site");

const NAV = [
	["index.html", "Home"],
	["demo-dhtmlx.html", "Demo: dhtmlx-gantt"],
	["demo-frappe.html", "Demo: frappe-gantt"],
	["screen-readers.html", "Try with a screen reader"],
	["spec.html", "Announcements"],
	["audit.html", "Audit"]
];

const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function layout({ file, title, content, head = "", wide = false }) {
	const nav = NAV.map(([href, label]) => `<li><a href="${href}"${href === file ? " aria-current=\"page\"" : ""}>${label}</a></li>`).join("\n\t\t\t");
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escape(title)} · gantt-a11y</title>
	<link rel="stylesheet" href="style.css">${head}
</head>
<body>
	<a class="skip" href="#main">Skip to content</a>
	<header class="site-header">
		<p class="brand"><a href="index.html">gantt-a11y</a></p>
		<nav aria-label="Main">
			<ul>
			${nav}
			</ul>
		</nav>
	</header>
	<main id="main" tabindex="-1"${wide ? " class=\"wide\"" : ""}>
${content}
	</main>
	<footer>
		<p>gantt-a11y is open source under the MIT licence. Checked by its sighted author with VoiceOver (full pass) and NVDA (partial); no feedback yet from people who use a screen reader every day; no claim of WCAG conformance.</p>
		<p>dhtmlx-gantt (MIT, XB Software) and frappe-gantt (MIT, Frappe Technologies) are separate projects. This project is not affiliated with or endorsed by XB Software (DHTMLX) or Frappe. <a href="about.html">About this site</a>.</p>
	</footer>
</body>
</html>
`;
}

// ---- the keys table, from the extension's own defaults ----

const GROUP_NAMES = { reading: "Reading", orientation: "Orientation", moving: "Moving focus", changing: "Changing", links: "Links", other: "Other" };
function keysTable({ caption, without = [] }) {
	const rows = [];
	let group = null;
	const ids = Object.keys(DEFAULT_KEYS).filter((id) => !without.includes(id));
	ids.sort((a, b) => Object.keys(GROUP_NAMES).indexOf(COMMAND_GROUPS[a] || "other") - Object.keys(GROUP_NAMES).indexOf(COMMAND_GROUPS[b] || "other"));
	for (const id of ids) {
		const g = COMMAND_GROUPS[id] || "other";
		if (g !== group) {
			group = g;
			rows.push(`<tr><th scope="rowgroup" colspan="2">${GROUP_NAMES[g]}</th></tr>`);
		}
		const keys = DEFAULT_KEYS[id].split("+").map((k) => `<kbd>${escape(spokenKey(k, defaultStrings))}</kbd>`).join("+");
		rows.push(`<tr><td>${keys}</td><td>${escape(defaultStrings.shortcuts[id])}</td></tr>`);
	}
	return `<table class="keys">
	<caption>${caption}</caption>
	<thead><tr><th scope="col">Keys</th><th scope="col">Command</th></tr></thead>
	<tbody>
	${rows.join("\n\t")}
	</tbody>
</table>`;
}

// ---- pages from fragments ----

function fragment(name) {
	const source = fs.readFileSync(path.join(HERE, "pages", name), "utf8");
	const title = (source.match(/<!-- title: (.*?) -->/) || [])[1] || name;
	return { title, content: source.replace(/<!-- title: .*? -->\n?/, "") };
}

const DATA = `{
			data: [
				{ id: 1, text: "Website redesign", type: "project", open: true },
				{ id: 2, text: "Software design", start_date: "2026-06-01", duration: 4, parent: 1 },
				{ id: 3, text: "Implementation", start_date: "2026-06-05", duration: 8, parent: 1 },
				{ id: 4, text: "Testing", start_date: "2026-06-13", duration: 5, parent: 1, progress: 0.4 },
				{ id: 5, text: "Documentation", start_date: "2026-06-05", duration: 10, parent: 1 },
				{ id: 6, text: "Code review", start_date: "2026-06-08", duration: 5, parent: 1 },
				{ id: 7, text: "Launch", start_date: "2026-06-18", duration: 1, parent: 1 },
				{ id: 8, text: "Marketing prep &amp; PR", start_date: "2026-06-10", duration: 9, parent: 1 },
				{ id: 9, text: "Retrospective", start_date: "2026-06-22", duration: 1, parent: 1 },
				{ id: 10, text: "Go-live", type: "milestone", start_date: "2026-06-20", parent: 1 },
				{ id: 11, text: "Budget approval", start_date: "2026-06-02", duration: 2, parent: 1, readonly: true }
			],
			links: [
				{ id: 1, source: 2, target: 3, type: "0" }, { id: 2, source: 3, target: 4, type: "0" },
				{ id: 3, source: 3, target: 5, type: "1" }, { id: 4, source: 3, target: 6, type: "2" },
				{ id: 5, source: 7, target: 8, type: "3" }, { id: 6, source: 4, target: 7, type: "0" },
				{ id: 7, source: 5, target: 7, type: "0" }, { id: 8, source: 6, target: 7, type: "0" },
				{ id: 9, source: 11, target: 7, type: "0" }, { id: 10, source: 2, target: 7, type: "1" }
			]
		}`;

const SWITCH = `<div class="switch">
			<button type="button" id="toggle" aria-pressed="true">gantt-a11y</button>
			<span id="state">on: the chart speaks the extension's answers</span>
		</div>`;

const SWITCH_SCRIPT = `
		const toggle = document.getElementById("toggle");
		const state = document.getElementById("state");
		function show() {
			toggle.setAttribute("aria-pressed", a11y ? "true" : "false");
			state.textContent = a11y ? "on: the chart speaks the extension's answers" : "off: the library on its own";
		}
		toggle.addEventListener("click", () => {
			if (a11y) {
				a11y.disable();
				a11y = null;
			} else {
				a11y = enable();
			}
			show();
		});
		show();`;

function dhtmlxDemo() {
	const content = `<h1>Demo: dhtmlx-gantt</h1>
<p class="lead">dhtmlx-gantt 10.0.3 Community Edition with its keyboard navigation, with and without gantt-a11y.</p>
<div class="demo">
	<section class="demo-chart" aria-labelledby="chart-title">
		<h2 id="chart-title">The chart</h2>
		<p>Press <kbd>Tab</kbd> to move into the chart, then the arrow keys. In the data, "Launch" depends on five tasks, "Go-live" is a milestone, "Budget approval" is read-only. Reload the page to restore the data.</p>
		${SWITCH}
		<div id="gantt_here" class="chart-box"></div>
	</section>
	<aside aria-labelledby="keys-title">
		<h2 id="keys-title">Keys</h2>
		${keysTable({ caption: "Keys on a focused task row" })}
		<p>Shift+J, K, I and M form a cross on a QWERTY keyboard: earlier, later, longer, shorter. The library's own keys still work: <kbd>Enter</kbd> opens the task form, <kbd>Control</kbd>+<kbd>Enter</kbd> adds a subtask.</p>
	</aside>
</div>
<script src="vendor/dhtmlx-gantt/dhtmlxgantt.js"></script>
<script type="module">
		import { enableGanttA11y } from "./vendor/gantt-a11y/src/index.js";
		gantt.plugins({ keyboard_navigation: true });
		gantt.config.date_format = "%Y-%m-%d";
		gantt.init("gantt_here");
		gantt.parse(${DATA});
		const enable = () => enableGanttA11y(gantt, { features: { rowLabel: true } });
		let a11y = enable();
		${SWITCH_SCRIPT}
</script>`;
	return layout({ file: "demo-dhtmlx.html", title: "Demo: dhtmlx-gantt", content, wide: true, head: "\n\t<link rel=\"stylesheet\" href=\"vendor/dhtmlx-gantt/dhtmlxgantt.css\">" });
}

function frappeDemo() {
	const content = `<h1>Demo: frappe-gantt</h1>
<p class="lead">frappe-gantt 1.2.2 has no keyboard support of its own. With gantt-a11y, a task list next to the chart takes the focus and the same commands work on it.</p>
<div class="demo">
	<section class="demo-chart" aria-labelledby="chart-title">
		<h2 id="chart-title">The chart</h2>
		<p>Press <kbd>Tab</kbd> to move into the task list, then up and down. Not available here: the task form (frappe-gantt has none), link types other than finish to start, and tasks inside tasks. Reload the page to restore the data.</p>
		${SWITCH}
		<div class="frappe-layout">
			<div class="tasks" id="tasks"></div>
			<div id="chart"></div>
		</div>
	</section>
	<aside aria-labelledby="keys-title">
		<h2 id="keys-title">Keys</h2>
		${keysTable({ caption: "Keys on a focused task in the list" })}
		<p>Shift+J, K, I and M form a cross on a QWERTY keyboard: earlier, later, longer, shorter. Without the extension the list is not there, and the chart cannot be reached from the keyboard.</p>
	</aside>
</div>
<script type="module">
		import Gantt from "./vendor/frappe-gantt/frappe-gantt.es.js";
		import { enableFrappeGanttA11y } from "./vendor/gantt-a11y/src/index.js";
		const tasks = [
			{ id: "design", name: "Software design", start: "2026-06-01", end: "2026-06-04", progress: 100 },
			{ id: "budget", name: "Budget approval", start: "2026-06-02", end: "2026-06-03", progress: 0, readonly: true },
			{ id: "build", name: "Implementation", start: "2026-06-05", end: "2026-06-12", progress: 50, dependencies: "design" },
			{ id: "review", name: "Code review", start: "2026-06-08", end: "2026-06-12", progress: 0, dependencies: "design" },
			{ id: "docs", name: "Documentation", start: "2026-06-05", end: "2026-06-14", progress: 0 },
			{ id: "test", name: "Testing", start: "2026-06-13", end: "2026-06-17", progress: 40, dependencies: "build" },
			{ id: "marketing", name: "Marketing", start: "2026-06-10", end: "2026-06-18", progress: 0 },
			{ id: "launch", name: "Launch", start: "2026-06-18", end: "2026-06-18", progress: 0, dependencies: "test, docs, review, budget" },
			{ id: "retro", name: "Retrospective", start: "2026-06-22", end: "2026-06-22", progress: 0 }
		];
		let a11y = null;
		const chart = new Gantt("#chart", tasks, {
			view_mode: "Day", popup: false,
			on_date_change: () => a11y && a11y.refresh(),
			on_progress_change: () => a11y && a11y.refresh()
		});
		const enable = () => enableFrappeGanttA11y(chart, {
			tasks, listContainer: document.getElementById("tasks"), endDate: "lastDay", features: { rowLabel: true }
		});
		a11y = enable();
		${SWITCH_SCRIPT}
</script>`;
	return layout({ file: "demo-frappe.html", title: "Demo: frappe-gantt", content, wide: true, head: "\n\t<link rel=\"stylesheet\" href=\"vendor/frappe-gantt/frappe-gantt.css\">" });
}

// ---- pages from the repository's Markdown documents ----

const LINKS = {
	"PROTOCOL.md": "audit.html#protocol",
	"../PROTOCOL.md": "audit.html#protocol",
	"README.md": "audit.html",
	"../ANNOUNCEMENTS.md": "spec.html",
	"docs/ANNOUNCEMENTS.md": "spec.html"
};
const linkFor = (href) => {
	if (/^https?:/.test(href)) {
		return null; // the site makes no outside requests and links nowhere outside
	}
	if (href.startsWith("#")) {
		return href;
	}
	const [file, hash] = href.split("#");
	return LINKS[file] ? LINKS[file].split("#")[0] + (hash ? "#" + hash : (LINKS[file].includes("#") ? "#" + LINKS[file].split("#")[1] : "")) : null;
};

function specPage() {
	const source = fs.readFileSync(path.join(ROOT, "docs", "ANNOUNCEMENTS.md"), "utf8");
	const content = `<p class="note">This page is <code>docs/ANNOUNCEMENTS.md</code> from the repository. Wordings marked [A] are hypotheses that still need testing with people who use screen readers.</p>\n` + markdownToHtml(source, { linkFor });
	return layout({ file: "spec.html", title: "Announcements", content });
}

function latestResults() {
	const dir = path.join(ROOT, "audit", "results");
	// <date>.md is protocol version 1, <date>-v<n>.md later versions; partial runs are left out
	const key = (f) => {
		const m = f.match(/^(\d{4}-\d{2}-\d{2})(?:-v(\d+))?\.md$/);
		return m ? m[1] + "-" + String(m[2] || 1).padStart(3, "0") : null;
	};
	const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => key(f)).sort((a, b) => key(a).localeCompare(key(b))) : [];
	if (!files.length) {
		return null;
	}
	const name = files[files.length - 1];
	const notesFile = path.join(dir, name.replace(/\.md$/, "-notes.md"));
	return {
		name,
		text: fs.readFileSync(path.join(dir, name), "utf8"),
		notes: fs.existsSync(notesFile) ? fs.readFileSync(notesFile, "utf8") : null
	};
}

function auditPage() {
	const readme = fs.readFileSync(path.join(ROOT, "audit", "README.md"), "utf8");
	const protocol = fs.readFileSync(path.join(ROOT, "audit", "PROTOCOL.md"), "utf8");
	const results = latestResults();
	const intro = markdownToHtml(readme.replace(/^# .*\n/, "").split("## Run")[0], { linkFor });
	let content = `<h1>Gantt accessibility audit</h1>\n${intro}\n<p><a href="#results">Latest results</a> · <a href="#protocol">The protocol</a></p>`;
	if (results) {
		content += `\n<section aria-labelledby="results"><h2 id="results">Latest results (${results.name.replace(".md", "")})</h2>\n`
			+ markdownToHtml(results.text.replace(/^# .*\n/, ""), { shift: 1, linkFor, idPrefix: "r-" }) + "\n</section>";
		if (results.notes) {
			content += `\n<section aria-labelledby="notes"><h2 id="notes">Notes on this run</h2>\n`
				+ markdownToHtml(results.notes.replace(/^# .*\n/, ""), { shift: 1, linkFor, idPrefix: "n-" }) + "\n</section>";
		}
	}
	content += `\n<section aria-labelledby="protocol"><h2 id="protocol">The protocol</h2>\n`
		+ markdownToHtml(protocol.replace(/^# .*\n/, ""), { shift: 1, linkFor, idPrefix: "p-" }) + "\n</section>";
	return layout({ file: "audit.html", title: "Audit", content });
}

function aboutPage() {
	const file = path.join(ROOT, "docs", "site-check.md");
	const check = fs.existsSync(file) ? markdownToHtml(fs.readFileSync(file, "utf8").replace(/^# .*\n/, ""), { shift: 1, linkFor, idPrefix: "c-" })
		: "<p>The automated check has not been run yet.</p>";
	const content = `<h1>About this site</h1>
<p>A static site: plain HTML, CSS and the extension's own JavaScript. It loads nothing from other servers, sets no cookies, and collects nothing. The libraries in the demos are copies in <code>vendor/</code>; the dhtmlx-gantt stylesheet is copied without its web font, which would otherwise be loaded from Google's servers.</p>
<p>It is generated by <code>npm run site</code> in the repository, which also runs the automated check below. The check looks at headings, landmarks, the skip link, visible focus, colour contrast, names of links and buttons, and network requests. It is a set of automated rules, not a review by people who use assistive technology, and it does not check the charts' own markup (that is what the <a href="audit.html">audit</a> is for).</p>
<section aria-labelledby="check">
<h2 id="check">Automated check</h2>
${check}
</section>`;
	return layout({ file: "about.html", title: "About this site", content });
}

// ---- vendor files ----

function copy(from, to, transform) {
	fs.mkdirSync(path.dirname(to), { recursive: true });
	if (transform) {
		fs.writeFileSync(to, transform(fs.readFileSync(from, "utf8")));
	} else {
		fs.copyFileSync(from, to);
	}
}

function copyDir(from, to) {
	for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
		const source = path.join(from, entry.name);
		const target = path.join(to, entry.name);
		if (entry.isDirectory()) {
			copyDir(source, target);
		} else {
			copy(source, target);
		}
	}
}

const NM = path.join(ROOT, "node_modules");
// remove @font-face rules that point at other servers (the Inter web font)
const withoutRemoteFonts = (css) => css.replace(/@font-face\s*{[^}]*url\(https?:[^}]*}/g, "");
fs.rmSync(path.join(OUT, "vendor"), { recursive: true, force: true });
copy(path.join(NM, "dhtmlx-gantt/codebase/dhtmlxgantt.js"), path.join(OUT, "vendor/dhtmlx-gantt/dhtmlxgantt.js"));
copy(path.join(NM, "dhtmlx-gantt/codebase/dhtmlxgantt.css"), path.join(OUT, "vendor/dhtmlx-gantt/dhtmlxgantt.css"), withoutRemoteFonts);
copy(path.join(NM, "dhtmlx-gantt/LICENSE.md"), path.join(OUT, "vendor/dhtmlx-gantt/LICENSE.md"));
copy(path.join(NM, "frappe-gantt/dist/frappe-gantt.es.js"), path.join(OUT, "vendor/frappe-gantt/frappe-gantt.es.js"));
copy(path.join(NM, "frappe-gantt/dist/frappe-gantt.css"), path.join(OUT, "vendor/frappe-gantt/frappe-gantt.css"));
copy(path.join(NM, "frappe-gantt/license.txt"), path.join(OUT, "vendor/frappe-gantt/license.txt"));
copyDir(path.join(ROOT, "src"), path.join(OUT, "vendor/gantt-a11y/src"));
copy(path.join(ROOT, "LICENSE"), path.join(OUT, "vendor/gantt-a11y/LICENSE"));
copy(path.join(HERE, "style.css"), path.join(OUT, "style.css"));

// ---- write the pages ----

const pages = {
	"index.html": (() => { const f = fragment("index.html"); return layout({ file: "index.html", title: f.title, content: f.content }); })(),
	"screen-readers.html": (() => { const f = fragment("screen-readers.html"); return layout({ file: "screen-readers.html", title: f.title, content: f.content }); })(),
	"demo-dhtmlx.html": dhtmlxDemo(),
	"demo-frappe.html": frappeDemo(),
	"spec.html": specPage(),
	"audit.html": auditPage(),
	"about.html": aboutPage()
};
for (const [name, html] of Object.entries(pages)) {
	fs.writeFileSync(path.join(OUT, name), html);
}
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log("site/: " + Object.keys(pages).join(", "));
