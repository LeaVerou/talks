for (let li of document.querySelectorAll("ul.file-tree li")) {
	let content = li.firstChild.textContent.trim();

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
