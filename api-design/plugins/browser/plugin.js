export const hasCSS = true;

export const url_styles = {
	"font": "1em system-ui, sans-serif"
};

// Set background image that displays URL of a .browser window
let urlStyles = Object.entries(url_styles).map(([property, value]) => `${ property }: ${ value };`).join(" ");

for (let element of document.querySelectorAll(".browser")) {
	let url = element.dataset.url ?? element.dataset.src ?? element.href;

	if (!url) {
		continue;
	}

	element.style.setProperty("--url-image", `url('data:image/svg+xml,
		<svg xmlns="http://www.w3.org/2000/svg">
			<text style="${ urlStyles }" x=".1em" y="1.5em" >${ encodeURIComponent(url) }</text>
		</svg>')`.replace(/\r?\n|\t/g, ""));
}

