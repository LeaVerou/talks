var $ = Bliss, $$ = Bliss.$;
var onslide = new WeakMap();

try {
	var isSpeaker = new URL(location).searchParams.get("speaker") !== null;
}
catch (e) {}

if (isSpeaker) {
	document.documentElement.classList.add("speaker");
}

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
			rule.selectorText = scope + " " + selector;
		}
	}
}

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

				if (!ul.classList.contains("no-link")) {
					a.href = "https://developer.mozilla.org/en-US/docs/Web/CSS/" + node.textContent.trim();
				}
			}
		}
	});

	onslide.set(slide, evt => {
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

// If a slide has a title but not an id, get its id from that
$$(".slide[title]:not([id])").forEach(slide => {
	slide.id = slide.title.replace(/[^\w\s-]/g, "") // Remove non-ASCII characters
			.trim().replace(/\s+/g, "-") // Convert whitespace to hyphens
			.toLowerCase();
});

function createURL(html) {
	html = html.replace(/&#x200b;/g, "");
	var blob = new Blob([html], {type : "text/html"});

	return URL.createObjectURL(blob);
}

// Create blob URLs for each preview link
$$("[data-html]").forEach(function(a) {
	var slide = a.closest(".slide");

	a.addEventListener("click", evt => {
		var selector = a.getAttribute("data-html");
		var element = $(selector, slide) || $(selector, slide.parentNode) || $(selector);
		var html = Prism.plugins.NormalizeWhitespace.normalize(element? element.textContent : selector);

		a.href = createURL(html);
	});
});

$$("details.notes").forEach(details => {
	var div = document.createElement("div");

	$$(details.childNodes).forEach(e => div.append(e));
	details.append(div);

	var summary = $("summary", details);

	if (!summary) {
		var slide = details.closest(".slide");
		summary = $.create("summary", {textContent: slide.title || "Notes"});
	}

	details.prepend(summary);
});

$$(".runnable.slide pre>code, .runnable.slide textarea").forEach(code => {
	$.create("button", {
		textContent: "Run",
		className: "run",
		events: {
			click: evt => {
				var ret = eval(code.value || code.textContent);

				// if (ret !== undefined) {
				// 	console.log(ret);
				// }
			}
		},
		after: code.closest("pre, textarea")
	});
});

// Specificity battle slide
{
	let slide = $("#specificity-battle");
	let output = {
		0: $("output[for=selector1]", slide),
		1: $("output[for=selector2]", slide),
		greater: $('output[for="selector1, selector2"]', slide)
	};
	let input = $$("input", slide);

	function update() {
		var specificity = [];
		var base = 9;

		for (let i=0; i<2; i++) {
			specificity[i] = calculateSpecificity(input[i].value);
			base = Math.max(base, ...specificity);
			output[i].innerHTML = `<div>${specificity[i].join("</div> <div>")}</div>`;
			output[i].className = "";
		}

		base++;

		var diff = parseInt(specificity[0].join(""), base) - parseInt(specificity[1].join(""), base);

		if (diff < 0) {
			// 2 wins
			output.greater.textContent = "<";
			output[1].className = "winner";
		}
		else if (diff > 0) {
			// 1 wins
			output.greater.textContent = ">";
			output[0].className = "winner";
		}
		else {
			output.greater.textContent = "=";
		}

	}

	$$("input", slide).forEach(input => input.addEventListener("input", update));
	update();
}

function calculateSpecificity(selector) {
	selector = selector.replace(/("|').+?\1/g, "");
	return [
		(selector.match(/#/g) || []).length,
		(selector.match(/\.|:(?!not|:)|\[/g) || []).length,
		(selector.match(/(^|\s)[\w-]+/g) || []).length
	];
}

$$('a[href^="http"]:not([target])').forEach(a => a.target = "_blank");

// Links to documentation
$$("code.property, code.css, code.function, code.element, code.attribute, [data-autolink] code").forEach(code => {
	var text = code.textContent;
	var path;

	switch (code.className) {
		case "function":
			code.textContent += "()"; // pass-through
		case "property":
		case "css":
			path = "CSS";
			break;
		case "element":
			path = "HTML/Element";
			code.textContent = "<" + text + ">";
			break;
		case "attribute":
			var category = code.dataset.category || "Global_attributes";
			path = `API/${category}`;
			break;
		default:
			path = code.closest("[data-autolink]").dataset.autolink;
	}

	$.create("a", {
		href: `https://developer.mozilla.org/en-US/docs/Web/${path}/${text}`,
		around: code,
		target: "_blank"
	});
});

$$(".demo.slide").forEach(slide => {
	// This is before editors have been created
	slide.classList.add("dont-resize");
});

$$(".cheatsheet.slide fieldset code").forEach(code => {
	var frequency = code.getAttribute("data-frequency");

	$.create("a", {
		href: `https://developer.mozilla.org/en-US/docs/Web/CSS/${code.getAttribute("data-href") || code.textContent}`,
		around: code,
		target: "_blank",
		className: frequency >= 8? "popular" : "",
		style: {
			"--frequency": frequency
		}
	});
});

document.addEventListener("DOMContentLoaded", function(evt) {
	$$(".demo.slide").forEach(slide => {
		slide.demo = new Demo(slide);
	});
});

Prism.languages.insertBefore("css", "property", {
	"variable": /\-\-(\b|\B)[\w-]+(?=\s*[:,)]|\s*$)/i
});

$$(".with-next.slide, .demo.slide").forEach(slide => {
	// Next button
	$.create("a", {
		className: "button next",
		textContent: "Next ▸",
		inside: slide,
		events: {
			click: evt => slideshow.nextItem()
		}
	});
});

$$("#colors input").forEach(input => {
	new Incrementable(input);

	(input.oninput = evt => {
		input.style.background = "";
		var previous = input.style.backgroundColor;
		input.style.backgroundColor = input.value;

		var invalid = input.value  && !input.style.background;

		input.setCustomValidity(invalid? "Invalid color" : "");
	})();
});

// CSS Variables specific

// onslide.set($(".slide#mouse"), evt => {
// 	var mousemove = evt => {
// 		document.documentElement.style.setProperty("--mouse-x", evt.clientX / innerWidth);
// 		document.documentElement.style.setProperty("--mouse-y", evt.clientY / innerHeight);
// 	};
//
// 	document.addEventListener("mousemove", mousemove);
// 	document.addEventListener("slidechange", evt => {
// 		document.removeEventListener("mousemove", mousemove);
// 	}, {once: true});
// });

// Remove spaces in syntax breakdown and add classes to the ones that are towards the end
$$(".syntax-breakdown code").forEach(function(code) {
	var slide = code.closest(".slide");

	if (!slide.classList.contains("vertical")) {
		code.innerHTML = code.innerHTML.replace(/[\t\r\n]/g, "");
	}
	else {
		code.innerHTML = Prism.plugins.NormalizeWhitespace.normalize(code.innerHTML);
	}

	var text = code.textContent;

	$$("span", code).forEach(function(span) {
		span.classList.add("delayed");

		if (text.indexOf(span.textContent) > text.length/2) {
			// FIXME will break when there are duplicates
			span.classList.add("after-middle");
		}
	});
});

$$("#js textarea.editor").forEach(textarea => {
	textarea.classList.add("language-javascript", "adjust-width", "adjust-height");
	textarea.addEventListener("input", evt => resizeTextarea(textarea));
});

{
	let structural = $("#structural");
	let style = $("style", structural);
	let input = $("input", structural);

	$$("ul.tree li a", structural).forEach(a => a.textContent = "<" + a.textContent.trim() + ">");

	input.oninput = evt => {
		style.textContent = `#structural ul.tree li${input.value} > a {
			box-shadow: 0 0 0 .3em white;
		}`;
	};

	input.oninput();
}
