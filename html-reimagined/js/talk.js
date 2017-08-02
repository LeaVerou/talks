var $ = Bliss, $$ = $.$;

document.addEventListener("DOMContentLoaded", evt => {
	// Stuff to run after slideshow has been created
	$$(".example.slide").forEach((slide, i) => {

	});
});

// Make list items fall from the top one by one
for (let [i, li] of $$("#the-problem li:not(.special)").reverse().entries()) {
	li.style.transitionDelay = i * .5 + "s";
}

$.events(document, "slidechange", evt => {
	var slide = evt.target;

	// Create the videos for slides with a data-video attribute
	if (slide.matches(".slide[data-video]")) {
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
		slide.removeAttribute("data-video");
	}
	else if (slide.matches(".example:not(.initialized)")) {
		let textarea = $("textarea", slide);
		let editor = new Prism.Live(textarea);
		let iframe = $.create("iframe", {
			name: "iframe" + slide.getAttribute("data-index"),
			after: editor.wrapper
		});

		let update = () => {
			iframe.src = "demo.html?" + Date.now();
			//console.log("update", iframe.name);
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

	$$(".slide:not(:target) video").forEach(video => {
		if (!video.paused) {
			video.pause();
		}
	});

	if (slide) {
		$$("video", slide).forEach(video => {
			video.loop = true;
			video.currentTime = 0;
			video.play();
		});
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
