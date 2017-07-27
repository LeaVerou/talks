var $ = Bliss, $$ = $.$;

document.addEventListener("DOMContentLoaded", evt => {
	// Stuff to run after slideshow has been created

	$$(".example.slide").forEach((slide, i) => {
		var code = $("pre > code", slide);

		$.create("div", {
			around: code.parentNode
		});

		var container = $.create({
			className: "example-container",
			innerHTML: code.textContent,
			after: code.parentNode
		});

		var data = $("script[type='application/json']", slide);
		var useStorage = true;

		if (!data) {
			useStorage = false;
			data =  $.create("script", {
	   			type: "application/json"
			});
   		}

		data.id = data.id || "data-" + slide.id;

		var mavoRoot = $("[mv-storage]", container) || container;

		if (slide.classList.contains("visible-storage")) {
			useStorage = true;
			mavoRoot.classList.add("mv-debug-saving");
		}

		mavoRoot.setAttribute("mv-storage", useStorage? "#" + data.id : "none");
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
