import Incrementable from "https://projects.verou.me/incrementable/incrementable.mjs";
import Replayer from "https://rety.verou.me/src/replayer.js";

// Replayer.customActions.next_slide = function({replayer, editor, action}) {
// 	Inspire.next();
// }

self.Incrementable = Incrementable;

var $ = Bliss, $$ = Bliss.$;

let delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

$$(".takeaway.slide").forEach((slide, i) => slide.style.setProperty("--takeaway", i+1));

$$(".website.slide > .browser > iframe").forEach(iframe => {
	let parent = iframe.parentNode;
	parent.style.setProperty("--url", `"${iframe.src}"`);
})

// Make external links open in a new tab
setTimeout(() => {
	$$('a[href^="https://"]:not([target]), a[href^="http://"]:not([target])').forEach(a => a.target = "_blank");
}, 1000);

$$(".color-reveal .delayed-children, .color-reveal .questions").forEach(div => {
	let questions = $$("div", div);
	div.classList.add("questions-" + questions.length);
});

$$(".demo.slide.reveal").forEach(slide => {
	if (!slide.hasAttribute("data-steps")) {
		slide.setAttribute("data-steps", "1");
	}

	$.create("button", {
		className: "next-item",
		onclick: Inspire.nextItem,
		inside: slide
	});
});

// $$("ol.math").forEach(math => math.classList.add("delayed-children"));

$$("ol.math > li, .math:not(ol)").forEach(eq => {
	eq.innerHTML = eq.innerHTML
			.replace(/\b(?!and|br)[a-z_]+\b/g, "<var>$&</var>")
			.replace(/_([a-z]+)\b/g, "<sub>$1</sub>")
			.replace(/=/g, "<span class=eq>=</span>")
			.replace(/\s[×\-+\/]\s/g, " <span class=operator>$&</span> ")
			;
});

$$("header.slide[style*='--icon']").forEach(slide => {
	let icon = slide.style.getPropertyValue("--icon").trim();
	let icon2 = slide.style.getPropertyValue("--icon-2").trim() || icon;
	let style = "font-size: 30px;";
	let style2 = icon === icon2? "transform: scaleX(-1); transform-origin: center; transform-box: fill-box;" : "";

	slide.style.setProperty("--icon-svg", `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text style="${style}" x="20" y="50">${icon}</text></svg>')`)
	slide.style.setProperty("--icon-svg-2", `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text style="${style} ${style2}" x="20" y="50">${icon2}</text></svg>')`)

});



(async () => {

await Inspire.importsLoaded;

// Reduced slide deck for attendees to follow along with certain activities
if (Inspire.profile !== "speaker") {
	let remove = `.color-reveal, .demo.reveal, .speaker-only, .valid-quiz`;
	let slidesToRemove = $$(`.slide:is(${remove})`);

	slidesToRemove.forEach(slide => slide.remove());

	// Remove empty sections
	$$("header.slide:only-child").forEach(slide => slide.remove());
}

// Wait 10s to ensure all Markdown has run (we really need a promise for this…)
await delay(10 * 1000);

for (let a of $$('details.notes a[href^="https://codepen.io"]')) {
	if (a.textContent.toLowerCase().trim().includes("solution")) {
		a.target = "_blank";
		a.addEventListener("click", evt => {
			if (!confirm("Are you sure? Once you see the solution, you cannot unsee it.")) {
				evt.preventDefault();
			}
		}, {once: true});
	}
}

})();

// $$("#day-end ~ section .slide, #day-end ~ .slide").forEach(s => s.remove());
