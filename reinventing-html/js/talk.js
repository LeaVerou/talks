var $ = Bliss, $$ = $.$;

document.addEventListener("DOMContentLoaded", evt => {
	// Stuff to run after slideshow has been created


	$$(".example.slide").forEach((slide, i) => {
		var textarea = $("textarea", slide);
		if (!textarea) {
			return;
		}
		var editor = new Prism.Live(textarea);
		var iframe = $.create("iframe", {
			after: editor.wrapper
		});
		var update = () => {
			iframe.srcdoc = `<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="https://get.mavo.io/mavo.css">
	<link rel="stylesheet" href="examples.css">
	<script src="https://get.mavo.io/mavo.js"></script>
</head>
<body>${textarea.value}</body>
</html>`;
		};

		textarea.addEventListener("keydown", Mavo.rr(evt => {
			if (!evt || evt.keyCode == 13 && (evt.metaKey || evt.ctrlKey)) {
				update();
				evt && evt.preventDefault();
			}
		}));

		var data = $("script[type='application/json']", slide);

		iframe.onload = evt => {
			var iDoc = iframe.contentDocument;
			var mavoRoot = $("[mv-app], [mv-storage]", iDoc.documentElement) || iDoc.body;

			iDoc.body.id = slide.id;

			if (!mavoRoot.hasAttribute("mv-app")) {
				mavoRoot.setAttribute("mv-app", slide.id + "Example")
			}

			if (!mavoRoot.hasAttribute("mv-storage") && data) {
				mavoRoot.setAttribute("mv-storage", "#" + data.id);
			}
		};
	});
});

// Make list items fall from the top one by one
for (let [i, li] of $$("#the-problem li:not(.special)").reverse().entries()) {
	li.style.transitionDelay = i * .5 + "s";
}

// Create the videos for slides with a data-video attribute
for (let slide of $$(".slide[data-video]")) {
	let container = slide.classList.contains("cover")? slide : $.create("div", {
		className: "browser",
		inside: slide
	});

	$.create("video", {
		src: slide.getAttribute("data-video"),
		loop: slide.classList.contains("looping"),
		inside: container
	});

	slide.classList.add("video");
}

$.events(document, "slidechange", evt => {
	var slide = evt.target;

	if (slide) {
		$$("video", slide).forEach(video => video.play());
	}
});

{
	let forceResolution;

	if (forceResolution = $("[data-force-resolution]")) {
		let [width, height] = forceResolution.getAttribute("data-force-resolution").split(/\s+/);

		let adjustResolution = $.create("article", {
			className: "slide",
			id: "adjust-resolution",
			contents: {
				tag: "h1",
				textContent: `${width} × ${height}`
			},
			start: document.body
		});

		adjustResolution.style.setProperty("--vw", width);
		adjustResolution.style.setProperty("--vh", height);

		//let [wratio, hratio] = [innerWidth / width, innerHeight / height];

		//document.documentElement.style.zoom = Math.min(wratio, hratio) * 100 + "%";
	}
}

if (CSS.registerProperty) {
	CSS.registerProperty({
		name: "--x",
		syntax: "<number>",
		initialValue: "0",
		inherits: true
	});
}
