import "./prism.js";
import Inspire from "inspirejs.org";
import "color-elements";
import Color from "colorjs.io";
import "./mba2013.js";

globalThis.Color = Color;

const repos = {
	"apps.colorjs.io": "color-js/apps",
	"palettes.colorjs.io": "color-js/apps",
	"elements.colorjs.io": "color-js/elements",
}

// for (let iframe of document.querySelectorAll("iframe")) {
// 	iframe.addEventListener("error", e => {
// 		console.log(e);
// 	});
// }

for (let pre of document.querySelectorAll("pre[data-src]")) {
	let src = pre.dataset.src;
	fetch(src).then(r => r.text()).then(text => {
		if (pre.dataset.remove) {
			const remove = pre.dataset.remove.split(",");
			for (let str of remove) {
				text = text.replaceAll(str, "");
			}
		}

		pre.innerHTML = `<code>${text}</code>`;
		Prism.highlightElement(pre);
	})
}

/* Render text in an SVG and return a data URL of the resulting image. */
export function textToSvg (text, style = "font: 600 40px system-ui") {
	// Estimate text width liberally (longer is better than shorter)
	let width = text.length * 40;
	const svg = new Blob([`
		<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="50">
			<text x="0" y="40" style="${style}">${text}</text>
		</svg>
	`], { type: "image/svg+xml" });
	return URL.createObjectURL(svg);
}

export function prettifyUrl (url) {
	if (!url) {
		return url;
	}

	url = new URL(url);
	url.username = url.password = "";
	url.hash = "";
	url.search = "";

	return url.href.replace(/\/$/, "").replace(/^https?:\/\//, "");
}

for (let el of document.querySelectorAll(".browser[data-url], .browser[src]")) {
	let url = el.dataset.url || prettifyUrl(el.src);

	if (url) {
		el.style.setProperty("--img-url", `url(${textToSvg(url)})`);
	}
}

Inspire.plugins.register({
	vue: {
		test: "[v-app]",
		base: new URL("./plugins/", import.meta.url),
	},
});

import "./js/show-colors.js";

for (let scale of document.querySelectorAll("color-scale.show-distances")) {
	let prevColor;
	let distancesEl = scale.querySelector(".distances");
	if (!distancesEl) {
		distancesEl = Object.assign(
				document.createElement("div"),
				{ className: "distances" }
			);
		scale.appendChild(distancesEl);
	}
	let colors = Object.values(scale.colors);
	scale.style.setProperty("--num-colors", colors.length);

	for (let i = 1; i < colors.length; i++) {
		let prevColor = colors[i - 1];
		let color = colors[i];
		let distance = prevColor.distance(color, color.space);
		let deltaE = color.deltaE(prevColor, "2000");
		let distanceEl = document.createElement("div");
		distanceEl.className = "distance";
		distanceEl.classList.toggle("dark", color.oklch.l < .7);
		distanceEl.innerHTML = `<div>
			<span class="coords-d">${distance.toLocaleString("en", { maximumFractionDigits: 2 })}</span>
			<span class="deltae">${deltaE.toLocaleString("en", { maximumFractionDigits: 2 })}</span>
		</div>`;

		distancesEl.appendChild(distanceEl);
		prevColor = color;
	}
}
