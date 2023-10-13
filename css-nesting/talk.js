import "./js/prism-tokenizedcss.js";
import "./js/prism-cssgrammar.js";

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

