var $ = Bliss, $$ = Bliss.$;

// Specific slide demos

document.addEventListener("slidechange", evt => {
	var slideId = evt.target.id;

	var mousemove = evt => {
		document.documentElement.style.setProperty("--mouse-x", evt.clientX / innerWidth);
		document.documentElement.style.setProperty("--mouse-y", evt.clientY / innerHeight);
	}

	if (slideId == "mouse") {
		document.addEventListener("mousemove", mousemove);
	}
	else {
		document.removeEventListener("mousemove", mousemove);
	}
});

Inspire.hooks.add("slidechange", env => {
	if (Inspire.currentSlide.id === "slider") {
		setTimeout(() => {
			for (input of document.querySelectorAll("input")) {
				input.style.setProperty("--value", input.value);
			}

			document.addEventListener("input", evt => {
				if (evt.target.matches(":target input")) {
					evt.target.style.setProperty("--value", evt.target.value);
				}
			});
		}, 500);
	}
});

var setLength = element => {
	element.style.setProperty("--length", element.textContent.length)
};

for (let element of document.querySelectorAll("p.typing")) {
	setLength(element);

	var observer = new MutationObserver(r => setLength(element));
	observer.observe(element, {
		characterData: true,
		childList: true,
		subtree: true
	});
}

$$(".takeaway.slide").forEach((slide, i) => slide.style.setProperty("--takeaway", i+1));

Inspire.hooks.add("slidechange", env => {
	if (Inspire.currentSlide.id === "scrolling" && env.firstTime) {
		Inspire.currentSlide.addEventListener("scroll", evt => {
			var el = evt.target;
			let maxScroll = el.scrollHeight - el.offsetHeight;
			let scroll = el.scrollTop / maxScroll;
			el.style.setProperty("--scroll", scroll);
		}, true);
	}
});
