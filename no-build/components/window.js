/* Render text in an SVG and return a data URL of the resulting image. */
export function textToSvg (text, style = "font: 550 40px system-ui") {
	// Estimate text width liberally (longer is better than shorter)
	let width = text.length * 40;
	const svg = new Blob([`
		<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="50">
			<text x="0" y="40" style="${style}">${text}</text>
		</svg>
	`], { type: "image/svg+xml" });
	return URL.createObjectURL(svg);
}

for (let el of document.querySelectorAll(".browser[data-url], .browser[src]")) {
	let url = el.dataset.url || prettifyUrl(el.src);

	if (url) {
		el.style.setProperty("--img-url", `url(${textToSvg(url)})`);
	}
}
