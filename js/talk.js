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

	if (edit.indexOf("html") > -1) {
		editors.html = createEditor(slide, "html", {
			fromSource: () => element.outerHTML.replace(/\s*data-edit=".+?"|=""(?=\s|>)/g, ""),
			toSource: function() {
				var pos = {
					parent: element.parentNode,
					next: element.nextSibling,
					prev: element.previousSibling
				};

				element.outerHTML = this.value;

				element = pos.prev? pos.prev.nextSibling :
						  pos.next? pos.next.previousSibling :
						  pos.parent.childNodes[0];
			}
		});

		if (!slide.classList.contains("dont-enlarge")) {
			$.create("div", {
				className: "enlarge",
				around: element
			});
		}
	}
	else if (edit.indexOf("contents") > -1) {
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



})(Bliss, Bliss.$);
