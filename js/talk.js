var $ = Bliss, $$ = Bliss.$;

function createEditor(slide, label, o = {}) {
	var lang = o.lang || label;

	return $.create("textarea", {
		id: `${slide.id}-${label}-editor`,
		className: `language-${lang} editor`,
		"data-lang": lang,
		inside: slide,
		value: o.fromSource(),
		events: {
			input: o.toSource
		}
	});
}

function scopeRule(rule, slide, scope) {
	let selector = rule.selectorText;

	if (rule.cssRules) {
		// If this rule contains rules, scope those too
		// Mainly useful for @supports and @media
		for (let innerRule of rule.cssRules) {
			scopeRule(innerRule, slide, scope);
		}
	}

	if (selector && rule instanceof CSSStyleRule) {
		let shouldScope = !(
			selector.includes("#")  // don't do anything if the selector already contains an id
			|| selector == ":root"
		);

		if (selector == "article" || selector == ".slide") {
			rule.selectorText = `#${slide.id}`;
		}
		else if (shouldScope && selector.indexOf(scope) !== 0) {
			rule.selectorText = scope + " " + selector;
		}
	}
}

$$(".demo.slide").forEach(slide => slide.classList.add("dont-resize"));

(function() {
	document.addEventListener("keydown", evt => {
		var code = evt.keyCode;

		if ((evt.metaKey || evt.ctrlKey) && [48, 187, 189].includes(code)) {
			var editor = evt.target.closest("div.editor");

			if (editor) {
				evt.preventDefault();

				if (code == 48) {
					var multiplier = 1;
				}
				else {
					var multiplier = +getComputedStyle(editor).getPropertyValue("--font-size-multiplier") || 1;
					multiplier *= code == 189? .9 : 10/9;
				}

				editor.style.setProperty("--font-size-multiplier", multiplier);

				resizeTextarea(editor);
			}
		}
	});

	$.events(document.documentElement, "slidechange input", resizeTextarea);
	window.addEventListener("load", evt => {
		requestAnimationFrame(() => resizeTextarea(slideshow.currentSlide));
	})

})();

function resizeTextarea(textarea) {
	textarea = textarea.target || textarea;

	if (textarea.nodeName != "TEXTAREA") {
		textarea = $("textarea.editor", textarea);
	}

	if (textarea && textarea.matches(".demo.slide.horizontal div.editor > textarea.editor")) {
		textarea.style.height = "0";
		textarea.parentNode.style.fontSize = "";

		textarea.style.height = textarea.scrollHeight + "px";

		var cs = getComputedStyle(textarea);

		// if (cs.height == cs.maxHeight) {
		// 	var ratio = Math.min(2, textarea.scrollHeight/textarea.offsetHeight) - 1;
		// 	textarea.parentNode.style.fontSize = 100 - Math.round(50 * ratio) + "%";
		// }
	}
};

document.addEventListener("slideshowinit", evt => {

});

function fixHTML(html) {
	return html.replace(/=""(?=\s|>)/g, "");
}

$$('[data-edit]').forEach(element => {
	var edit = element.getAttribute("data-edit").split(/\s+/);
	var slide = element.closest(".slide");
	var editors = element._.data.editors = {};

	edit.forEach(code => {
		if (code == "html" || code == "contents") {
			if (code == "html") {
				element.removeAttribute("data-edit");

				element = $.create("div", {
					around: element,
					"data-edit": edit.join(" ").replace("html", "contents")
				});
			}

			editors.contents = createEditor(slide, "contents", {
				lang: "html",
				fromSource: () => Prism.plugins.NormalizeWhitespace.normalize(fixHTML(element.innerHTML)),
				toSource: function() {
					element.innerHTML = this.value
				}
			});
		}

		if (code == "css") {
			var style = $("style[data-slide]", slide) || $.create("style", {
				"data-slide": "",
				inside: slide
			});

			editors.css = createEditor(slide, "css", {
				fromSource: () => Prism.plugins.NormalizeWhitespace.normalize(style.textContent),
				toSource: function() {
					style.textContent = this.value;

					if (!style.sheet) {
						// Stupid Chrome bug
						style.textContent = style.textContent + "/**/";
					}

					if (style.sheet) {
						let scope = style.getAttribute("data-scope") || `#${slide.id}`;

						for (let rule of style.sheet.cssRules) {
							scopeRule(rule, slide, scope);
						}
					}
					else console.log("FAIL on", slide.id, style.outerHTML, style.media);
				}
			});

			slide.addEventListener("slidechange", evt => {
				editors.css.dispatchEvent(new InputEvent("input"));
			});
		}
	});

	if (edit.length > 1) {
		// More than 1 editors, need the ability to toggle
		var editorKeys = Object.keys(editors);

		requestAnimationFrame(() => {
			editorKeys.forEach((label, i) => {
				var editor = editors[label];

				editor.parentNode.hidden = i > 0;

				$.create("label", {
					htmlFor: editor.id,
					after: editor,
					textContent: editor.dataset.lang,
					tabIndex: "0",
					onclick: function() {
						editor.parentNode.setAttribute("hidden", "");
						var newEditor = (editors[editorKeys[i+1]] || editors[editorKeys[0]]);
						newEditor.parentNode.removeAttribute("hidden");

						resizeTextarea($("textarea", newEditor.parentNode));
					}
				});
			});
		});

	}
});

Prism.languages.insertBefore("css", "property", {
	"variable": /\-\-(\b|\B)[\w-]+(?=\s*[:,)]|\s*$)/i
});

// Specific slide demos

document.addEventListener("slidechange", evt => {
	var slideId = evt.target.id;

	var mousemove = evt => {
		document.documentElement.style.setProperty("--mouse-x", evt.clientX / innerWidth);
		document.documentElement.style.setProperty("--mouse-y", evt.clientY / innerHeight);
	}

	if (slideId == "mouse") {
		document.addEventListener("mousemove", mousemove);
	}
	else {
		document.removeEventListener("mousemove", mousemove);
	}
});

for (input of document.querySelectorAll("input")) {
	input.style.setProperty("--value", input.value);
}

document.addEventListener("input", evt => {
	if (evt.target.matches(":target input")) {
		evt.target.style.setProperty("--value", input.value);
	}
});

var setLength = element => {
	element.style.setProperty("--length", element.textContent.length)
};

for (let element of document.querySelectorAll("p.typing")) {
	setLength(element);

	var observer = new MutationObserver(r => setLength(element));
	observer.observe(element, {
		characterData: true,
		childList: true,
		subtree: true
	});
}

$$(".takeaway.slide").forEach((slide, i) => {
	$.create("span", {
		className: "label",
		innerHTML: `Takeaway <span>#</span>${i + 1}`,
		start: $("h1", slide)
	});
});

for (let el of document.querySelectorAll(".scrolling")) {
	el.addEventListener("scroll", evt => {
		let maxScroll = el.scrollHeight - el.offsetHeight;
		let scroll = el.scrollTop / maxScroll;
		el.style.setProperty("--scroll", scroll);
	});
}
