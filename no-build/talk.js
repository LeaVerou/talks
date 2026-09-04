import "./prism.js";
import Inspire from "inspirejs.org";

/* Load code samples from external files: <pre data-src="foo.css"> */
// for (let pre of document.querySelectorAll("pre[data-src]")) {
// 	let src = pre.dataset.src;
// 	fetch(src).then(r => r.text()).then(text => {
// 		pre.innerHTML = `<code>${text}</code>`;
// 		Prism.highlightElement(pre);
// 	});
// }
await Inspire.importsLoaded;
await Inspire.plugins.loaded.markdown.loaded;
console.log(document.querySelectorAll("ul.file-tree li"));
for (let li of document.querySelectorAll("ul.file-tree li")) {

	let content = li.firstChild.textContent.trim();
	console.log(content);
	if (content.endsWith("/")) {
		li.classList.add("folder");
	}
	else if (content.startsWith(".")) {
		li.classList.add("hidden");
	}
	else {
		let ext = content.match(/\.(\w+)$/);
		if (ext) {
			li.classList.add(ext[1]);
		}
	}
}
