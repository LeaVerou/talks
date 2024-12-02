// Create trees from nested <ul>s

export const hasCSS = true;

await Inspire.importsLoaded;

let { $$ } = Inspire.util;

function renderTrees(element = document) {
	// Create trees from nested <ul>s
	let trees = element.querySelectorAll("ul:is(.tree, .tree-children > *):not(.initialized)");
	for (let ul of trees) {
		ul.classList.add("tree", "initialized");

		// Wrap each text node with a span
		let domChanged = false;
		for (let li of ul.querySelectorAll("li")) {
			li.normalize();
			let nodes = [...li.childNodes];

			// Drop <ul> and anything after it
			let ulIndex = nodes.findIndex(e => e.matches?.("ul"));
			if (ulIndex > -1) {
				nodes = nodes.slice(0, ulIndex);
			}

			// Drop preceding whitespace, if any
			let first = nodes[0];
			if (first && first.nodeType === Node.TEXT_NODE && first.textContent.trim() === "") {
				nodes.shift();
			}

			// Drop trailing whitespace, if any
			let last = nodes[nodes.length - 1];
			if (last && last.nodeType === Node.TEXT_NODE && last.textContent.trim() === "") {
				nodes.pop();
			}

			if (nodes.length === 1 && nodes[0].nodeType === Node.ELEMENT_NODE) {
				// We have a node element, just add a class
				nodes[0].classList.add("node");
			}
			else {
				// We have either text nodes or multiple elements, wrap with container
				let node = document.createElement("span");
				node.className = "node generated";
				node.append(...nodes);
				li.prepend(node);
				domChanged = true;
			}

			if (li.matches(".progressive-subtree *")) {
				li.classList.add("delayed");
			}

			li.insertAdjacentHTML("afterbegin", `<span class="line"></span>`);
		}

		if (domChanged) {
			Inspire.domchanged(ul);
		}
	}
}

document.addEventListener("slidechange", evt => {
	requestAnimationFrame(() => {
		$$("ul.tree li, ul.tree", evt.target).forEach(li => {
			let rect = li.getBoundingClientRect();
			for (let prop of [
				"top", "left", "right", "bottom",
				"width", "height"
			]) {
				li.style.setProperty("--" + prop, Math.round(rect[prop]) + "px");
			}
		});
	});
});

document.addEventListener("inspire-domchanged", evt => renderTrees(evt.target));
renderTrees()