var $ = Bliss, $$ = $.$;


document.addEventListener("DOMContentLoaded", function(evt) {
	// Stuff to run after slideshow has been created
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
