var $ = Bliss, $$ = $.$;

{
	let forceResolution;

	if (forceResolution = $("[data-force-resolution]")) {
		let [width, height] = forceResolution.getAttribute("data-force-resolution").split(/\s+/);

		let adjustResolution = $.create("article", {
			className: "slide",
			id: "adjust-resolution",
			contents: {
				tag: "h1",
				textContent: `${width} × ${height}`
			},
			start: document.body
		});

		adjustResolution.style.setProperty("--vw", width);
		adjustResolution.style.setProperty("--vh", height);

		//let [wratio, hratio] = [innerWidth / width, innerHeight / height];

		//document.documentElement.style.zoom = Math.min(wratio, hratio) * 100 + "%";
	}
}

Prism.languages.mavoscript = Prism.languages.extend('clike', {
	keyword: RegExp(Prism.languages.clike.keyword.source.replace("(?:", "(?:where|"))
});

Prism.languages.mavoscript.function = {
	pattern: Prism.languages.mavoscript.function,
	inside: {
		"action-set": /set/,
		"action-move": /move/,
		"action-delete": /delete|clear/,
		"action-add": /add/,
		"fn-group": /group/
	}
};

for (var i=1; i<=4; i++) {
	CSS.registerProperty({
		name: `--value${i}`,
		syntax: "<percentage>",
		inherits: false,
		initialValue: "0%"
	});
}

CSS.registerProperty({
	name: `--length`,
	syntax: "<length>",
	inherits: true,
	initialValue: "0"
});

$("#correctness button").onclick = evt => {
	var slide = evt.target.closest(".slide");
	var barChart = $(".vertical-bar-chart", slide);
	var percentSorted = barChart.classList.contains("percent-sort");
	barChart.classList.toggle("percent-sort", !percentSorted);
	evt.target.textContent = "Sorted by " + (percentSorted? "order" : "correctness")
};

$$("#correctness .vertical-bar-chart > div").forEach((div, i) => {
	var tr = $(`#questions table`).rows[i + 1];

	$.create({
		className: "info",
		contents: [
			{tag: "span", textContent: tr.cells[0].textContent},
			$("code", tr).cloneNode(true)
		],
		inside: div
	});
});

$$(".vertical-bar-chart > div").forEach(div => {
	div.style.setProperty("--order", -1 * Math.round(div.style.getPropertyValue("--p") * 10000));
})
