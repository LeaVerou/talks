// Add snippet

$$(".long-version").forEach(slide => slide.remove());

const xlink = "http://www.w3.org/1999/xlink";
var displacementDemo = $(".slide#displacement-map");

if (displacementDemo) {
	let displacement = 0;
	let speed = 0.2;

	function setXlinkHref(prev) {
		return prev.replace(/<radialGradient id="rg".*?>[\s\S]+?<\/radialGradient>/, `<radialGradient id="rg" r=".9">
				${[...Array(10).keys()].map(i => `<stop offset='${(i - 2) * 10 + displacement}%25' />`).join("\n")}
			</radialGradient>`);
	}

	function AnimateOffset() {
		var feImage = $("feImage.ripple", displacementDemo);
		var displayMap = $("image.ripple", displacementDemo);

		if (feImage && displayMap) {
			let xlinkHref = setXlinkHref(feImage.getAttribute("href"));

			feImage.setAttribute("href", xlinkHref);

			if (displacement <= 20) {
				displacement += speed;
			}
			else {
				displacement = 0;
			}
		}

		if (location.hash === "#displacement-map") {
			requestAnimationFrame(AnimateOffset);
		}
		else {
			document.addEventListener("slidechange", evt => {
				if (Inspire.currentSlide.id === "displacement-map") {
					requestAnimationFrame(AnimateOffset);
				}
			});
		}
	}

	requestAnimationFrame(AnimateOffset);
}
