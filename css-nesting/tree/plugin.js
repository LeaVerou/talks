// Create trees from nested <ul>s

export const hasCSS = true;

await Inspire.importsLoaded;

function renderTrees(element = document) {
	// Create trees from nested <ul>s
	let trees = element.querySelectorAll("ul:is(.tree, .tree-children > *):not(.initialized)");
	for (let ul of trees) {
		ul.classList.add("tree", "initialized");

		// Wrap each text node with a span
		let domChanged = false;
		for (let li of ul.querySelectorAll("li")) {
			let node = li.childNodes[0];

			if (li.matches(".progressive-subtree *")) {
				li.classList.add("delayed");
			}

			if (node?.matches?.(":has(+ ul:last-child), :last-child")) {
				node.classList.add("node");
			}
			else {
				let newNode = document.createElement("span");
				newNode.className = "node generated";
				li.insertAdjacentElement("afterbegin", newNode);
				newNode.append(node);
				domChanged = true;
			}
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