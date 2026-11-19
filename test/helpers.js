import { createSpeech } from "../src/core/text/format.js";
import { defaultStrings } from "../src/core/strings.js";

export const linkTypes = { finish_to_start: "0", start_to_start: "1", finish_to_finish: "2", start_to_finish: "3" };

/** Local date in June 2026 (or another month, zero-based). */
export const day = (d, month = 5, year = 2026) => new Date(year, month, d);

/**
 * Speech fixed to 2026 so that years are left out, and speaking the last day
 * of work, as in the spec's examples. The extension's default end date
 * ("gantt") is tested separately in format.test.js and edit.test.js.
 */
export function speech(options = {}) {
	return createSpeech({ strings: defaultStrings, referenceYear: 2026, endDates: "lastDay", ...options });
}
