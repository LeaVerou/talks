(function($, $$){

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
			new Incrementable(textarea);
		}

		$.events(textarea, {
			input: evt => {
				this.update();
			},

			keyup: evt => {
				if (evt.key == "Enter") { // Enter
					// Maintain indent on line breaks
					var before = this.textarea.value.slice(0, this.selectionStart-1);
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
						if (evt.shiftKey) {
							// Outdent
							var selection = this.selection.replace(/^\t/gm, "");
						}
						else {
							// Indent
							var selection = this.selection.replace(/\n/g, "\n\t")
							                              .replace(/^/, "\t");
						}

						this.replace(selection);
					}
					else {
						// Nothing selected, expand snippet
						var before = this.beforeCaret();

						if (/(^|\r|\n)\s*$/.test(before)) {
							// Spaces or line break before caret
							this.insert("\t");
						}
						else {
							// HTML expansion
							var after = this.afterCaret();
							var selector = before.match(/\S*$/)[0];

							this.delete(selector);

							if (selector in this.context.snippets || selector in _.snippets) {
								// Static Snippets
								this.insert(this.context.snippets[selector] || _.snippets[selector]);
							}
							else if (this.context.snippets.custom) {
								var handled = this.context.snippets.custom.call(this, selector, before, after);

								if (!handled) {
									// Nothing worked, insert a Tab character
									this.insert(selector + "\t");
								}
							}
						}

						requestAnimationFrame(() => $.fire(this.textarea, "input"));
					}
				}
				else if (evt.key == "/" && evt.metaKey) { // Cmd + /
					var comments = this.context.comments;

					this.wrapSelection({
						before: comments[0],
						after: comments[1]
					});
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
		}, {
			passive: true
		})
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
		return this.textarea.value.slice(this.selectionStart, this.selectionEnd);
	},

	update: function() {
		this.code.textContent = this.textarea.value;
		Prism.highlightElement(this.code);
	},

	syncScroll: function() {
		this.pre.scrollTop = this.textarea.scrollTop;
		this.pre.scrollLeft = this.textarea.scrollLeft;
	},

	beforeCaret: function() {
		return this.textarea.value.slice(0, this.selectionStart);
	},

	afterCaret: function() {
		return this.textarea.value.slice(this.selectionEnd);
	},

	moveCaret: function(chars) {
		this.selectionStart = this.selectionEnd = this.selectionEnd + chars;
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

	delete: function(characters) {
		characters = characters > 0? characters : (characters + "").length;
		while(characters--) {
			document.execCommand("delete");
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

						if (isName && /<[^>]+$/.test(before) && /[^<]*>/.test(after)) {
							// Attribute
							this.insert(`${selector}=""`);
							this.moveCaret(-1);

							return true;
						}
						else if (isName) {
							// Tag
							if (_.languages.markup.selfClosing.indexOf(selector) > -1) {
								this.insert(`<${selector} />`);
								this.moveCaret(-2);
							}
							else {
								this.insert(`<${selector}></${selector}>`);
								this.moveCaret(-selector.length - 3);
							}

							return true;
						}
					}
				}
			}
		}
	}
});

$.ready().then(() => {
	$$("textarea.editor").forEach(textarea => new _(textarea));
});

})(Bliss, Bliss.$);
