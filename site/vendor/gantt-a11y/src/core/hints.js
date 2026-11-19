/**
 * Hints (spec P11, section 5): spoken after the fact, can be turned off,
 * and each distinct hint is spoken at most `maxTimes` per session.
 */
export function createHints({ enabled = true, maxTimes = 3 } = {}) {
	const counts = new Map();

	return {
		/**
		 * @param {string} key  which hint, e.g. "nextPage"
		 * @param {string} text  the filled hint text
		 * @returns {string}  the text, or "" when hints are off or used up
		 */
		take(key, text) {
			if (!enabled || !text) {
				return "";
			}
			const used = counts.get(key) || 0;
			if (used >= maxTimes) {
				return "";
			}
			counts.set(key, used + 1);
			return text;
		}
	};
}
