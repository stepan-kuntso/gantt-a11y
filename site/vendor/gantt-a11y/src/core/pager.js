/**
 * Paging for long answers (spec D2): the same command pressed again on the
 * same task within `windowMs` speaks the next page; after the last page it
 * starts over. Pure apart from the clock passed in.
 */
export const PAGE_WINDOW_MS = 5000;

export function createPager(windowMs = PAGE_WINDOW_MS) {
	let state = null;

	return {
		/**
		 * @param {string} command
		 * @param {string|number} taskId
		 * @param {() => Array<{text: string, nextCount: number}>} build  pages, built only when needed
		 * @param {number} now  ms
		 * @returns {{text: string, nextCount: number}}
		 */
		next(command, taskId, build, now) {
			const continuing = state && state.command === command && String(state.taskId) === String(taskId)
				&& now - state.at <= windowMs && state.index + 1 < state.pages.length;
			if (continuing) {
				state.index += 1;
				state.at = now;
			} else {
				state = { command, taskId, pages: build(), index: 0, at: now };
			}
			return state.pages[state.index];
		}
	};
}
