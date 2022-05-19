var $ = Bliss, $$ = $.$;

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

($("#correctness button") || {}).onclick = evt => {
	var slide = evt.target.closest(".slide");
	var barChart = $(".vertical-bar-chart", slide);
	var percentSorted = barChart.classList.contains("percent-sort");
	barChart.classList.toggle("percent-sort", !percentSorted);
	evt.target.textContent = "Sorted by " + (percentSorted? "order" : "correctness");
};

$$("#correctness .vertical-bar-chart > div").forEach((div, i) => {
	var tr = $("#questions table").rows[i + 1];

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
});

var rowIncrement;
document.addEventListener("slidechange", evt => {
	var slide = evt.target;
	if (slide.id === "click-to") {
		var ul = $("ul", slide);
		var i, lis = $$("li", ul);
		var rows = lis.length;

		ul.style.setProperty("--rows", rows);

		lis.forEach(li => li.classList.remove("active"));

		var reset = () => {
			i = 0;
			ul.style.transition = "0s";
			setTimeout(() => {
				ul.style.setProperty("--n", 0);
				ul.style.transition = "";
			}, 50);
		};

		reset();

		(function callee () {
			if (i > rows) {
				var last = true;
				reset();
			}

			lis[i - 1] && lis[i - 1].classList.remove("active");
			lis[rows - 1] && lis[rows - 1].classList.remove("active");
			(lis[i] || lis[0]).classList.add("active");
			ul.style.setProperty("--n", i++);

			rowIncrement = setTimeout(callee, last? 100 : 800);
		})();
	}
	else if (evt.prevSlide && evt.prevSlide.id === "click-to") {
		clearInterval(rowIncrement);
	}
});
