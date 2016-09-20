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

		var data = $("script[type='application/json']", slide) || $.create("script", {
			type: "application/json",
		});

		data.id = data.id || "data-" + slide.id;

		var mavoRoot = $("[data-store]", container) || container;

		if (slide.classList.contains("visible-storage")) {
			mavoRoot.classList.add("debug-saving");
		}

		mavoRoot.setAttribute("data-store", "#" + data.id);
	});
});

// Make list items fall from the top one by one
for (let [i, li] of $$("#the-problem li:not(.special)").reverse().entries()) {
	li.style.transitionDelay = i * .5 + "s";
}

// Create the videos for slides with a data-video attribute
for (let slide of $$(".slide[data-video]")) {
	$.create("video", {
		src: slide.getAttribute("data-video"),
		loop: slide.classList.contains("looping"),
		inside: slide
	});

	slide.classList.add("video");
}

$.events(document, "slidechange", evt => {
	var slide = evt.target;

	if (slide) {
		$$("video", slide).forEach(video => video.play());
	}
});
