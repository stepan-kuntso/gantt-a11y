/**
 * A visually hidden aria-live="polite" region, one per gantt instance.
 */

// Standard "visually hidden" technique: invisible on screen, still read by screen readers.
const HIDDEN_STYLE = [
	"position:absolute",
	"width:1px",
	"height:1px",
	"margin:-1px",
	"padding:0",
	"overflow:hidden",
	"clip:rect(0 0 0 0)",
	"white-space:nowrap",
	"border:0"
].join(";");

// Delay between clearing and filling the region, so the same text is announced again.
const ANNOUNCE_DELAY_MS = 100;

/**
 * @param {HTMLElement} container
 * @param {string} [lang]  language of the announcements, so the screen reader picks a matching voice
 * @returns {{announce: (text: string, options?: {delay?: number}) => void, destroy: () => void, element: HTMLElement}}
 */
export function createLiveRegion(container, lang) {
	const doc = container.ownerDocument;
	const element = doc.createElement("div");
	element.setAttribute("aria-live", "polite");
	element.setAttribute("aria-atomic", "true");
	element.setAttribute("data-gantt-a11y-live", "");
	element.setAttribute("style", HIDDEN_STYLE);
	if (lang) {
		element.setAttribute("lang", lang);
	}
	container.appendChild(element);

	let timer = null;
	let alternate = false;

	return {
		element,

		// delay: wait longer before speaking, e.g. until focus has moved
		announce(text, { delay = 0 } = {}) {
			clearTimeout(timer);
			element.textContent = "";
			timer = setTimeout(() => {
				// VoiceOver may skip a repeat of the same text even after clearing,
				// so each announcement is a new child node, and every second one
				// gets a trailing no-break space (not spoken) to make it differ.
				alternate = !alternate;
				const item = doc.createElement("div");
				item.textContent = alternate ? text : text + " ";
				element.appendChild(item);
			}, ANNOUNCE_DELAY_MS + delay);
		},

		destroy() {
			clearTimeout(timer);
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}
	};
}
