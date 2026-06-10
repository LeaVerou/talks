import Inspire from "inspirejs.org";
import { createApp } from "vue";

function getValue (element) {
	if (element.matches("input[type=range], input[type=number")) {
		return element.valueAsNumber;
	}

	return element.value ?? element.textContent;
}

function initVueApp (container) {
	let appInit = container.app;
	let entries = [...container.querySelectorAll("[v-model]")].map(e => [
				e.getAttribute("v-model"),
				getValue(e),
			]);
	let data = {
		...Object.fromEntries(entries),
		...(appInit?.data),
	};

	container.app = createApp({
		data () {
			return data;
		},
		...appInit,
	}).mount(container);
	container.removeAttribute("v-app");
}

Inspire.hooks.add("slidechange", ({ slide }) => {
	if (slide.matches("[v-app]")) {
		initVueApp(slide);
	}

	for (let app of slide.querySelectorAll("[v-app]")) {
		initVueApp(app);
	}
})
