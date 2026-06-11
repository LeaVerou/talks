import Inspire from "inspirejs.org";

let dummyEl = document.createElement("div");
document.body.appendChild(dummyEl);

const types = {
	color: {
		property: "color"
	},
	image: {
		property: "background-image"
	}
}

function processCodeBlock (el, slide, type = "color") {
	let code = el.textContent.trim();
	let dummy = el.dataset.el ? slide.matches(el.dataset.el) ? slide : slide.querySelector(el.dataset.el) : dummyEl;
	dummy ??= dummyEl;
	if (dummy === dummyEl) {
		slide.appendChild(dummy);
	}
	dummy.style.cssText = code;

	for (let prop of el.querySelectorAll(".token.property")) {

		let name = prop.textContent.trim();
		let value = getComputedStyle(dummy).getPropertyValue(name);
		let matches = CSS.supports(types[type].property, value);
		prop.classList.toggle("has-" + type, matches);

		if (matches) {
			prop.style.setProperty("--computed-" + type, value);

		}
		else {
			prop.style.removeProperty("--computed-" + type);
		}
	}

}

Inspire.hooks.add("slidechange", ({ slide, firstTime }) => {
	if (!firstTime) {
		return;
	}

	for (let type in types) {
		let els = slide.querySelectorAll(`.show-${type}s`);
		if (els.length > 0) {
			slide.appendChild(dummyEl);
		}

		for (let el of slide.querySelectorAll(`.show-${type}s`)) {
			processCodeBlock(el, slide, type);

			el.addEventListener("input", () => {
				processCodeBlock(el, slide, type);
			});
		}
	}

});
