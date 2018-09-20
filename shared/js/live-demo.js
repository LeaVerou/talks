var $ = Bliss, $$ = $.$;

$.events(document, "slidechange", evt => {
	var slide = evt.target;

	if (slide.matches(".example:not(.initialized)")) {
		slide.classList.add("dont-resize");
		let textarea = $("textarea", slide);
		let editor = new Prism.Live(textarea);
		let iframe = $.create("iframe", {
			name: "iframe" + slide.getAttribute("data-index"),
			after: editor.wrapper
		});

		let update = () => {
			iframe.src = "demo.html?" + Date.now();
		};

		textarea.addEventListener("keydown", Mavo.rr(evt => {
			if (!evt || evt.keyCode == 13 && (evt.metaKey || evt.ctrlKey)) {
				update();
				evt && evt.preventDefault();
			}
		}));

		iframe.addEventListener("DOMFrameContentLoaded", evt => {
			var iDoc = iframe.contentDocument;
			iDoc.body.innerHTML = textarea.value;
			var mavoRoot = $("[mv-app], [mv-storage]", iDoc.documentElement) || iDoc.body;

			iDoc.body.id = slide.id;

			if (!slide.classList.contains("nofixup")) {
				if (!mavoRoot.hasAttribute("mv-app")) {
					mavoRoot.setAttribute("mv-app", slide.id + "Example")
				}
			}
		});

		slide.classList.add("initialized");
	}
});
