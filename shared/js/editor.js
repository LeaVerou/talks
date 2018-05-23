/**
	Prism Live: Code editor based on Prism.js
	Works best in Chrome. Currently only very basic support in other browsers (no snippets, no shortcuts)
	@author Lea Verou
*/
(function($, $$) {

var superKey = navigator.platform.indexOf("Mac") === 0? "metaKey" : "ctrlKey";

var _ = Prism.Live = $.Class({
	constructor: function(textarea) {
		_.all.set(textarea, this);

		this.textarea = textarea;

		var cs = getComputedStyle(textarea);

		this.wrapper = $.create({
			className: "editor",
			around: textarea
		});

		this.code = $.create("code");

		this.pre = $.create("pre", {
			className: textarea.className + " no-whitespace-normalization",
			contents: this.code,
			before: textarea,
			style: $.extend({}, cs, ["padding"])
		});

		this.update();

		this.lang = this.code.className.match(/language-(\w+)/)[1] || "markup";
		// TODO what about languages in another language? E.g. CSS in HTML?
		this.context = $.extend({
			comments: ["/*", "*/"],
			snippets: {}
		}, _.languages[this.lang]);


		if (self.Incrementable) {
			new Incrementable(this.textarea);
		}

		$.events(this.textarea, {
			input: evt => {
				this.update();
			},

			keyup: evt => {
				if (evt.key == "Enter") { // Enter
					// Maintain indent on line breaks
					var before = this.value.slice(0, this.selectionStart-1);
					var indents = before.match(/^\s*/mg);
					var indent = indents && indents[indents.length - 1];

					if (indent) {
						this.insert(indent);
					}

					this.syncScroll();
				}
			},

			keydown: evt => {
				if (evt.key == "Tab" && !evt.altKey) {
					// Default is to move focus off the textarea
					// this is never desirable in an editor
					evt.preventDefault();

					if (this.hasSelection) {
						var before = this.beforeCaret("\n");
						var isBeforeIndented = /^\t/gm.test(before);
						var hasLineAbove = before.length == this.selectionStart;
						var outdent = evt.shiftKey;

						this.selectionStart -= before.length;

						if (outdent) {
							var selection = this.selection.replace(/^\t/gm, "");
						}
						else { // Indent
							var selection = this.selection.replace(/^/gm, "\t");
						}

						this.replace(selection);

						if (outdent) {
							this.selectionStart += before.length + 1 - (outdent + isBeforeIndented);
						}
						else {
							this.selectionStart += before.length + 1 + !hasLineAbove;
						}
					}
					else {
						// Nothing selected, expand snippet
						var before = this.beforeCaret();

						if (/(^|\r|\n)\s*$/.test(before)) {
							// Spaces or line break before caret
							this.insert("\t");
						}
						else {
							// Snippets
							var after = this.afterCaret();
							var selector = before.match(/\S*$/)[0];

							this.delete(selector);

							var handled = false;

							if (selector in this.context.snippets || selector in _.snippets) {
								// Static Snippets
								this.insert(this.context.snippets[selector] || _.snippets[selector]);
								handled = true;
							}
							else if (this.context.snippets.custom) {
								handled = this.context.snippets.custom.call(this, selector, before, after);
							}

							if (!handled) {
								// Nothing worked, insert a Tab character
								this.insert(selector + "\t");
							}
						}

						requestAnimationFrame(() => $.fire(this.textarea, "input"));
					}
				}
				else if (evt.key == "/" && evt[superKey]) { // Cmd + /
					this.toggleComment();
				}
				else if (evt.key == "D" && evt.shiftKey && evt[superKey]) {
					// Duplicate line
					var before = this.beforeCaret("\n");
					var after = this.afterCaret("\n");
					var text = before + this.selection + after;

					this.insert(text, this.selectionStart - before.length);

					evt.preventDefault();
				}
				else if (_.pairs[evt.key]) {
					var other = _.pairs[evt.key];
					this.wrapSelection({
						before: evt.key,
						after: other,
						outside: true
					});
					evt.preventDefault();
				}
			}
		});

		textarea.addEventListener("scroll", evt => {
			this.syncScroll();
		}, {passive: true});
	},

	get selectionStart() {
		return this.textarea.selectionStart;
	},

	set selectionStart(v) {
		this.textarea.selectionStart = v;
	},

	get selectionEnd() {
		return this.textarea.selectionEnd;
	},

	set selectionEnd(v) {
		this.textarea.selectionEnd = v;
	},

	get hasSelection() {
		return this.selectionStart != this.selectionEnd;
	},

	get selection() {
		return this.value.slice(this.selectionStart, this.selectionEnd);
	},

	get value() {
		return this.textarea.value;
	},

	set value(v) {
		this.textarea.value = v;
	},

	update: function() {
		var code = this.value;

		if (/\n$/.test(this.value)) {
			code += "\u200b";
		}

		this.code.textContent = code;

		Prism.highlightElement(this.code);
	},

	syncScroll: function() {
		this.pre.scrollTop = this.textarea.scrollTop;
		this.pre.scrollLeft = this.textarea.scrollLeft;
	},

	beforeCaretIndex: function(until = "") {
		return this.value.lastIndexOf(until, this.selectionStart);
	},

	afterCaretIndex: function(until = "") {
		return this.value.indexOf(until, this.selectionEnd);
	},

	beforeCaret: function(until = "") {
		var index = this.beforeCaretIndex(until);

		if (index === -1 || !until) {
			index = 0;
		}

		return this.value.slice(index, this.selectionStart);
	},

	afterCaret: function(until = "") {
		var index = this.afterCaretIndex(until);

		if (index === -1 || !until) {
			index = undefined;
		}

		return this.value.slice(this.selectionEnd, index);
	},

	setCaret: function(pos) {
		this.selectionStart = this.selectionEnd = pos;
	},

	moveCaret: function(chars) {
		this.setCaret(this.selectionEnd + chars);
	},

	insert: function(text, index) {
		this.textarea.focus();

		if (index === undefined) {
			// No specified index, insert in current caret position
			this.replace(text);
		}
		else {
			// Specified index, first move caret there
			var start = this.selectionStart;
			var end = this.selectionEnd;

			this.selectionStart = this.selectionEnd = index;
			this.replace(text);

			this.selectionStart = start + (index < start? text.length : 0);
			this.selectionEnd = end + (index <= end? text.length : 0);
		}
	},

	// Replace currently selected text
	replace: function(text) {
		var hadSelection = this.hasSelection;

		document.execCommand("insertText", false, text);

		if (hadSelection) {
			// By default inserText places the caret at the end, losing any selection
			// What we want instead is the replaced text to be selected
			this.selectionStart = this.selectionEnd - text.length;
		}
	},

	// Set text between indexes and restore caret position
	set: function(start, end, text) {
		var ss = this.selectionStart;
		var se = this.selectionEnd;

		this.selectionStart = start;
		this.selectionEnd = end;

		document.execCommand("insertText", false, text);

		this.selectionStart = ss;
		this.selectionEnd = se;
	},

	wrap: function({before, after, start = this.selectionStart, end = this.selectionEnd} = {}) {
		var ss = this.selectionStart;
		var se = this.selectionEnd;
		var between = this.value.slice(start, end);

		this.set(start, end, before + between + after);

		if (ss > start) {
			ss += before.length;
		}

		if (se > start) {
			se += before.length;
		}

		if (ss > end) {
			ss += after.length;
		}

		if (se > end) {
			se += after.length;
		}

		this.selectionStart = ss;
		this.selectionEnd = se;
	},

	wrapSelection: function(o = {}) {
		var hadSelection = this.hasSelection;

		this.replace(o.before + this.selection + o.after);

		if (hadSelection) {
			if (o.outside) {
				// Do not include new text in selection
				this.selectionStart += o.before.length;
				this.selectionEnd -= o.after.length;
			}
		}
		else {
			this.moveCaret(-o.after.length);
		}
	},

	toggleComment: function() {
		var comments = this.context.comments;

		// Are we inside a comment?
		var start = this.beforeCaretIndex(comments[0]);
		var end = this.afterCaretIndex(comments[1]);

		if (start === -1 || end === -1) {
			// Not inside comment, add
			if (this.hasSelection) {
				this.wrapSelection({
					before: comments[0],
					after: comments[1]
				});
			}
			else {
				// No selection, wrap line
				end = this.afterCaretIndex("\n");
				this.wrap({
					before: comments[0],
					after: comments[1],
					start: this.beforeCaretIndex("\n") + 1,
					end: end < 0? this.value.length : end
				});
			}
		}
		else {
			// Inside comment, remove
			this.set(start, end + comments[1].length, this.value.slice(start + comments[0].length, end));
		}
	},

	delete: function(characters, {forward, pos} = {}) {
		var i = characters = characters > 0? characters : (characters + "").length;

		if (pos) {
			var selectionStart = this.selectionStart;
			this.selectionStart = pos;
			this.selectionEnd = pos + this.selectionEnd - selectionStart;
		}

		while (i--) {
			document.execCommand(forward? "forwardDelete" : "delete");
		}

		if (pos) {
			// Restore caret
			this.selectionStart = selectionStart - characters;
			this.selectionEnd = this.selectionEnd - pos + this.selectionStart;
		}
	},

	static: {
		all: new WeakMap(),
		snippets: {
			"test": "Snippets work!",
		},
		pairs: {
			"(": ")",
			"[": "]",
			"{": "}",
			'"': '"',
			"'": "'",
			"`": "`"
		},
		languages: {
			"markup": {
				comments: ["<!--", "-->"],
				selfClosing: ["input", "img", "link", "meta", "base", "br", "hr"],
				snippets: {
					"submit": '<button type="submit">Submit</button>',
					custom: function (selector, before, after) {
						var isName = /^[\w:-]+$/.test(selector);
						var isSnippet = isName || selector.match(/^[.#\w:-]+(\{.+?\})?(\*\d+)?$/);

						if (isName && /<[^>]+$/.test(before) && /[^<]*>/.test(after)) {
							// Attribute
							this.insert(`${selector}=""`);
							this.moveCaret(-1);

							return true;
						}
						else if (isSnippet) {
							var times = 1;
							var content = "";

							if (isSnippet[1]) {
								// Content
								content = isSnippet[1].slice(1, -1);
							}

							if (isSnippet[2]) { // Times
								times = isSnippet[2].slice(1);
							}

							var tag = selector.match(/^[\w:-]+/) || "div";
							var html = `<${tag}`;

							var id = selector.match(/#([\w-]+)/);

							if (id) {
								id = id[1];
								html += ` id="${id}"`;
							}

							var classes = selector.match(/\.[\w-]+/g);

							if (classes) {
								classes = classes.map(x => x.slice(1));
								html += ` class="${classes.join(" ")}"`;
							}

							var selfClosing = _.languages.markup.selfClosing.indexOf(tag) > -1;

							html += selfClosing? " />" : ">";

							var caret = this.selectionStart;
							var tagLength = html.length;

							for (var i=0; i<times; i++) {
								// Tag
								if (selfClosing) {
									this.insert(html);
								}
								else {
									this.insert(`${html}${content}</${tag}>`);
								}

								if (times > 1 && i + 1 < times) {
									this.insert("\n");
								}
							}

							this.setCaret(caret + tagLength + (selfClosing? -2 : 0));

							return true;
						}
					}
				}
			},
			"css": {
				snippets: {
					custom: function (property, before, after) {
						// Expand property
						var style = document.documentElement.style;

						if (!/^--/.test(property) && !(property in style)) {
							// Nonexistent property, try as a shortcut
							var allProperties =  Object.keys(style)
												.map(a => a.replace(/[A-Z]/g, $0 => "-" + $0.toLowerCase()));
							var properties = allProperties.filter(p => {
										return p.indexOf(property) === 0 // starts with
											|| p.split("-").map(b => b[0]).join("") === property; // abbreviation
									}).sort((a, b) => a.length - b.length);

							if (properties.length) {
								if (properties.length > 1) {
									// Many options, don't add the 1.5 colons
									// (mimic terminal autocomplete)
									this.insert(properties[0]);
									return true;
								}

								property = properties[0];
							}
						}

						this.insert(`${property}: ;`);
						this.moveCaret(-1);
						return true;
					}
				}
			},
			"js": {
				snippets: {
					log: "console.log()"
				}
			}
		}
	}
});

Prism.Live.languages.html = Prism.Live.languages.markup;

$.ready().then(() => {
	$$("textarea.editor").forEach(textarea => {
		if (!_.all.get(textarea)) {
			new _(textarea);
		}
	});
});

})(Bliss, Bliss.$);
