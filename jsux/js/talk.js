var $ = Bliss, $$ = $.$;

$$(".slide > h1").forEach(h1 => {
	let slide = Inspire.getSlide(h1);
	if (!h1.classList.contains("no-balance-lines") && !$(".balance-lines", slide)) {
		h1.classList.add("balance-lines");
	}
});

$$(".whynot.slide").forEach(slide => {
	$.create("h1", {
		textContent: "Why not…",
		start: slide
	})
});

$$(".hall.slide").forEach(slide => {
	var word = slide.classList.contains("shame")? "Shame" :
	           slide.classList.contains("fame")? "Fame" :
			   slide.classList.contains("meh")? "Meh" : "What?!";

	$.create("h1", {
		innerHTML: `API Hall of <strong>${word}</strong>`,
		start: slide
	});
});

Prism.languages.console = Prism.languages.javascript;

Prism.languages.insertBefore("console", "comment", {
	"prompt": /^[<>]/m
});

$$(".language-console").forEach(div => {
	$$("pre", div).forEach(pre => {
		var code = pre.textContent;
		pre.classList.add("delayed");
		pre.classList.toggle("in", code.trim().indexOf(">") === 0);
		pre.classList.toggle("out", code.trim().indexOf("<") === 0);
		pre.classList.toggle("language-error", pre.classList.contains("error"));
		pre.style.setProperty("--charcount", code.length)
	});

	if (!div.classList.contains("overlay")) {
		div.closest(".slide").classList.add("console");
	}
});

Prism.languages.markup.tag.alias = "grouptoken";

(async function($, $$){

/*
$("#details-demo").addEventListener("toggle", function(evt) {

	var textarea = $("textarea", this);

	textarea.value = $("details").closest("[data-edit]").innerHTML.replace(/=""(?=\s|>)/g, "");
	Prism.Live.all.get(textarea).update();
}, true);
*/
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
		var element = Inspire.currentSlide;
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
/*
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
*/

})(Bliss, Bliss.$);
