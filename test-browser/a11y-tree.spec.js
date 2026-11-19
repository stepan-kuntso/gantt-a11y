// What the browser hands to a screen reader at each step of TESTING.md
// (demo/manual-steps.js): role and accessible name of the focused element,
// aria-level / aria-expanded / aria-selected, the live region, and the order
// of focus changes and live region updates.
//
// Chromium: role, name and states are read from the browser's own
// accessibility tree (Chrome DevTools Protocol, Accessibility domain).
// WebKit: Playwright has no access to WebKit's accessibility tree; role and
// name are computed by Playwright from the DOM (ariaSnapshot), states are
// read from the ARIA attributes.
//
// This is what the screen reader receives, not what it speaks. Each step
// writes a JSON result to test-results/a11y-tree/<browser>/; run
// `node scripts/a11y-tree-log.js` afterwards (npm run test:a11y-tree does both)
// to build docs/accessibility-tree-log.md.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { steps, stepUrl } from "../demo/manual-steps.js";

const RESULTS = path.join("test-results", "a11y-tree");
const normalize = (text) => String(text == null ? "" : text).replace(/\s+/g, " ").trim();

/** Records focus changes, label changes of the focused element and live region updates, with times. */
function installRecorder() {
	const log = [];
	const start = performance.now();
	const describe = (el) => {
		if (!el || el === document.body) {
			return { role: null, label: null, task: null };
		}
		const holder = el.closest && el.closest("[data-task-id]");
		return {
			role: el.getAttribute("role") || el.tagName.toLowerCase(),
			label: el.getAttribute("aria-label") || (el.textContent || "").trim().slice(0, 120),
			task: holder ? holder.getAttribute("data-task-id") : null
		};
	};
	const add = (entry) => log.push({ t: Math.round(performance.now() - start), ...entry });
	document.addEventListener("focusin", (event) => add({ type: "focus", ...describe(event.target) }), true);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === "attributes" && mutation.target === document.activeElement) {
				add({ type: "label", ...describe(mutation.target) });
			}
			if (mutation.type === "childList") {
				for (const node of mutation.addedNodes) {
					const region = node.parentElement && node.parentElement.closest("[data-gantt-a11y-live]");
					if (region && node.nodeType === 1) {
						add({ type: "live", text: node.textContent.trim() });
					}
				}
			}
		}
	}).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-label"] });
	window.__a11yLog = log;
}

async function prepareStep(page, id) {
	await page.evaluate(async (id) => {
		const module = await import("/demo/manual-steps.js");
		await module.prepare(window, module.steps.find((item) => item.id === id));
	}, id);
}

async function focusTask(page, item, target) {
	await page.evaluate(async ({ id, target }) => {
		const module = await import("/demo/manual-steps.js");
		await module.focusTarget(window, module.steps.find((s) => s.id === id), target);
	}, { id: item.id, target });
}

const lightbox = (page) => page.locator(".gantt_cal_light");

/** The library does not always move focus into the form (see form.spec.js); then the test does. */
async function intoForm(page, notes) {
	await expect(lightbox(page)).toBeVisible();
	const field = lightbox(page).locator("textarea");
	try {
		await expect(field).toBeFocused({ timeout: 1500 });
	} catch (error) {
		notes.push("The library opened the form without moving focus into it; the test focused its first field.");
		await field.focus();
	}
}

async function run(page, item, action, notes) {
	if (typeof action === "string") {
		await page.keyboard.press(action);
		await page.waitForTimeout(60);
		return;
	}
	if (action.wait) {
		await page.waitForTimeout(action.wait);
	} else if (action.press) {
		for (let i = 0; i < action.times; i++) {
			await page.keyboard.press(action.press);
			await page.waitForTimeout(action.gap);
		}
	} else if (action.focusTask !== undefined) {
		await focusTask(page, item, action.focusTask);
	} else if (action.confirm !== undefined) {
		await page.locator(action.confirm ? ".gantt_modal_box .gantt_ok_button" : ".gantt_modal_box .gantt_cancel_button").click();
	} else if (action.form === "open" || action.form === "create") {
		await page.keyboard.press(action.form === "open" ? "Enter" : "Control+Enter");
		await intoForm(page, notes);
	} else if (action.form === "inc" || action.form === "dec") {
		await lightbox(page).locator(action.form === "inc" ? ".gantt_duration_inc" : ".gantt_duration_dec").focus();
		await page.keyboard.press("Space");
	} else if (action.form === "save" || action.form === "delete") {
		await lightbox(page).getByRole("button", { name: action.form === "save" ? "Save" : "Delete" }).focus();
		await page.keyboard.press("Enter");
	} else if (action.form === "text") {
		await lightbox(page).locator("textarea").fill(action.value);
	} else if (action.form === "day") {
		await lightbox(page).locator("select").first().selectOption(action.value);
	} else {
		throw new Error("unknown action " + JSON.stringify(action));
	}
}

/** Role, name and states of the focused element as the browser exposes them. */
async function focusedNode(page, browserName) {
	const dom = await page.evaluate(() => {
		const el = document.activeElement;
		if (!el || el === document.body) {
			return null;
		}
		const row = el.closest('[role="row"]') || el;
		return {
			role: el.getAttribute("role"),
			label: el.getAttribute("aria-label"),
			task: (el.closest("[data-task-id]") || el).getAttribute("data-task-id"),
			level: row.getAttribute("aria-level"),
			expanded: row.getAttribute("aria-expanded"),
			selected: el.getAttribute("aria-selected") || row.getAttribute("aria-selected")
		};
	});
	if (!dom) {
		return { dom: null, tree: null };
	}
	if (browserName === "chromium") {
		const cdp = await page.context().newCDPSession(page);
		await cdp.send("Accessibility.enable");
		const { result } = await cdp.send("Runtime.evaluate", { expression: "document.activeElement" });
		const { node } = await cdp.send("DOM.describeNode", { objectId: result.objectId });
		const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { backendNodeId: node.backendNodeId, fetchRelatives: false });
		const ax = nodes[0];
		// in a treegrid, level and expanded belong to the row that holds a focused cell
		let rowAx = ax;
		if (ax.role && ax.role.value === "gridcell") {
			const row = await cdp.send("Runtime.evaluate", { expression: "document.activeElement.closest('[role=\"row\"]')" });
			if (row.result.objectId) {
				const rowNode = await cdp.send("DOM.describeNode", { objectId: row.result.objectId });
				rowAx = (await cdp.send("Accessibility.getPartialAXTree", { backendNodeId: rowNode.node.backendNodeId, fetchRelatives: false })).nodes[0];
			}
		}
		const prop = (from, name) => {
			const found = (from.properties || []).find((p) => p.name === name);
			return found ? String(found.value.value) : null;
		};
		await cdp.detach();
		return {
			dom,
			tree: { source: "Chromium accessibility tree", role: ax.role && ax.role.value, name: ax.name && ax.name.value, level: prop(rowAx, "level"), expanded: prop(rowAx, "expanded"), selected: prop(rowAx, "selected"), focused: prop(ax, "focused") }
		};
	}
	// a line is YAML: "- row "name" [level=2]:", or the same in single quotes when the name has ": "
	const firstLine = (snapshot) => {
		const line = snapshot.split("\n")[0].replace(/:$/, "");
		const quoted = line.match(/^- '(.*)'$/);
		return quoted ? "- " + quoted[1].replace(/''/g, "'") : line;
	};
	const snapshot = await page.locator(":focus").ariaSnapshot();
	const first = firstLine(snapshot);
	// in a treegrid, level and expanded belong to the row that holds a focused cell
	const rowLine = dom.role === "gridcell"
		? firstLine(await page.locator(":focus").locator("xpath=ancestor::*[@role='row'][1]").ariaSnapshot())
		: first;
	const match = first.match(/^- (\w+)(?: "((?:[^"\\]|\\.)*)")?/);
	const flag = (name) => {
		const m = rowLine.match(new RegExp("\\[" + name + "(?:=([^\\]]+))?\\]"));
		return m ? (m[1] === undefined ? "true" : m[1]) : null;
	};
	return {
		dom,
		tree: {
			source: "Playwright ARIA computation (WebKit exposes no accessibility tree to automation)",
			role: match ? match[1] : null,
			name: match && match[2] !== undefined ? match[2].replace(/\\"/g, "\"") : null,
			level: flag("level"),
			expanded: flag("expanded"),
			selected: flag("selected"),
			focused: null
		}
	};
}

/** What the data says the focused row should expose. */
async function expectedStates(page, item, taskId) {
	if (taskId === null || taskId === undefined) {
		return null;
	}
	return page.evaluate(({ frappe, id }) => {
		if (frappe) {
			return { level: null, expanded: null, selected: "true" };
		}
		if (!window.gantt.isTaskExists(id)) {
			return null;
		}
		const task = window.gantt.getTask(id);
		return {
			level: String(window.gantt.calculateTaskLevel(task) + 1),
			expanded: window.gantt.hasChild(id) ? String(!!task.$open) : null,
			selected: String(!!window.gantt.isSelectedTask(id))
		};
	}, { frappe: item.page.includes("frappe"), id: taskId });
}

function judge(item, log, node, states, extra) {
	const e = item.expect;
	const problems = [];
	const focusEvents = log.filter((entry) => entry.type === "focus" || entry.type === "label");
	const lastFocus = focusEvents[focusEvents.length - 1];
	const lives = log.filter((entry) => entry.type === "live");
	const lastLive = lives[lives.length - 1];
	const name = node.tree ? node.tree.name : null;
	const expectedRole = e.role || (item.page.includes("frappe") ? "option" : "row");

	if (e.task !== undefined && (!node.dom || String(node.dom.task) !== String(e.task))) {
		problems.push(`focus is on task ${node.dom ? node.dom.task : "none"}, expected ${e.task}`);
	}
	if ((e.channel === "label" || e.channel === "library" || e.channel === "live") && !e.formOpen && node.tree && e.task !== undefined && node.tree.role !== expectedRole) {
		problems.push(`role of the focused element is ${node.tree.role}, expected ${expectedRole}`);
	}
	if (states && node.tree && e.task !== undefined) {
		for (const key of ["level", "expanded", "selected"]) {
			const want = states[key];
			const got = node.tree[key] === null && want === "false" && key !== "expanded" ? "false" : node.tree[key];
			if (want !== null && got !== want) {
				problems.push(`aria-${key} exposed as ${node.tree[key]}, expected ${want}`);
			}
		}
	}

	let order = log.map((entry) => entry.type === "live" ? `live "${entry.text}"` : `${entry.type} ${entry.role || ""}${entry.task ? " #" + entry.task : ""}`).join(" -> ");
	if (e.channel === "label") {
		if (normalize(name) !== normalize(e.text)) {
			problems.push(`accessible name of the focused element is "${normalize(name)}"`);
		}
		const carrier = focusEvents.find((entry) => normalize(entry.label) === normalize(e.text));
		if (!carrier) {
			problems.push("no focus change or label change carried the expected text");
		} else if (lastFocus && carrier !== lastFocus && normalize(lastFocus.label) !== normalize(e.text)) {
			problems.push("focus or label changed again after the expected text");
		}
		if (lives.some((entry) => normalize(entry.text) === normalize(e.text))) {
			problems.push("the text also went to the live region");
		}
	} else if (e.channel === "live") {
		if (!lastLive || normalize(lastLive.text) !== normalize(e.text)) {
			problems.push(`last live region text is "${lastLive ? normalize(lastLive.text) : ""}"`);
		} else if (lastFocus && lastFocus.t > lastLive.t) {
			problems.push(`focus changed ${lastFocus.t - lastLive.t} ms after the live region text appeared`);
		}
	} else if (e.channel === "library") {
		if (normalize(name) !== normalize(e.text)) {
			problems.push(`accessible name of the focused element is "${normalize(name)}"`);
		}
	} else if (e.channel === "none") {
		if (lives.length) {
			problems.push(`live region spoke: "${normalize(lastLive.text)}"`);
		}
		if (e.formOpen && !extra.formOpen) {
			problems.push("the form closed");
		}
		if (e.unchanged !== undefined && extra.moved) {
			problems.push("the task moved");
		}
	}
	return { match: problems.length === 0, problems, order };
}

for (const item of steps) {
	test(`${item.id} ${item.section}: ${item.do}`, async ({ page, browserName, browser }) => {
		const notes = [];
		await page.goto("/" + stepUrl(item));
		await prepareStep(page, item.id);
		const before = await page.evaluate((id) => window.gantt && window.gantt.isTaskExists && window.gantt.isTaskExists(id) ? +window.gantt.getTask(id).start_date : null, item.expect.unchanged);
		await page.evaluate(installRecorder);

		for (const action of item.actions) {
			await run(page, item, action, notes);
		}

		// wait for the expected outcome (up to 3 s), then a little longer for late updates
		const e = item.expect;
		await expect.poll(async () => page.evaluate(({ e }) => {
			const norm = (t) => String(t || "").replace(/\s+/g, " ").trim();
			const log = window.__a11yLog;
			if (e.channel === "live") {
				const lives = log.filter((x) => x.type === "live");
				return lives.length > 0 && norm(lives[lives.length - 1].text) === norm(e.text);
			}
			if (e.channel === "label" || e.channel === "library") {
				return !!document.activeElement && norm(document.activeElement.getAttribute("aria-label")) === norm(e.text);
			}
			return true;
		}, { e }), { timeout: 3000 }).toBe(true).catch(() => {});
		await page.waitForTimeout(e.channel === "none" ? 1500 : 700);

		const log = await page.evaluate(() => window.__a11yLog);
		const node = await focusedNode(page, browserName);
		const states = await expectedStates(page, item, e.task);
		const extra = await page.evaluate(({ unchanged, before }) => ({
			formOpen: !!document.querySelector(".gantt_cal_light") && document.querySelector(".gantt_cal_light").offsetParent !== null,
			moved: unchanged !== undefined && unchanged !== null && window.gantt.isTaskExists(unchanged) && +window.gantt.getTask(unchanged).start_date !== before
		}), { unchanged: e.unchanged, before });
		const verdict = judge(item, log, node, states, extra);

		const lives = log.filter((entry) => entry.type === "live");
		const result = {
			id: item.id,
			section: item.section,
			do: item.do,
			page: stepUrl(item),
			source: item.source,
			priority: item.priority,
			browser: browserName,
			browserVersion: browser.version(),
			date: new Date().toISOString(),
			expected: e,
			received: {
				role: node.tree ? node.tree.role : null,
				name: node.tree ? node.tree.name : null,
				level: node.tree ? node.tree.level : null,
				expanded: node.tree ? node.tree.expanded : null,
				selected: node.tree ? node.tree.selected : null,
				task: node.dom ? node.dom.task : null,
				live: lives.length ? lives[lives.length - 1].text : null,
				treeSource: node.tree ? node.tree.source : null
			},
			expectedStates: states,
			log,
			order: verdict.order,
			match: verdict.match,
			problems: verdict.problems,
			notes
		};
		const dir = path.join(RESULTS, browserName);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, item.id + ".json"), JSON.stringify(result, null, "\t"));

		for (const text of notes) {
			test.info().annotations.push({ type: "library", description: text });
		}
		expect(verdict.problems, "what the browser exposed differs from the expectation").toEqual([]);
	});
}
