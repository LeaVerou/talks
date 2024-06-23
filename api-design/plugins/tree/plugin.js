// Create trees from nested <ul>s

export const hasCSS = true;

let { $$, create, inView } = Inspire.util;

// Create trees from nested <ul>s
$$("ul.tree").forEach(ul => {
	let slide = ul.closest(".slide");

	// Wrap each text node with a span
	$$("li", ul).forEach(li => {
		let node = li.childNodes[0];

		if (node && (!node.matches || !node.matches(".node"))) {
			if (node.matches?.("a")) {
				node.classList.add("node");
			}
			else {
				let a = create.around(node, `<a class=node target="_blank"></a>`);
				let content = node.textContent.trim();

				if (!a.closest(".no-link")) {
					if (ul.classList.contains("element")) {
						let base = "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/";
						node.textContent = `<${content}>`
					}
					else {
						let base = ul.dataset.base || "https://developer.mozilla.org/en-US/docs/Web/CSS/";
					}

					a.href = base + content;
				}
			}
		}
	});

	render(ul);
});

async function render (tree) {
	await inView(tree);

	for (let span of $$("li li > .node", tree)) {
		let li = span.closest("ul").parentNode;
		let lineCS = getComputedStyle(span, "::before");

		let top = span.parentNode.offsetTop + span.parentNode.offsetHeight / 2;
		let parentTop = li.offsetHeight / 2;
		let dy = top - parentTop;
		let dx = parseInt(lineCS.width);

		let angle = Math.atan2(dy, dx);
		let θ = angle * 180 / Math.PI;
		span.style.setProperty("--angle", θ);
		span.style.setProperty("--cos-angle", Math.abs(Math.cos(angle)));
	}
}
