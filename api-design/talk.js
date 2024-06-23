/**
 * JS file included in *all* lab slides
 */

import "../shared/js/bliss.shy.min.js";
import "../shared/js/prism.js";
import Inspire from "https://inspirejs.org/inspire.mjs";
// import { SELECTOR as TARGET_WIDTH_SELECTOR } from "./plugins/target-width/plugin.js";

let path = new URL("./plugins", import.meta.url);
Inspire.plugins.register({
	// "syntax-breakdown": {
	// 	test: ".syntax-breakdown",
	// 	path
	// },
	// "target-width": {
	// 	test: TARGET_WIDTH_SELECTOR,
	// 	path
	// },
	// "browser": {
	// 	test: ".browser",
	// 	path
	// },
	// "tree": {
	// 	test: ".tree",
	// 	path
	// },
});

for (let pre of document.querySelectorAll("pre:is(.count-lines, .count-lines *)")) {
	let code = pre.textContent.trim();
	let lines = code.split(/\n/).length;
	pre.style.setProperty("--loc", lines);
}

export default Inspire;