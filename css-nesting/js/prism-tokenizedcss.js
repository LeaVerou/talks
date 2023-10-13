/**
 * Inspired by https://www.w3.org/TR/css-syntax/#token-diagrams
 * but completely incomplete. Tokens are simplified and the following tokens are missing:
 * - url, bad-url, unicode-range, cdo, cdc, comment
 */
let ident = /[a-z_\P{ASCII}-][\w\P{ASCII}-]*/ui;
let number = /[+-]?(\d*\.?\d+)(e[+-]?\d+)?/i;

Prism.languages.tokenizedcss = {
	whitespace: /\s+/,
	hash: /#[\w\P{ASCII}-]*/ui,
	atkeyword: RegExp(`@${ident.source}`, "ui"),
	function: RegExp(`${ident.source}\\(`, "ui"),
	string: /"[^"]*"|'[^']*'/, // FIXME handle escaping
	percentage: RegExp(`${number.source}%`, "ui"),
	dimension: RegExp(`${number.source}${ident.source}`, "ui"),
	ident,
	number,
	closeparen: {pattern: /\)/, alias: "literal"},
	openparen: {pattern: /\(/, alias: "literal"},
	comma: {pattern: /,/, alias: "literal"},
	semicolon: {pattern: /;/, alias: "literal"},
	openbrace: {pattern: /{/, alias: "literal"},
	closebrace: {pattern: /}/, alias: "literal"},
	openbracket: {pattern: /\[/, alias: "literal"},
	closebracket: {pattern: /]/, alias: "literal"},
	colon: {pattern: /:/, alias: "literal"},
	delim: {pattern: /./, alias: "literal"},
}

for (let token of document.querySelectorAll(":is(.tokenizedcss, .language-tokenizedcss) code.token:empty")) {
	let classes = [...token.classList];
	let tokenName = classes[classes.indexOf("token") + 1];
	token.textContent = `<${tokenName}-token>`;
}

