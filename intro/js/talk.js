var $ = Bliss, $$ = Bliss.$;

try {
	var isSpeaker = new URL(location).searchParams.get("speaker") !== null;
}
catch (e) {}

if (isSpeaker) {
	document.documentElement.classList.add("speaker");
}

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

$$(".demo.slide").forEach(slide => {
	// This is before editors have been created
	slide.classList.add("dont-resize");
});

function createURL(html) {
	html = html.replace(/&#x200b;/g, "");
	var blob = new Blob([html], {type : "text/html"});

	return URL.createObjectURL(blob);
}

// Create blob URLs for each preview link
$$("[data-html]").forEach(function(a) {
	var slide = a.closest(".slide");

	a.addEventListener("click", evt => {
		var selector = a.getAttribute("data-html");
		var element = $(selector, slide) || $(selector, slide.parentNode) || $(selector);
		var html = Prism.plugins.NormalizeWhitespace.normalize(element? element.textContent : selector);

		a.href = createURL(html);
	});
});

$$("details.notes").forEach(details => {
	var div = document.createElement("div");

	$$(details.childNodes).forEach(e => div.append(e));
	details.append(div);

	var summary = $("summary", details);

	if (!summary) {
		var slide = details.closest(".slide");
		summary = $.create("summary", {textContent: slide.title || "Notes"});
	}

	details.prepend(summary);
});

// Specificity battle slide
{
	let slide = $("#specificity-battle");
	let output = {
		0: $("output[for=selector1]", slide),
		1: $("output[for=selector2]", slide),
		greater: $('output[for="selector1, selector2"]', slide)
	};
	let input = $$("input", slide);

	function update() {
		var specificity = [];
		var base = 9;

		for (let i=0; i<2; i++) {
			specificity[i] = calculateSpecificity(input[i].value);
			base = Math.max(base, ...specificity);
			output[i].innerHTML = `<div>${specificity[i].join("</div> <div>")}</div>`;
			output[i].className = "";
		}

		base++;

		var diff = parseInt(specificity[0].join(""), base) - parseInt(specificity[1].join(""), base);

		if (diff < 0) {
			// 2 wins
			output.greater.textContent = "<";
			output[1].className = "winner";
		}
		else if (diff > 0) {
			// 1 wins
			output.greater.textContent = ">";
			output[0].className = "winner";
		}
		else {
			output.greater.textContent = "=";
		}

	}

	$$("input", slide).forEach(input => input.addEventListener("input", update));
	update();
}

function calculateSpecificity(selector) {
	selector = selector.replace(/("|').+?\1/g, "");
	return [
		(selector.match(/#/g) || []).length,
		(selector.match(/\.|:(?!not|:)|\[/g) || []).length,
		(selector.match(/(^|\s)[\w-]+/g) || []).length
	];
}


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
	});

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

$$("code.property").forEach(code => {
	$.create("a", {
		href: `https://developer.mozilla.org/en-US/docs/Web/CSS/${code.textContent}`,
		around: code,
		target: "_blank"
	});
});

$$("[data-edit]").forEach(element => {
	var edit = element.getAttribute("data-edit").split(/\s+/);
	var slide = element.closest(".slide");
	var isolated = slide.classList.contains("isolated");
	var editors = element._.data.editors = {};

	if (isolated) {
		var iframe = $.create("iframe", {
			name: "iframe-" + slide.id,
			src: "demo.html",
			inside: slide
		});

		var loaded = new Promise (r => iframe.addEventListener("load", r, {once:true}));

		// slide.classList.add("horizontal");
	}

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
					element.innerHTML = this.value;
				}
			});

			if (isolated) {
				loaded.then(() => {
					var body = iframe.contentDocument.body;

					Array.from(element.childNodes).forEach(node => body.append(node));


					element.remove();
					element = body;
				});
			}
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

					if (!isolated) {
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
						else {
							console.log("FAIL on", slide.id, style.outerHTML, style.media);

							// setTimeout(arguments.callee.bind(this), 1000)
						}
					}
				}
			});

			slide.addEventListener("slidechange", evt => {
				editors.css.dispatchEvent(new InputEvent("input"));
			});

			if (isolated) {
				loaded.then(() => {
					$$("style[data-slide]", slide).forEach(style => iframe.contentDocument.head.append(style));
				});
			}
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
						editor.parentNode.removeAttribute("hidden");
						var newEditor = (editors[editorKeys[i+1]] || editors[editorKeys[0]]);
						newEditor.parentNode.setAttribute("hidden", "");

						resizeTextarea($("textarea", newEditor.parentNode));
					}
				});
			});
		});
	}

	// Open in new Tab button

	var cssEditor = $("textarea.language-css", slide);
	var htmlEditor = $("textarea.language-html", slide);

	if (htmlEditor) {
		var a = $.create("a", {
			className: "button new-tab",
			textContent: "Open in new Tab",
			inside: slide,
			target: "_blank",
			events: {
				click: evt => {
					var css = cssEditor? "\n\n" + cssEditor.value : "";
					var html = htmlEditor.value;
					var title = slide.title || slide.dataset.title || "Demo";

					if (html.indexOf("<body") === -1) {
						html = `<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">
<title>${title}</title>
<style>
body {
	font-size: 200%;
}

input, select, textarea, button {
	font: inherit;
}${css}
</style>

</head>
<body>
${html}
</body>
</html>`;
					}

					a.href = createURL(html);
				}
			}
		});
	}
});

Prism.languages.insertBefore("css", "property", {
	"variable": /\-\-(\b|\B)[\w-]+(?=\s*[:,)]|\s*$)/i
});

$$(".takeaway.slide").forEach((slide, i) => {
	$.create("span", {
		className: "label",
		innerHTML: `Takeaway <span>#</span>${i + 1}`,
		start: $("h1", slide)
	});
});

// CSS Variables specific
document.addEventListener("slidechange", evt => {
	var slideId = evt.target.id;

	var mousemove = evt => {
		document.documentElement.style.setProperty("--mouse-x", evt.clientX / innerWidth);
		document.documentElement.style.setProperty("--mouse-y", evt.clientY / innerHeight);
	};

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
	element.style.setProperty("--length", element.textContent.length);
};

for (let el of document.querySelectorAll(".scrolling")) {
	el.addEventListener("scroll", evt => {
		let maxScroll = el.scrollHeight - el.offsetHeight;
		let scroll = el.scrollTop / maxScroll;
		el.style.setProperty("--scroll", scroll);
	});
}

// Remove spaces in syntax breakdown and add classes to the ones that are towards the end
$$(".syntax-breakdown code").forEach(function(code) {
	var slide = code.closest(".slide");

	if (!slide.classList.contains("vertical")) {
		code.innerHTML = code.innerHTML.replace(/[\t\r\n]/g, "");
	}
	else {
		code.innerHTML = Prism.plugins.NormalizeWhitespace.normalize(code.innerHTML);
	}

	var text = code.textContent;

	$$("span", code).forEach(function(span) {
		span.classList.add("delayed");

		if (text.indexOf(span.textContent) > text.length/2) {
			// FIXME will break when there are duplicates
			span.classList.add("after-middle");
		}
	});
});
