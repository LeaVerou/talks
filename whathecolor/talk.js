import "./prism.js";
import Inspire from "inspirejs.org";
import "color-elements";

/* Render text in an SVG and return a data URL of the resulting image. */
export function textToSvg (text) {
	// Estimate text width liberally (longer is better than shorter)
	let width = text.length * 40;
	const svg = new Blob([`
		<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="50">
			<text x="0" y="40" font-size="40">${text}</text>
		</svg>
	`], { type: "image/svg+xml" });
	return URL.createObjectURL(svg);
}

Inspire.plugins.register({
	vue: {
		test: "[v-app]",
		base: new URL("./plugins/", import.meta.url),
	},
});

