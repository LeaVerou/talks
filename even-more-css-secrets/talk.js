var $ = Bliss, $$ = Bliss.$;

Prism.languages.insertBefore("css", "property", {
	"variable": /\-\-(\b|\B)[\w-]+(?=\s*[:,)]|\s*$)/i
});

$$(".takeaway.slide").forEach((slide, i) => slide.style.setProperty("--takeaway", i+1));

// Blending mode testing slide
(function(slide){

if (!slide) {
	return;
}

var elements = $("form", slide).elements;
var foreground = $(".foreground", slide);
var background = $(".background", slide);
var math = $(".math", slide);
$$("input", slide).forEach(input => new Incrementable(input));

function applyColorIfValid(element, color, property = "background") {
	var isValid = CSS.supports(`background: ${color}`);

	if (isValid) {
		element.style.setProperty(property, color);
	}

	return isValid;
}

function rgba(color) {
	return color.match(/[\d.]+/g).slice(0, 3).map(v => Math.round(v * 100 / 255));
}

function luminance(rgb) {
	return rgb[0]   * 0.2126  // red
		 + rgb[1] * 0.7152  // green
		 + rgb[2] * 0.0722; // blue
}

$("button.swap", slide).addEventListener("click", evt => {
	[elements.foregroundColor.value, elements.backgroundColor.value] = [elements.backgroundColor.value, elements.foregroundColor.value];
	slide.dispatchEvent(new InputEvent("input"));
});

slide.addEventListener("input", function(evt) {

	var blendingMode = elements.blendingMode.value;

	var fValid = applyColorIfValid(foreground, elements.foregroundColor.value);
	var bValid = applyColorIfValid(background, elements.backgroundColor.value);
	foreground.style.setProperty("mix-blend-mode", blendingMode);

	if (!fValid || !bValid) {
		return;
	}

	var rgbaF = rgba(getComputedStyle(foreground).backgroundColor);
	var rgbaB = rgba(getComputedStyle(background).backgroundColor);

	this.classList.toggle("light-foreground", luminance(rgbaF) > 60);
	this.classList.toggle("light-background", luminance(rgbaB) > 60);

	if (blendingMode == "normal") {
		math.innerHTML = "";
	}
	else {
		var result = rgbaF; // normal

		if (blendingMode == "multiply") {
			var result = rgbaF.map((fc, i) => Math.round(rgbaB[i] * fc / 100));
			var calc = rgbaF.map((fc, i) => {
				return `<td><span class="num">${rgbaB[i]}%</span> &times; <span class="num">${fc}%</span></td>
				<td class="eq">=</td>
				<td class="num result">${result[i]}%</td>`;
			});
		}
		else if (blendingMode == "screen") {
			var result = rgbaF.map((fc, i) => Math.round(100 - (100 - rgbaB[i]) * (100 - fc) / 100));
			var calc = rgbaF.map((fc, i) => {
				return `<td>100% - [(100% - <span class="num">${rgbaB[i]}%</span>) &times; (100% - <span class="num">${fc}%</span>)]</td>
				<td class="eq">=</td>
				<td class="num result">${result[i]}%</td>`;
			});
		}

		this.classList.toggle("light-result", luminance(result) > 60);

		math.innerHTML = calc.map(c => `<tr>${c}</tr>`).join("\n");
	}
});

slide.dispatchEvent(new InputEvent("input"));
})($("#blending-modes"));

var throttleSubmit;
$.ready().then(() => {
	$.bind($('form[target="wolfram"]'), {
		input: evt => {
			clearTimeout(throttleSubmit);

			if (document.readyState === "complete") {
				throttleSubmit = setTimeout(() => {
					evt.target.form.submit();
				}, 1000);
			}
		}
	});
});


$$(".separate-letters").forEach(element => {
	element.innerHTML = element.innerHTML.split("").map((letter, i) => `<span data-letter="${letter}" style="--index: ${i}">${letter}</span>`).join("");
});

$$("#accessible-menus + .demo.slide").forEach(slide => {
	slide.addEventListener("click", evt => {
		if (evt.target.matches("a")) {
			evt.preventDefault();
			evt.target.focus();
		}
	});
});

$$(".runnable.slide pre>code, .runnable.slide textarea").forEach(element => {
	$.create("button", {
		textContent: "Run",
		className: "run",
		events: {
			click: evt => {
				var code = element.value || element.textContent;
				var ret = eval(code);

				// if (ret !== undefined) {
				// 	console.log(ret);
				// }
			}
		},
		after: element.closest("pre, textarea")
	});
});

$$("#regression path").forEach(shape => {
	shape.style.setProperty("--length", shape.getTotalLength() + "px");
});

$$(".browser-support.slide > table > tbody:first-child").forEach(tbody => {
	tbody.insertAdjacentHTML("beforebegin", `<thead>
		<tr>
			<th></th>
			<th><img src="../shared/img/chrome-logo.svg" alt="Chrome"></th>
			<th><img src="../shared/img/firefox-logo.svg" alt="Firefox"></th>
			<th><img src="../shared/img/edge-logo.svg" alt="Edge"></th>
			<th><img src="../shared/img/safari-logo.png" alt="Safari"></th>
		</tr>
	</thead>`);
});
