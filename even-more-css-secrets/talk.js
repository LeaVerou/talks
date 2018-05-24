var $ = Bliss, $$ = Bliss.$;
var onslide = new WeakMap();

document.body.style.setProperty("--slide-count", `"${$$(".slide").length}"`);

// Slide-specific listeners
document.addEventListener("slidechange", evt => {
	var callback = onslide.get(evt.target);
	callback && callback(evt);
});

function scopeRule(rule, slide, scope) {
	let selector = rule.selectorText;

	if (rule.cssRules) {
		// If this rule contains rules, scope those too
		// Mainly useful for @supports and @media
		for (let innerRule of rule.cssRules) {
			scopeRule(innerRule, slide, scope);
		}
	}

	if (selector && rule instanceof CSSStyleRule) {
		let shouldScope = !(
			selector.includes("#")  // don't do anything if the selector already contains an id
			|| selector == ":root"
		);

		if (selector == "article" || selector == ".slide") {
			rule.selectorText = `#${slide.id}`;
		}
		else if (shouldScope && selector.indexOf(scope) !== 0) {
			rule.selectorText = selector.split(",").map(s => `${scope} ${s}`).join(", ");
		}
	}
}

// If a slide has a title but not an id, get its id from that
$$(".slide[title]:not([id])").forEach(slide => {
	var id = slide.title.replace(/[^\w\s-]/g, "") // Remove non-ASCII characters
			.trim().replace(/\s+/g, "-") // Convert whitespace to hyphens
			.toLowerCase();

	if (!window[id]) {
		slide.id = id;
	}
});

$$('a[href^="http"]:not([target])').forEach(a => a.target = "_blank");

$$(".demo.slide").forEach(slide => {
	// This is before editors have been created
	slide.classList.add("dont-resize");
});

document.addEventListener("DOMContentLoaded", function(evt) {
	$$(".demo.slide").forEach(slide => {
		slide.demo = new Demo(slide);
	});
});

Prism.languages.insertBefore("css", "property", {
	"variable": /\-\-(\b|\B)[\w-]+(?=\s*[:,)]|\s*$)/i
});

$$(".takeaway.slide").forEach((slide, i) => {
	$.create("span", {
		className: "label",
		innerHTML: `Takeaway${$("li")? "s" : ""} <span>#</span>${i + 1}`,
		start: $("h1, ul", slide)
	});
});

// Blending mode testing slide
(function(){

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

var slide = $("#blending-modes");
var elements = $("form", slide).elements;
var foreground = $(".foreground", slide);
var background = $(".background", slide);
var math = $(".math", slide);

$$("input", slide).forEach(input => new Incrementable(input));

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

$.bind($('form[target="wolfram"]'), {
	input: evt => {
		evt.target.form.submit();
	}
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

})();
