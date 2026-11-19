import { test } from "node:test";
import assert from "node:assert/strict";

import { fill, pluralForm, shortName, taskName, toPlainText } from "../src/core/text/format.js";
import { defaultStrings, mergeStrings } from "../src/core/strings.js";
import { day, speech } from "./helpers.js";

test("fill replaces known placeholders and keeps unknown ones", () => {
	assert.equal(fill("Created {name}. {missing}", { name: "Testing" }), "Created Testing. {missing}");
});

test("toPlainText strips tags, keeps alt text, decodes all character references", () => {
	assert.equal(toPlainText("<b>A</b>&nbsp;&amp;&lt;B&gt;"), "A &<B>");
	assert.equal(toPlainText("Plan<br>B &#8211; &#x2014; caf&eacute;"), "Plan B – — caf&eacute;");
	assert.equal(toPlainText('<img src="x.png" alt="Rocket"> Launch'), "Rocket Launch");
	assert.equal(toPlainText(null), "");
	assert.equal(toPlainText(42), "42");
});

test("toPlainText keeps character references outside Unicode as they are (B5)", () => {
	assert.equal(toPlainText("Fix &#99999999; bug"), "Fix &#99999999; bug");
	assert.equal(toPlainText("Fix &#x110000; bug"), "Fix &#x110000; bug");
	// a lone surrogate is not a character either
	assert.equal(toPlainText("A &#xD800; B"), "A &#xD800; B");
	assert.equal(toPlainText("&#x1F680; Launch"), "\u{1F680} Launch");
});

test("toPlainText keeps a < or > that is not part of a tag, and drops script and style content", () => {
	assert.equal(toPlainText("a < b and c > d"), "a < b and c > d");
	assert.equal(toPlainText("x<y"), "x<y");
	assert.equal(toPlainText("<b>Bold</b> < 3 days"), "Bold < 3 days");
	assert.equal(toPlainText("Plan<script>alert(1)</script> B<style>p{}</style>"), "Plan B");
});

test("taskName falls back to Unnamed task", () => {
	assert.equal(taskName("Testing", defaultStrings), "Testing");
	assert.equal(taskName(null, defaultStrings), "Unnamed task");
	assert.equal(taskName("<img src=x>", defaultStrings), "Unnamed task");
});

test("shortName cuts lists after six words", () => {
	assert.equal(shortName("Migrate customer accounts from the legacy billing system"), "Migrate customer accounts from the legacy");
	assert.equal(shortName("Testing"), "Testing");
});

test("pluralForm uses Intl.PluralRules categories", () => {
	const days = { one: "{count} день", few: "{count} дні", many: "{count} днів", other: "{count} дня" };
	assert.equal(pluralForm(1, days, "uk"), "{count} день");
	assert.equal(pluralForm(2, days, "uk"), "{count} дні");
	assert.equal(pluralForm(5, days, "uk"), "{count} днів");
	assert.equal(pluralForm(5, { other: "x" }, "uk"), "x");
});

test("speech dates: day and full month, weekday on request, year only when different", () => {
	const s = speech();
	assert.equal(s.date(day(14)), "14 June");
	assert.equal(s.date(day(14), { weekday: true }), "Sunday 14 June");
	assert.equal(s.date(day(14, 5, 2027)), "14 June 2027");
	assert.equal(speech({ multiYear: true }).date(day(14)), "14 June 2026");
	assert.equal(speech({ year: "always" }).date(day(14)), "14 June 2026");
});

test("speech ranges and last day of work", () => {
	const s = speech();
	assert.equal(s.range(day(13), day(17)), "13 to 17 June");
	assert.equal(s.range(day(28), day(3, 6)), "28 June to 3 July");
	assert.equal(s.lastDay(day(13), day(18)).getDate(), 17);
	assert.equal(s.lastDay(day(20), day(20)).getDate(), 20);
	assert.equal(s.lastDay(day(13), new Date(2026, 5, 18, 12)).getHours(), 12);
});

test("speech counts and durations with plurals; unknown units give the number", () => {
	const s = speech();
	assert.equal(s.duration(1, "day"), "1 day");
	assert.equal(s.duration(5, "day"), "5 days");
	assert.equal(s.duration(3, "fortnight"), "3");
	assert.equal(s.count(5000, "task"), "5,000 tasks");
	assert.equal(s.list(["A", "B", "C"]), "A, B, C");
});

test("mergeStrings merges nested groups without losing defaults", () => {
	const strings = mergeStrings({ nouns: { day: { few: "{count} дні" } }, form: { deleted: "X" } });
	assert.equal(strings.nouns.day.one, "{count} day");
	assert.equal(strings.nouns.day.few, "{count} дні");
	assert.equal(strings.form.deleted, "X");
	assert.equal(strings.form.saved, defaultStrings.form.saved);
	assert.equal(defaultStrings.form.deleted, "Deleted {name}.");
});

test("end dates: the date gantt shows by default, the last day of work as an option", () => {
	const gantt = speech({ endDates: "gantt" });
	assert.equal(gantt.date(gantt.end(day(13), day(18))), "18 June");
	const lastDay = speech({ endDates: "lastDay" });
	assert.equal(lastDay.date(lastDay.end(day(13), day(18))), "17 June");
	assert.equal(lastDay.date(lastDay.end(day(20), day(20))), "20 June");
});
