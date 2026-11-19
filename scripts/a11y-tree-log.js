// Builds docs/accessibility-tree-log.md and demo/manual-steps-status.js from
// the results that test-browser/a11y-tree.spec.js writes to
// test-results/a11y-tree/<browser>/<step>.json.
//
//   npx playwright test test-browser/a11y-tree.spec.js && node scripts/a11y-tree-log.js
//   (or: npm run test:a11y-tree)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { steps } from "../demo/manual-steps.js";

const RESULTS = path.join("test-results", "a11y-tree");
const BROWSERS = ["chromium", "webkit"];
const BROWSER_NAMES = { chromium: "Chromium", webkit: "WebKit" };

function load(browser, id) {
	const file = path.join(RESULTS, browser, id + ".json");
	return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
}

const results = {};
for (const item of steps) {
	results[item.id] = {};
	for (const browser of BROWSERS) {
		results[item.id][browser] = load(browser, item.id);
	}
}

const all = Object.values(results).flatMap((byBrowser) => Object.values(byBrowser)).filter(Boolean);
if (!all.length) {
	console.error("No results in " + RESULTS + ". Run: npx playwright test test-browser/a11y-tree.spec.js");
	process.exit(1);
}

const versions = {};
for (const browser of BROWSERS) {
	const one = all.find((r) => r.browser === browser);
	versions[browser] = one ? one.browserVersion : null;
}
const date = all.map((r) => r.date).sort().pop().slice(0, 10);
const quote = (text) => "“" + String(text).replace(/\s+/g, " ").trim().replace(/\|/g, "\\|") + "”";

const CHANNEL = {
	label: "accessible name of the focused element (row label)",
	live: "live region",
	none: "nothing new from the extension",
	library: "the library's own accessible name of the focused element"
};

function received(r) {
	const v = r.received;
	const parts = [];
	if (v.role) {
		let focused = `${v.role}${v.name ? " " + quote(v.name) : ""}`;
		const states = [];
		if (v.level) {
			states.push("level " + v.level);
		}
		if (v.expanded) {
			states.push("expanded " + v.expanded);
		}
		if (v.selected) {
			states.push("selected " + v.selected);
		}
		if (states.length) {
			focused += " (" + states.join(", ") + ")";
		}
		parts.push("Focus: " + focused);
	} else {
		parts.push("Focus: none");
	}
	parts.push("Live region: " + (v.live ? quote(v.live) : "nothing"));
	return parts.join(". ");
}

function order(r) {
	if (!r.log.length) {
		return "no focus change, no live region update";
	}
	return r.log.map((entry) => {
		const what = entry.type === "live" ? "live " + quote(entry.text)
			: `${entry.type === "focus" ? "focus" : "label change"} ${entry.role || ""}${entry.task ? " #" + entry.task : ""}`;
		return `${entry.t} ms ${what}`;
	}).join(" → ");
}

const lines = [];
lines.push("# Accessibility tree log");
lines.push("");
lines.push("> **This is what the browser hands to the screen reader, not what the screen reader speaks.** Whether and in which order VoiceOver (or another screen reader) actually speaks it is checked by hand with [demo/manual-test.html](../demo/manual-test.html) and [TESTING.md](../TESTING.md).");
lines.push("");
lines.push(`Generated ${date} by \`npm run test:a11y-tree\` (test-browser/a11y-tree.spec.js, scripts/a11y-tree-log.js) on ${os.type()} ${os.release()}.`);
lines.push("");
for (const browser of BROWSERS) {
	lines.push(`- ${BROWSER_NAMES[browser]} ${versions[browser] || "(not run)"}`);
}
lines.push("");
lines.push("## How it was measured");
lines.push("");
lines.push("Each step starts from a freshly loaded demo page, brought into the step's state by `prepare()` in [demo/manual-steps.js](../demo/manual-steps.js) (data changes through the chart's API, focus on the starting task). Then Playwright presses the real keys. A recorder in the page logs, with times: focus changes, changes of the focused element's `aria-label`, and new text in the live region.");
lines.push("");
lines.push("- **Chromium**: role, accessible name, level, expanded and selected are read from Chromium's own accessibility tree (DevTools Protocol, `Accessibility.getPartialAXTree`). This is the tree the platform accessibility API is built from.");
lines.push("- **WebKit**: Playwright cannot read WebKit's accessibility tree. Role and accessible name are computed by Playwright from the DOM following the ARIA rules (`ariaSnapshot`); level, expanded and selected come from the ARIA attributes. Differences between this computation and Safari's own tree would not show here.");
lines.push("- For a focused cell (cell navigation mode), level and expanded are taken from its row, where they belong in a tree grid.");
lines.push("- A step **matches** when: focus is on the expected task with the expected role; level, expanded and selected agree with the chart's data; and, by channel, the expected text is the focused element's accessible name and arrived with a focus or label change (row label), or is the last live region text and appeared after the last focus change (live region), or nothing new came from the extension.");
lines.push("- Expected texts are quoted from TESTING.md, except steps marked “recorded”: those were recorded from the extension's output (sections TESTING.md did not cover), so their text cannot disagree with the extension; their role, states and order still can.");
lines.push("");

let matched = 0;
let total = 0;
const mismatches = [];
for (const browser of BROWSERS) {
	for (const item of steps) {
		const r = results[item.id][browser];
		if (r) {
			total++;
			if (r.match) {
				matched++;
			} else {
				mismatches.push(`${item.id} (${BROWSER_NAMES[browser]}): ${r.problems.join("; ")}`);
			}
		}
	}
}
lines.push("## Summary");
lines.push("");
lines.push(`${steps.length} steps, ${total} results in ${BROWSERS.length} browsers: **${matched} matched, ${total - matched} did not.**`);
lines.push("");
if (mismatches.length) {
	for (const text of mismatches) {
		lines.push("- " + text);
	}
	lines.push("");
}
const withNotes = steps.filter((item) => BROWSERS.some((b) => results[item.id][b] && results[item.id][b].notes.length));
lines.push("Not checkable here (left for the manual check):");
lines.push("");
for (const item of steps.filter((s) => s.cannotCheck)) {
	lines.push(`- ${item.id}: ${item.cannotCheck}.`);
}
for (const item of withNotes) {
	const notes = BROWSERS.flatMap((b) => (results[item.id][b] ? results[item.id][b].notes.map((n) => `${BROWSER_NAMES[b]}: ${n}`) : []));
	lines.push(`- ${item.id}: the test stepped in. ${notes.join(" ")}`);
}
lines.push("");

let section = null;
for (const item of steps) {
	if (item.section !== section) {
		section = item.section;
		lines.push(`## ${section}`);
		lines.push("");
	}
	lines.push(`### ${item.id}`);
	lines.push("");
	lines.push(`- **Action:** ${item.do} (page \`${item.page}${Object.keys(item.params).length ? "?" + new URLSearchParams(item.params) : ""}\`).`);
	const expected = item.expect.channel === "none" ? item.expect.text : quote(item.expect.text);
	lines.push(`- **Expected** (${item.source}), in the ${CHANNEL[item.expect.channel]}: ${expected}.`);
	for (const browser of BROWSERS) {
		const r = results[item.id][browser];
		if (!r) {
			lines.push(`- **${BROWSER_NAMES[browser]}:** not run.`);
			continue;
		}
		lines.push(`- **${BROWSER_NAMES[browser]}: ${r.match ? "matched" : "did not match"}.** ${received(r)}.`);
		lines.push(`  Order: ${order(r)}.`);
		if (!r.match) {
			lines.push(`  Differences: ${r.problems.join("; ")}.`);
		}
		for (const note of r.notes) {
			lines.push(`  Note: ${note}`);
		}
	}
	if (item.cannotCheck) {
		lines.push(`- **Not checkable here:** ${item.cannotCheck}.`);
	}
	lines.push("");
}

fs.writeFileSync(path.join("docs", "accessibility-tree-log.md"), lines.join("\n"));

// status for the manual test helper: which steps to check first
const status = {};
for (const item of steps) {
	const per = {};
	for (const browser of BROWSERS) {
		const r = results[item.id][browser];
		per[browser] = r ? { match: r.match, problems: r.problems, notes: r.notes } : null;
	}
	status[item.id] = per;
}
const module = [
	"// Generated by scripts/a11y-tree-log.js from the accessibility tree tests. Do not edit.",
	`export const treeStatus = ${JSON.stringify({ date, versions, steps: status }, null, "\t")};`,
	""
].join("\n");
fs.writeFileSync(path.join("demo", "manual-steps-status.js"), module);

console.log(`docs/accessibility-tree-log.md: ${matched} of ${total} matched`);
