# Gantt accessibility audit

A repeatable check of keyboard behaviour and of what the browser hands to assistive technology, for any page with a Gantt chart. It answers the same 16 questions on every page and writes a table (protocol version 2; version 1 results are kept).

**What it is:** an automated browser (Chromium, through Playwright) pressing keys and reading the accessibility tree.
**What it is not:** a test with a screen reader, a test with people, or a statement about WCAG conformance. A "pass" means the behaviour was observed in the browser, nothing more. [PROTOCOL.md](PROTOCOL.md) lists, for each check, how it is done and what it does not prove.

## Run

```bash
npm run audit                         # all pages in profiles.js (public demos need a network)
npm run audit -- --local              # only the demos in this repository
npm run audit -- demo-frappe-plain    # only the profiles named
npm run audit -- --fixtures           # the audit's own test pages (fixtures/), for checking the tool
```

The demos in this repository are served by a small built-in server (`serve.js`); nothing else needs to run. **Only the four demos of this repository are published.** Profiles for public demos of other libraries exist, but their results go to `private/results/` (not in the repository) and are not published until confirmed by hand; see [PROTOCOL.md](PROTOCOL.md), "Pages of other libraries". Published results go to `results/<date>-v2.json` (everything, with evidence) and `results/<date>-v2.md` (the table, the cells that changed since version 1 and why, and the evidence); a run of only some profiles writes `results/<date>-v2-partial.*` instead. Doubts about a run found when reading its evidence go into `results/<date>-v2-notes.md`.

## Add a page

Add a profile to `profiles.js`: the URL, CSS selectors for the chart, a task row, a bar and a link; documented keyboard commands (dependencies, where am I, help); and for each edit either the documented keyboard path with its sources, or `none` with the reason and the sources read. Keys come only from official documentation. Without any entry, the edit checks answer "could not determine".

Public demos are loaded once per run, like a visitor would: no login, no consent dialogs accepted, nothing bypassed. A page that does not load, asks for a login or has changed so that no task rows are found is reported as not checked, with the reason.

Nothing from this folder is part of the extension's runtime.
