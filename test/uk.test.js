import { test } from "node:test";
import assert from "node:assert/strict";

import { uk } from "../src/locales/uk.js";
import { defaultStrings, mergeStrings } from "../src/core/strings.js";
import { createSpeech } from "../src/core/text/format.js";
import { day } from "./helpers.js";

const PLURAL_CATEGORIES = ["zero", "one", "two", "few", "many", "other"];
const isPlural = (value) => value && typeof value === "object" && "other" in value
	&& Object.keys(value).every((key) => PLURAL_CATEGORIES.includes(key));
const placeholders = (text) => [...new Set(String(text).match(/\{\w+\}/g) || [])].sort();

/** [path, english, ukrainian] for every leaf of the English strings. */
function pairs(en, tr, path = []) {
	const result = [];
	for (const key of Object.keys(en)) {
		const here = path.concat(key);
		if (isPlural(en[key])) {
			result.push([here.join("."), en[key], tr[key]]);
		} else if (en[key] && typeof en[key] === "object") {
			assert.ok(tr[key] && typeof tr[key] === "object", `${here.join(".")} is missing`);
			result.push(...pairs(en[key], tr[key], here));
		} else {
			result.push([here.join("."), en[key], tr[key]]);
		}
	}
	return result;
}

test("uk translates every string and keeps every placeholder", () => {
	for (const [path, en, tr] of pairs(defaultStrings, uk)) {
		assert.notEqual(tr, undefined, `${path} is missing`);
		if (isPlural(en)) {
			assert.ok(isPlural(tr), `${path} must keep plural forms`);
			const expected = placeholders(Object.values(en).join(" "));
			for (const category of Object.keys(tr)) {
				assert.deepEqual(placeholders(tr[category]), expected, `${path}.${category}`);
			}
		} else {
			assert.deepEqual(placeholders(tr), placeholders(en), path);
		}
	}
});

test("uk has no keys that the English strings do not have", () => {
	function extra(en, tr, path = []) {
		for (const key of Object.keys(tr)) {
			const here = path.concat(key).join(".");
			assert.ok(key in en || (isPlural(tr) && PLURAL_CATEGORIES.includes(key)), `${here} is not used`);
			if (key in en && en[key] && typeof en[key] === "object" && !isPlural(en[key])) {
				extra(en[key], tr[key], path.concat(key));
			}
		}
	}
	extra(defaultStrings, uk);
});

test("uk plural forms: one, few, many and other", () => {
	const strings = mergeStrings(uk);
	const s = createSpeech({ strings, referenceYear: 2026 });
	const days = [1, 2, 4, 5, 11, 12, 14, 21, 22, 25, 101, 111, 0, 1.5].map((n) => s.count(n, "day"));
	assert.deepEqual(days, [
		"1 день", "2 дні", "4 дні", "5 днів", "11 днів", "12 днів", "14 днів",
		"21 день", "22 дні", "25 днів", "101 день", "111 днів", "0 днів", "1,5 дня"
	]);
	assert.equal(s.count(1, "hour"), "1 година");
	assert.equal(s.count(3, "task"), "3 задачі");
	assert.equal(s.count(5, "change"), "5 змін");
	assert.equal(s.count(21, "link"), "21 зв'язок");
	assert.equal(s.plural(1, strings.time.before), uk.time.before.one);
	assert.equal(s.plural(3, strings.time.before), uk.time.before.few);
	assert.equal(s.plural(7, strings.time.before), uk.time.before.many);
});

test("uk dates and ranges come from Intl in Ukrainian", () => {
	const s = createSpeech({ strings: mergeStrings(uk), referenceYear: 2026, endDates: "lastDay" });
	assert.equal(s.date(day(13)), "13 червня");
	assert.equal(s.range(day(13), day(17)), "з 13 по 17 червня");
	// Intl.ListFormat "unit"/"short" adds "і" in Ukrainian (in English it adds nothing)
	assert.equal(s.list(["Тестування", "Документація", "Рецензування"]), "Тестування, Документація і Рецензування");
});
