/*
Prism.languages.scss.selector.pattern = /(?=\S)[^@;{}()]?(?:[^@;{}()\s]|\s+(?!\s)|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}][^:{}]*[:{][^}]))/;  */
Prism.languages.scss.selector.pattern = /(?=\S)[^@;{}()]?(?:[^@;{}\s]|\s+(?!\s)|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}][^:{}]*[:{][^}]))/;

Prism.languages.css.selector.inside ??= {};
Prism.languages.css.selector.inside.parent = {
	pattern: /&/,
	alias: 'important'
};

// Inspired by https://www.w3.org/TR/css-syntax/#token-diagrams
// but completely incomplete
Prism.languages.tokenizedcss = {
	whitespace: /\s/,
	hash: /#[\w\P{ASCII}-]*/ui,
	literal: /[:;{}]/,
	ident: /[a-z_\P{ASCII}-][\w\P{ASCII}-]*/ui,
}