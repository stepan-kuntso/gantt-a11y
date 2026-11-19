// Automated accessibility check of the pages in site/ (npm run site).
// Writes docs/site-check.md. Rules, not a review by people: see the report.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { serve } from "../../audit/serve.js";

const PAGES = ["index.html", "demo-dhtmlx.html", "demo-frappe.html", "screen-readers.html", "spec.html", "audit.html", "about.html"];
// the charts' own markup belongs to the libraries; the audit looks at it
const CHART = ".chart-box, .frappe-layout, .gantt_cal_light, .gantt_modal_box";

function luminance([r, g, b]) {
	const c = [r, g, b].map((v) => {
		const s = v / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => {
	const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (l1 + 0.05) / (l2 + 0.05);
};

async function checkPage(page, url, name) {
	const external = [];
	const errors = [];
	const onRequest = (r) => {
		if (!r.url().startsWith(url.split("/site/")[0]) && !r.url().startsWith("data:")) {
			external.push(r.url());
		}
	};
	page.on("request", onRequest);
	page.on("pageerror", (e) => errors.push(e.message));
	page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
	await page.goto(url, { waitUntil: "load" });
	await page.waitForTimeout(800);

	const results = [];
	const add = (rule, pass, detail) => results.push({ rule, pass, detail });

	const structure = await page.evaluate((chart) => {
		const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => !h.closest(chart)).map((h) => Number(h.tagName[1]));
		const skips = [];
		for (let i = 1; i < headings.length; i++) {
			if (headings[i] > headings[i - 1] + 1) {
				skips.push(`h${headings[i - 1]} → h${headings[i]}`);
			}
		}
		const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
		const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
		const unnamed = [...document.querySelectorAll("a[href], button")].filter((el) => !el.closest(chart))
			.filter((el) => !(el.getAttribute("aria-label") || el.textContent.trim() || (el.querySelector("img[alt]") && el.querySelector("img[alt]").alt)))
			.map((el) => el.outerHTML.slice(0, 60));
		const images = [...document.querySelectorAll("img")].filter((img) => !img.closest(chart) && !img.hasAttribute("alt")).length;
		return {
			lang: document.documentElement.lang,
			h1: headings.filter((h) => h === 1).length,
			skips,
			banner: document.querySelectorAll("body > header").length,
			nav: document.querySelectorAll("nav[aria-label]").length,
			main: document.querySelectorAll("main").length,
			contentinfo: document.querySelectorAll("body > footer").length,
			duplicates,
			unnamed,
			images,
			title: document.title
		};
	}, CHART);
	add("Language of the page", !!structure.lang, `lang="${structure.lang}"`);
	add("Title", !!structure.title, structure.title);
	add("One h1", structure.h1 === 1, `${structure.h1} h1`);
	add("Heading levels do not skip", !structure.skips.length, structure.skips.join(", ") || "in order");
	add("Landmarks: banner, navigation, main, contentinfo", structure.banner === 1 && structure.nav >= 1 && structure.main === 1 && structure.contentinfo === 1,
		`header ${structure.banner}, nav ${structure.nav}, main ${structure.main}, footer ${structure.contentinfo}`);
	add("Unique ids", !structure.duplicates.length, structure.duplicates.join(", ") || "none repeated");
	add("Links and buttons have names", !structure.unnamed.length, structure.unnamed.join("; ") || "all named");
	add("Images have alt", !structure.images, `${structure.images} without alt`);

	// skip link: the first Tab stop, visible when focused, and it moves focus to main
	await page.keyboard.press("Tab");
	const skip = await page.evaluate(() => {
		const a = document.activeElement;
		const r = a.getBoundingClientRect();
		return { text: a.textContent.trim(), href: a.getAttribute("href"), visible: r.top >= 0 && r.height > 0 };
	});
	await page.keyboard.press("Enter");
	await page.waitForTimeout(100);
	const landed = await page.evaluate(() => document.activeElement && document.activeElement.id);
	add("Skip link first, visible on focus, moves focus to the content", skip.href === "#main" && skip.visible && landed === "main",
		`first Tab stop: “${skip.text}” (${skip.href}), ${skip.visible ? "visible" : "not visible"}; after Enter focus is on #${landed}`);

	// visible focus: every Tab stop outside the charts has an outline or a box shadow
	// start again from the top of the page: focus a temporary element before everything else
	await page.evaluate(() => {
		const start = document.createElement("span");
		start.tabIndex = -1;
		document.body.prepend(start);
		start.focus();
		start.remove();
	});
	const noFocusStyle = [];
	let stops = 0;
	for (let i = 0; i < 120; i++) {
		await page.keyboard.press("Tab");
		const info = await page.evaluate((chart) => {
			const a = document.activeElement;
			if (!a || a === document.body) {
				return { end: true };
			}
			if (a.closest(chart)) {
				return { skip: true, key: a.tagName + (a.id || a.className) };
			}
			const s = getComputedStyle(a);
			const outline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
			return { key: a.tagName + "#" + a.id + a.textContent.trim().slice(0, 20), ok: outline || (s.boxShadow && s.boxShadow !== "none"), desc: a.outerHTML.slice(0, 60) };
		}, CHART);
		if (info.end) {
			break;
		}
		if (info.skip) {
			continue;
		}
		stops++;
		if (!info.ok) {
			noFocusStyle.push(info.desc);
		}
	}
	add("Visible focus on every Tab stop (outside the charts)", !noFocusStyle.length, noFocusStyle.length ? noFocusStyle.join("; ") : `${stops} Tab stops checked`);

	// contrast of text outside the charts
	const samples = await page.evaluate((chart) => {
		const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
		const background = (el) => {
			for (let n = el; n; n = n.parentElement) {
				const c = parse(getComputedStyle(n).backgroundColor);
				if (c.length === 3 || (c.length === 4 && c[3] > 0.95)) {
					return c.slice(0, 3);
				}
			}
			return [255, 255, 255];
		};
		const out = [];
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		const seen = new Set();
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const el = node.parentElement;
			if (!node.textContent.trim() || !el || seen.has(el) || el.closest(chart) || el.closest("script, style")) {
				continue;
			}
			seen.add(el);
			const s = getComputedStyle(el);
			const r = el.getBoundingClientRect();
			if (s.visibility === "hidden" || s.display === "none" || r.width <= 1 || r.height <= 1 || el.closest(".skip")) {
				continue;
			}
			const size = parseFloat(s.fontSize);
			const bold = Number(s.fontWeight) >= 700;
			out.push({ text: node.textContent.trim().slice(0, 30), fg: parse(s.color).slice(0, 3), bg: background(el), large: size >= 24 || (bold && size >= 18.66) });
		}
		return out;
	}, CHART);
	const low = samples.map((s) => ({ ...s, r: ratio(s.fg, s.bg) })).filter((s) => s.r < (s.large ? 3 : 4.5));
	const min = samples.length ? Math.min(...samples.map((s) => ratio(s.fg, s.bg))) : null;
	add("Text contrast (4.5:1, large text 3:1, outside the charts)", !low.length,
		low.length ? low.slice(0, 5).map((s) => `“${s.text}” ${s.r.toFixed(2)}:1`).join("; ") : `${samples.length} text elements, lowest ${min ? min.toFixed(2) : "-"}:1`);

	add("No requests to other servers", !external.length, external.length ? external.slice(0, 3).join(", ") : "none");
	add("No script errors", !errors.length, errors.slice(0, 3).join("; ") || "none");
	page.off("request", onRequest);
	return { name, results };
}

const server = await serve(process.cwd());
const browser = await chromium.launch();
const report = [];
try {
	for (const name of PAGES) {
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		report.push(await checkPage(page, `${server.url}/site/${name}`, name));
		await page.close();
	}
} finally {
	await browser.close();
	await server.close();
}

const date = new Date().toISOString().slice(0, 10);
const rules = report[0].results.map((r) => r.rule);
const lines = [
	"# Automated check of the site",
	"",
	`Run ${date} in Chromium ${"(Playwright)"} by \`scripts/site/check.js\`. Automated rules only: they find missing structure and low contrast, not whether the pages are easy to use with a screen reader. The charts' own markup is left out here; the [audit](../audit/README.md) checks it.`,
	"",
	"| Rule | " + report.map((p) => p.name).join(" | ") + " |",
	"|---|" + report.map(() => "---").join("|") + "|"
];
for (const rule of rules) {
	lines.push(`| ${rule} | ` + report.map((p) => (p.results.find((r) => r.rule === rule).pass ? "pass" : "**fail**")).join(" | ") + " |");
}
lines.push("", "## Details", "");
for (const p of report) {
	lines.push(`### ${p.name}`, "");
	for (const r of p.results) {
		lines.push(`- ${r.pass ? "pass" : "**fail**"}: ${r.rule}: ${String(r.detail).replace(/\|/g, "\\|")}`);
	}
	lines.push("");
}
fs.writeFileSync(path.join("docs", "site-check.md"), lines.join("\n"));
const failed = report.flatMap((p) => p.results.filter((r) => !r.pass).map((r) => `${p.name}: ${r.rule}: ${r.detail}`));
console.log(failed.length ? "fails:\n" + failed.join("\n") : "all rules pass");
