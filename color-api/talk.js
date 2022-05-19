import Notebook, {$, $$} from "../../color.js/notebook/color-notebook.js";

for (let pre of $$(".cn-render")) {
	Notebook.create(pre);
}

for (let slide of $$(".vs.slide")) {
	let pres = $$("pre", slide);

	let div = $.create({
		className: "container",
		before: pres[0]
	});

	div.append(...pres);

	pres.pop(); // drop last

	for (let pre of pres) {
		let vs = $.create({
			className: "vs-label",
			textContent: "vs",
			after: pre
		});
	}
}
