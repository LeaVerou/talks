export const hasCSS = true;

import Inspire from "../../talk.js";
import { hasCSS } from "../target-width/plugin.js";

Inspire.hooks.add("slidechange", env => {
	// Set slide width as a CSS variable, if smaller than viewport
	if (slide.offsetWidth < innerWidth) {
		slideWidthUpdated(slide);
		// slideResizeObserver.observe(slide);
	}
});

export function slideWidthUpdated (slide) {
	let delta = 30;
	if (slide.offsetWidth + delta < innerWidth) {
		let width = parseFloat(getComputedStyle(slide).width);
		slide.style.setProperty("--width", Math.ceil(width) + delta);
	}
	else {
		slide.style.removeProperty("--width");
	}
}