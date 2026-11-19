/**
 * Small pure helpers shared by all text builders. Plain data, no DOM.
 * Dates, numbers, plurals and lists follow docs/ANNOUNCEMENTS.md, section 2.2 and 2.5.
 */

const NAMED_ENTITIES = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: " "
};

/**
 * Turns a value that may contain HTML into plain text for speech:
 * tags become spaces (images give their alt text), the content of script and
 * style elements and comments is dropped, character references are decoded.
 * A "<" that does not start a tag ("a < b") is kept.
 * @param {*} value
 * @returns {string}
 */
export function toPlainText(value) {
	if (value === null || value === undefined) {
		return "";
	}
	return String(value)
		.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
		.replace(/<!--[\s\S]*?-->/g, " ")
		.replace(/<img\b[^>]*\balt\s*=\s*(["'])(.*?)\1[^>]*>/gi, " $2 ")
		.replace(/<\/?[a-z][^<>]*>/gi, " ")
		.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
			if (code[0] === "#") {
				const number = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
				// outside Unicode or a lone surrogate: not a character, keep the text
				const valid = Number.isFinite(number) && number <= 0x10FFFF && !(number >= 0xD800 && number <= 0xDFFF);
				return valid ? String.fromCodePoint(number) : match;
			}
			const named = NAMED_ENTITIES[code.toLowerCase()];
			return named === undefined ? match : named;
		})
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Fills {placeholders} in a string template. Unknown placeholders stay as they are.
 * @param {string} template
 * @param {Object<string, *>} params
 * @returns {string}
 */
export function fill(template, params) {
	return String(template).replace(/\{(\w+)\}/g, (match, key) =>
		(params && params[key] !== undefined ? String(params[key]) : match));
}

/**
 * Task name for speech; falls back to the "unnamed task" string.
 * @param {*} name  task text, or null when the task does not exist
 * @param {object} strings
 * @returns {string}
 */
export function taskName(name, strings) {
	const text = name === null || name === undefined ? "" : toPlainText(name);
	return text || strings.common.unnamedTask;
}

/**
 * Picks the plural form for a count with Intl.PluralRules (falls back to "other").
 * @param {number} count
 * @param {{one?: string, two?: string, few?: string, many?: string, zero?: string, other: string}} forms
 * @param {string} locale
 * @returns {string}
 */
export function pluralForm(count, forms, locale) {
	let category = "other";
	try {
		category = new Intl.PluralRules(locale).select(count);
	} catch (error) {
		// unknown locale: keep "other"
	}
	return forms[category] !== undefined ? forms[category] : forms.other;
}

/**
 * Speech helpers bound to strings, a locale and the date rules of the spec.
 *
 * @param {object} config
 * @param {object} config.strings
 * @param {string} [config.locale]  defaults to strings.locale
 * @param {number} config.referenceYear  usually the current year
 * @param {boolean} [config.multiYear]  the project spans more than one year
 * @param {"different"|"always"} [config.year="different"]
 * @param {"gantt"|"lastDay"} [config.endDates="gantt"]  which end date to speak, see end()
 * @returns {object}
 */
export function createSpeech({ strings, locale, referenceYear, multiYear = false, year = "different", endDates = "gantt" }) {
	const lang = locale || strings.locale || "en";

	function intl(options) {
		try {
			return new Intl.DateTimeFormat(lang, options);
		} catch (error) {
			return new Intl.DateTimeFormat("en", options);
		}
	}

	function needsYear(date) {
		return year === "always" || multiYear || date.getFullYear() !== referenceYear;
	}

	const speech = {
		locale: lang,

		/** "14 June", "Sunday 14 June", "14 June 2025" (P14, P15). */
		date(date, { weekday = false } = {}) {
			const options = { day: "numeric", month: "long" };
			if (weekday) {
				options.weekday = "long";
			}
			if (needsYear(date)) {
				options.year = "numeric";
			}
			return intl(options).format(date);
		},

		/** "13 to 17 June", "28 June to 3 July" (P18). */
		range(start, end) {
			const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
			if (start.getTime() === end.getTime()) {
				return speech.date(start);
			}
			const from = sameMonth ? intl({ day: "numeric" }).format(start) : speech.date(start);
			return fill(strings.common.range, { from, to: speech.date(end) });
		},

		/**
		 * The last day of work (P16): gantt stores the end as the start of the next
		 * day, so an end at midnight is spoken as the day before. Zero-length tasks
		 * (milestones) keep their date.
		 */
		lastDay(start, end) {
			const midnight = end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0;
			if (midnight && end.getTime() > start.getTime()) {
				return new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
			}
			return end;
		},

		/**
		 * The end date to speak. "gantt" (default): the date gantt stores and shows
		 * in its form, so a screen reader user and a sighted colleague name the same
		 * day. "lastDay": the last day of work (spec P16), an opt-in.
		 */
		end(start, end) {
			return endDates === "lastDay" ? speech.lastDay(start, end) : end;
		},

		/** "1 day", "5 days" with the language's plural rules (P17). */
		count(value, nounKey) {
			const forms = strings.nouns[nounKey];
			if (!forms) {
				return String(value);
			}
			return fill(pluralForm(value, forms, lang), { count: speech.number(value) });
		},

		/** A duration in the chart's unit. */
		duration(value, unit) {
			return strings.nouns[unit] ? speech.count(value, unit) : speech.number(value);
		},

		number(value) {
			try {
				return new Intl.NumberFormat(lang).format(value);
			} catch (error) {
				return String(value);
			}
		},

		/** "A, B, C" (no "and", no symbols). */
		list(items) {
			try {
				return new Intl.ListFormat(lang, { type: "unit", style: "short" }).format(items);
			} catch (error) {
				return items.join(", ");
			}
		},

		/** Picks a whole-sentence template by plural category. */
		plural(count, forms) {
			return pluralForm(count, forms, lang);
		}
	};
	return speech;
}

/**
 * Cuts a name to its first `maxWords` words, for lists (spec D4).
 * @param {string} name  plain text
 * @param {number} maxWords
 * @returns {string}
 */
export function shortName(name, maxWords = 6) {
	const words = name.split(" ");
	return words.length > maxWords ? words.slice(0, maxWords).join(" ") : name;
}
