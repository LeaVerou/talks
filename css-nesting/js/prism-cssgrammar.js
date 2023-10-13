/**
 * For highlighting CSS grammars
 */
let nonterminal = /<[\w-]+>/;
let tokens = {
	whitespace: /<whitespace-token>/,
	hash: /<hash-token>/,
	function: /<function-token>/,
	string: /<string-token>/,
	percentage: /<percentage-token>/,
	dimension: /<dimension-token>/,
	number: /<number-token>/,
	ident: /<ident-token>/,
	any: /<any-token>/,
	delim: {pattern: /<delim-token>/, alias: "literal"},
	colon: {pattern: /<colon-token>/, alias: "literal"},
	closeparen: {pattern: /<\)-token>/, alias: "literal"},
	openparen: {pattern: /<\(-token>/, alias: "literal"},
	comma: {pattern: /<comma-token>/, alias: "literal"},
	semicolon: {pattern: /<semicolon-token>/, alias: "literal"},
	openbrace: {pattern: /<\{-token>/, alias: "literal"},
	closebrace: {pattern: /<\}-token>/, alias: "literal"},
	openbracket: {pattern: /<\[-token>/, alias: "literal"},
	closebracket: {pattern: /<\]-token>/, alias: "literal"},
	nonterminal,
	literal: {
		pattern: /'.'/,
		inside: {
			punctuation: /'/g,
		}
	},
	equals: {pattern: /=/, alias: "punctuation"},
	multiplier: {pattern: /[?#+!*]/, alias: "punctuation"},
	combinator: {pattern: /[|&]+/, alias: "punctuation"},
	grouping: {pattern: /[\[\]/]/, alias: "punctuation"},
}



Prism.languages.cssgrammar = {
	production: {
		pattern: RegExp(`^\\s*${nonterminal.source}\\s*=\\s*([^=]|'=')+(?=\\s*$|\\s+${nonterminal.source}\\s*=)`, "m"),
		inside: tokens
	},
	...tokens,
}

// Align lines at the =
Prism.hooks.add("before-highlight", env => {
	if (env.language !== "cssgrammar" || !env.code.includes("=")) {
		return;
	}

	let lines = env.code.trim().split(/\r?\n/).map(line => line.trim());
	// Find = max index
	let maxEqIndex = lines.reduce((max, line) => Math.max(max, line.indexOf("=")), -1);
	let productionIndent = env.element.parentNode.dataset.productionIndent;
	productionIndent = productionIndent ? Number(productionIndent) : undefined;

	// Now pad all lines that have = with spaces
	lines = lines.map(line => {
		let eqIndex = line.indexOf("=");
		let lengthAfter = line.length - eqIndex - 1;
		let offset = eqIndex > -1 ? 1 : productionIndent ?? (line.trim().startsWith("|")? 0 : 2);
		let targetLength = maxEqIndex + offset + lengthAfter;
		return line.padStart(targetLength);
	});

	env.code = lines.join("\n");
});

let uniqueTokens = [];
Prism.hooks.add("after-highlight", env => {
	if (env.language !== "cssgrammar") {
		return;
	}

	for (let token of env.element.querySelectorAll('[class="token nonterminal"]')) {
		let name = token.textContent.replace(/<|>/g, "");
		token.dataset.token = name;

		let index = uniqueTokens.indexOf(name);
		if (index > -1) {
			token.style.setProperty("--token-index", index);
		}
		else {
			token.style.setProperty("--token-index", uniqueTokens.push(name) - 1);
		}
	}
});