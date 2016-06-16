var slideshow = new SlideShow();
var $ = Bliss;

(function($, $$){

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

$$('[data-edit]').forEach(element => {
	var edit = element.getAttribute("data-edit").split(/\s+/);
	var slide = element.closest(".slide");
	var editors = element._.data.editors = {};

	if (edit.indexOf("html") > -1 || edit.indexOf("contents") > -1) {
		if (edit.indexOf("html") > -1) {
			element.removeAttribute("data-edit");

			element = $.create("div", {
				around: element,
				"data-edit": edit.join(" ").replace("html", "contents")
			});
		}

		editors.contents = createEditor(slide, "contents", {
			lang: "html",
			fromSource: () => Prism.plugins.NormalizeWhitespace.normalize(element.innerHTML.replace(/=""(?=\s|>)/g, "")),
			toSource: function() {
				element.innerHTML = this.value
			}
		});
	}

	if (edit.indexOf("css") > -1) {
		var style = $("style[data-slide]", slide) || $.create("style", {
			"data-slide": "",
			inside: slide
		});

		editors.css = createEditor(slide, "css", {
			fromSource: () => style.textContent,
			toSource: function() {
				style.textContent = this.value
			}
		});
	}

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
						(editors[editorKeys[i+1]] || editors[editorKeys[0]]).parentNode.removeAttribute("hidden");
					}
				});
			});
		});

	}
});

(function() {
	var resize = evt => {
		var textarea = evt.type == "input"? evt.target : $("textarea.editor", evt.target);

		if (textarea && textarea.matches("textarea.editor")) {
			textarea.style.height = "0";
			textarea.parentNode.style.fontSize = "";

			textarea.style.height = textarea.scrollHeight + "px";

			var cs = getComputedStyle(textarea);

			if (cs.height == cs.maxHeight) {
				var ratio = Math.min(2, textarea.scrollHeight/textarea.offsetHeight) - 1;
				textarea.parentNode.style.fontSize = 100 - Math.round(50 * ratio) + "%";
			}
		}
	};

	$.events(document.documentElement, "slidechange input", resize);
	window.addEventListener("load", evt => {
		requestAnimationFrame(() => resize({target: slideshow.currentSlide}));
	})

})();

$("#details-demo").addEventListener("toggle", function(evt) {

	var textarea = $("textarea", this);

	textarea.value = $("details").closest("[data-edit]").innerHTML.replace(/=""(?=\s|>)/g, "");
	Prism.Live.all.get(textarea).update();
}, true);

// Display certain keys pressed
var keys = {
	"Tab": 9,
	"Enter": 13,
	"Esc": 27,
	"DownArrow": 40
}

var keyCodes = Object.keys(keys).map(key => keys[key]);

document.addEventListener("keyup", function(evt) {
	var code = evt.keyCode;
	var i = keyCodes.indexOf(code);

	if (i > -1 && evt.target.nodeName != "TEXTAREA") {
		var element = slideshow.currentSlide;
		var label = Object.keys(keys)[i];

		if (element && element.matches(`[data-keys~=${label}]`)) {
			label = label.replace("Tab", "⇥")
			             .replace("Enter", "⏎")
						 .replace("DownArrow", "↓");
			label = (evt.ctrlKey? "⌃" : "") + (evt.shiftKey? "⇧" : "") + (evt.metaKey? "⌘" : "") + (evt.altKey? "⌥" : "") + label;

			var key = $.create("kbd", {
				textContent: label,
				inside: element
			});

			setTimeout(() => {
				$.transition(key, {opacity: 0}).then($.remove);
			}, 600);
		}
	}
});

document.body.addEventListener("toggle", evt => {
	var accordion = evt.target.closest(".accordion");
	if (evt.target.open && accordion) {
		$$("details", accordion).forEach(details => {
			if (details != evt.target) {
				details.open = false;
			}
		});
	}
}, true);

})(Bliss, Bliss.$);
