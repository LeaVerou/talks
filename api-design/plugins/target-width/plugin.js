export const hasCSS = true;
export const SELECTOR = "[class*='target-width'], [style*='--target-width']";

export const observer = new MutationObserver(records => {
	for (let r of records) {
		let element = r.target.nodeType === Node.TEXT_NODE ? r.target.parentElement : r.target;
		updateMaxLineLength(element);
	}
});

for (let element of document.querySelectorAll(SELECTOR)) {
	element.innerHTML = Prism.plugins.NormalizeWhitespace.normalize(element.innerHTML);

	let text = element.textContent;
	let lines = text.split("\n");
	let maxLineLength = Math.max(...lines.map(l => l.length));
	element.style.setProperty("--max-line-chars", maxLineLength);
	observer.observe(element, { subtree: true, characterData: true });
}

export function updateMaxLineLength (element) {
	let text = element.textContent;
	let lines = text.split("\n");
	let maxLineLength = Math.max(...lines.map(l => l.length));
	element.style.setProperty("--max-line-chars", maxLineLength);
	return maxLineLength;
}