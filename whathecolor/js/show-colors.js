import Inspire from "inspirejs.org";

let dummy = document.createElement("div");

function processCodeBlock (el) {
	let code = el.textContent.trim();
	dummy.style.cssText = code;

	for (let prop of el.querySelectorAll(".token.property")) {

		let name = prop.textContent.trim();
		let value = getComputedStyle(dummy).getPropertyValue(name);

		if (CSS.supports("color", value)) {
			prop.style.setProperty("--computed-color", value);
			prop.classList.add("has-color");
		}
		else {
			prop.style.removeProperty("--computed-color");
			prop.classList.remove("has-color");
		}
	}

}

Inspire.hooks.add("slidechange", ({ slide }) => {
	slide.appendChild(dummy);
	for (let el of slide.querySelectorAll(".show-colors")) {
		processCodeBlock(el);

		el.addEventListener("input", () => {
			processCodeBlock(el);
		});
	}
})
