export const hasCSS = true;

let observeClass = new MutationObserver(records => {
	for (let r of records) {
		let span = r.target;

		if (!span.classList.contains("current")) {
			continue;
		}

		updateDimensions(span);
	}
});

function updateDimensions (span) {
	let box = span.getBoundingClientRect();

	span.style.setProperty("--left", box.left + "px");
	span.style.setProperty("--top", box.top + "px");
	// span.style.setProperty("--right", box.right + "px");
	span.style.setProperty("--bottom", box.bottom + "px");
	span.style.setProperty("--width", box.width + "px");
	// span.style.setProperty("--height", box.height + "px");
}

let observeClassSettings = {
	attributes: true,
	subtree: true,
	attributeFilter: ["class"]
};

for (let code of document.querySelectorAll(".syntax-breakdown")) {
	if (!code.querySelector("span[title], .tooltip")) {
		continue;
	}

	code.innerHTML = Prism.plugins.NormalizeWhitespace.normalize(code.innerHTML);

	let text = code.textContent;
	let lastSpan = null;
	let lastLine = 0;

	for (let span of code.querySelectorAll("span[title], span:has(>.tooltip)")) {
		// Careful: anything you do here with actual references (events, mutations etc) will be lost
		// Prism recreates these elements when it highlights
		span.classList.add("delayed");

		if (text.indexOf(span.textContent) > text.length/2) {
			// FIXME will break when there are duplicates
			span.classList.add("after-middle");
		}
		updateDimensions(span);

		if (!span.matches(".no-trim, .no-trim *")) {
			// Trim whitespace before and after <span>
			if (!span.matches(".no-trim-start, .no-trim-start *")) {
				let before = span.previousSibling;

				if (before?.nodeType === Node.TEXT_NODE && /\r?\n\s*$/.test(before.textContent)) {
					before.textContent = before.textContent.trimEnd();
				}
			}

			if (!span.matches(".no-trim-end, .no-trim-end *")) {
				let after = span.nextSibling;

				if (after?.nodeType === Node.TEXT_NODE && /^\r?\n\s*/.test(after.textContent)) {
					after.textContent = after.textContent.trimStart();
				}
			}
		}

		// Find line number of span
		let sibling = span;
		let line = lastLine;
		while ((sibling = sibling.previousSibling) && sibling !== lastSpan) {
			if (sibling.matches?.(".tooltip")) {
				continue;
			}
			let lines = sibling.textContent.split(/\r?\n/);
			line += lines.length - 1;
		}
		lastLine = line;
		lastSpan = span;
		span.style.setProperty("--line", line);

		observeClass.observe(span, observeClassSettings);
	}
}

Prism.hooks.add("after-highlight", env => {
	if (env.element.closest(".syntax-breakdown")) {
		for (let span of env.element.querySelectorAll("span[title]")) {
			observeClass.observe(span, observeClassSettings);
		}
	}
});

