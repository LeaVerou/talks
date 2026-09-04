import "./prism.js";
import Inspire from "inspirejs.org";

/* Load code samples from external files: <pre data-src="foo.css"> */
for (let pre of document.querySelectorAll("pre[data-src]")) {
	let src = pre.dataset.src;
	fetch(src).then(r => r.text()).then(text => {
		pre.innerHTML = `<code>${text}</code>`;
		Prism.highlightElement(pre);
	});
}
