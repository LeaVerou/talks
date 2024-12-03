import "./js/prism-tokenizedcss.js";
import "./js/prism-cssgrammar.js";
import Inspire from "https://inspirejs.org/inspire.mjs";

let { $$ } = Inspire.util;

let path = new URL(".", import.meta.url);
Inspire.plugins.register({
	"tree": {
		test: ".tree, .tree-children",
		path
	},
});


/* Fix bug
Prism.languages.scss.selector.pattern = /(?=\S)[^@;{}()]?(?:[^@;{}()\s]|\s+(?!\s)|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}][^:{}]*[:{][^}]))/;  */
Prism.languages.scss.selector.pattern = /(?=\S)[^@;{}()]?(?:[^@;{}\s]|\s+(?!\s)|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}][^:{}]*[:{][^}]))/;

Prism.languages.css.selector.inside ??= {};
Prism.languages.css.selector.inside.parent = {
	pattern: /&/,
	alias: 'important'
};

$$(".takeaway.slide").forEach((slide, i) => slide.style.setProperty("--takeaway", i+1));

let urlStyles = `font: 1em system-ui, sans-serif;`;
for (let element of document.querySelectorAll(".browser")) {
	let url = element.dataset.url ?? element.dataset.src ?? element.href ?? element.src;

	element.style.setProperty("--url-image", `url('data:image/svg+xml,
		<svg xmlns="http://www.w3.org/2000/svg">
			<text style="${ urlStyles }" x=".1em" y="1.5em" >${ encodeURIComponent(url) }</text>
		</svg>')`.replace(/\r?\n|\t/g, ""));
}