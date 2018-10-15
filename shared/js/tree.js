(async () => {

await Inspire.importsLoaded;

// Create trees from nested <ul>s
$$("ul.tree").forEach(ul => {
	var slide = ul.closest(".slide");

	// Wrap each text node with a span
	$$("li", ul).forEach(li => {
		var node = li.childNodes[0];

		if (node && (!node.matches || !node.matches(".node"))) {
			if (node.matches && node.matches("a")) {
				a.classList.add("node");
			}
			else {
				var a = $.create("a", {
					className: "node",
					target: "_blank",
					around: node
				});

				if (!ul.matches(".no-link, .no-link ul")) {
					var base = ul.dataset.base || "https://developer.mozilla.org/en-US/docs/Web/CSS/";
					a.href = base + node.textContent.trim();
				}
			}
		}
	});

	slide.addEventListener("slidechange", evt => {
		$$("ul.tree li li > .node", slide).forEach(span => {
			requestAnimationFrame(() => {
				var li = span.closest("ul").parentNode;
				var lineCS = getComputedStyle(span, "::before");

				var top = span.parentNode.offsetTop + span.parentNode.offsetHeight / 2;
				var parentTop = li.offsetHeight / 2;
				var dy = top - parentTop;
				var dx = parseInt(lineCS.width);

				var angle = Math.atan2(dy, dx);
				var θ = angle * 180 / Math.PI;
				span.style.setProperty("--angle", θ);
				span.style.setProperty("--cos-angle", Math.abs(Math.cos(angle)));
			});
		});
	});
});

})();
