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

		this.code = $.create("code", {
			textContent: textarea.value
		});

		this.pre = $.create("pre", {
			className: textarea.className + " no-whitespace-normalization",
			contents: this.code,
			before: textarea,
			style: $.extend({}, cs, ["padding"])
		});

		Prism.highlightElement(this.code);

		new Incrementable(textarea);

		$.events(textarea, {
			input: evt => {
				this.update();
			},

			keyup: evt => {
				if (evt.keyCode == 13) { // Enter
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
				var selected = this.selectionStart == this.selectionEnd;

				if (evt.keyCode == 9 && !evt.altKey) { // Tab
					if (selected) {
						// Nothing selected
						var before = this.beforeCaret();

						if (/(^|\r|\n)\s*$/.test(before)) {
							// Spaces or line break before caret
							this.insert("\t");
						}
						else {
							// HTML expansion
							var after = this.afterCaret();
							var selector = before.match(/\w*$/)[0];

							this.delete(selector);

							if (selector in _.snippets) {
								// Snippet
								this.insert(_.snippets[selector]);
							}
							else if (/<[^>]*$/.test(before) && /[^<]*>/.test(after)) {
								// Attribute
								this.insert(`${selector}=""`);
								this.moveCaret(-1);
							}
							else {
								// Tag
								if (_.selfClosing.indexOf(selector) > -1) {
									this.insert(`<${selector} />`);
									this.moveCaret(-2);
								}
								else {
									this.insert(`<${selector}></${selector}>`);
									this.moveCaret(-selector.length - 3);
								}

							}
						}

						evt.preventDefault();

						requestAnimationFrame(() => this.textarea._.fire("input"));
					}
					else {
						// TODO Text is selected, indent or unindent
					}
				}
				else if (evt.keyCode == 191 && evt.metaKey) { // Cmd + /
					if (selected) {
						// No selection

					}
					else {
						// Some text is selected
						this.wrapSelection({
							before: "<!--",
							after: "-->"
						});
					}
				}
			},

			scroll: evt => {
				this.syncScroll();
			}
		});
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
		this.selectionStart =
		this.selectionEnd = this.selectionEnd + chars;
	},

	insert: function(text, index) {
		this.textarea.focus();

		if (index !== undefined) {
			var start = this.selectionStart;
			var end = this.selectionEnd;

			this.selectionStart = this.selectionEnd = index;
			this.insert(text);

			this.selectionStart = start + (index < start? text.length : 0);
			this.selectionEnd = end + (index < end? text.length : 0);
		}
		else {
			document.execCommand("insertText", false, text);
		}
	},

	wrapSelection: function(o = {}) {
		this.insert(o.before, this.selectionStart);
		this.insert(o.after, this.selectionEnd);
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
			"submit": '<button type="submit">Submit</button>'
		},
		selfClosing: ["input", "img", "link", "meta", "base", "br", "hr"]
	}
});

$.ready().then(() => {
	$$("textarea.editor").forEach(textarea => new _(textarea));
});

})(Bliss, Bliss.$);
