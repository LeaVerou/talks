import "./prism.js";
import Inspire from "inspirejs.org";
import { registry } from "@inspirejs/core";
import "./components/file-tree.js";
import "./components/yo-dawg.js";
import "./components/window.js";


registry.markdown = {
	test: "[data-markdown-elements]",
	base: new URL("../", import.meta.resolve("@inspirejs/markdown")),
};

// Text on a path needs SVG, so turn data-around into a textPath around the element.
// Runs after plugins so the markdown renderer doesn't touch the generated markup.
await Inspire.ready;

for (let element of document.querySelectorAll("[data-around]")) {
	element.insertAdjacentHTML("beforeend", `<svg class="around" viewBox="-50 -50 100 100">
		<text><textPath path="M 0 50 A 50 50 0 1 1 0 -50 A 50 50 0 1 1 0 50" startOffset="50%"></textPath></text>
	</svg>`);
	element.querySelector(".around textPath").textContent = element.dataset.around;
}

