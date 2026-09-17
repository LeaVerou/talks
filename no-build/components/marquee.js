/**
 * Marquees need to know how far each item has to travel, which CSS can neither measure nor turn
 * into a duration. This measures it: --marquee-length is the row's length, and --marquee-end is
 * how far along it each item ends, as a fraction. Without this, marquee.css falls back to
 * assuming every item is the same width.
 * @see marquee.css
 */

// Items resize when the slide does, or when a webfont finally lands, so measure again when they do
const items = new ResizeObserver(entries => {
	for (let marquee of new Set(entries.map(entry => entry.target.parentElement))) {
		measure(marquee);
	}
});

/** @param {Element} marquee */
export function measure (marquee) {
	// Drop the equal widths the fallback assumes: items can now be themselves
	marquee.style.setProperty("--marquee-item-size", "max-content");

	let gap = parseFloat(getComputedStyle(marquee).columnGap) || 0;
	let ends = [];
	let length = 0;

	for (let item of marquee.children) {
		// Translating an item does not change its layout, so this stays correct mid-animation
		length += item.getBoundingClientRect().width;
		ends.push(length);
		// One trailing gap too, so an item that wraps round keeps its distance from the last one
		length += gap;
	}

	for (let [i, item] of [...marquee.children].entries()) {
		item.style.setProperty("--marquee-end", ends[i] / length);
		item.style.setProperty("--marquee-length", length + "px");
	}
}

export function init (root = document) {
	for (let marquee of root.querySelectorAll(".marquee")) {
		measure(marquee);

		for (let item of marquee.children) {
			items.observe(item);
		}
	}
}

init();

// Slides may be built after this module runs (markdown ones are), so pick up marquees that appear later
let pending;
new MutationObserver(() => {
	pending ??= requestAnimationFrame(() => {
		pending = null;
		init();
	});
}).observe(document.documentElement, {childList: true, subtree: true});
