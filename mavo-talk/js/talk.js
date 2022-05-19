
import Inspire from "https://inspirejs.org/inspire.mjs";
import Incrementable from "https://incrementable.verou.me/incrementable.js";

window.Incrementable = Incrementable;
window.Inspire = Inspire;

var $ = Bliss, $$ = $.$;


if (CSS.registerProperty) {
	CSS.registerProperty({
		name: "--x",
		syntax: "<number>",
		initialValue: "0",
		inherits: true
	});
}

document.addEventListener("DOMContentLoaded", evt => {
	// Stuff to run after slideshow has been created

	$$(".example.slide").forEach(async (slide, i) => {
		var code = $("pre > code", slide);

		$.create("div", {
			around: code.parentNode
		});

		var container = $.create({
			className: "example-container",
			innerHTML: code.textContent,
			after: code.parentNode
		});

		let dataId = "data-" + slide.id;
		var data = $(`#${dataId}, script[type='application/json']`, slide);
		var useStorage = true;

		if (!data) {
			useStorage = false;
			data =  $.create("script", {
	   			type: "application/json"
			});
   		}

		data.id = data.id || dataId;

		var mavoRoot = $("[mv-app], [mv-storage]", container) || container;

		if (slide.classList.contains("visible-storage")) {
			useStorage = true;
			mavoRoot.classList.add("mv-debug-saving");

			if (!data.isConnected) {
				($("details.notes", slide) || slide).appendChild(data);
			}
		}

		mavoRoot.setAttribute("mv-storage", useStorage? "#" + data.id : mavoRoot.getAttribute("mv-storage") || "none");

		if (self.Mavo && Mavo.setAttributeShy) {
			Mavo.setAttributeShy(mavoRoot, "mv-app", "");

			await Mavo.ready;
			new Mavo(mavoRoot);
		}
	});
});

// Make list items fall from the top one by one
for (let [i, li] of $$("#the-problem li:not(.special)").reverse().entries()) {
	li.style.transitionDelay = i * .5 + "s";
}

// Create the videos for slides with a data-video attribute
if (!window.Inspire) {
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
}

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
