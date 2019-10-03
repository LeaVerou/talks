// Add snippet

$$(".long-version").forEach(slide => slide.remove());

const xlink = "http://www.w3.org/1999/xlink";
var displacementDemo = $(".slide#displacement-map");

if (displacementDemo) {


	let displacement = 0;
	let speed = 0.2;

	function setXlinkHref() {
		/*
		<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width="300" height="300">
		<defs>
		<radialGradient id="rg" r=".9">
		*/
		let xlinkHref = `data:image/svg+xml;utf8,
		<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox="0 0 100 100" overflow="visible">
			<style>#rg stop {stop-color: gray} #rg stop:nth-child(even) {stop-opacity: 0}</style>
			<radialGradient id='rg' r='.9'>${
				[...Array(10).keys()].map(i => `<stop offset='${(i - 2) * 10 + displacement}%' />`).join("\n")
			}
			</radialGradient>
			<linearGradient id="td" gradientTransform="rotate(90)">
				<stop stop-color="rgb(100%, 50%, 50%)" />
				<stop stop-color="rgb(50%, 50%, 50%)" offset=".5" />
				<stop stop-color="rgb(0%, 50%, 50%)" offset="1" />
			</linearGradient>
			<linearGradient id="lr">
				<stop stop-color="rgb(50%, 0%, 50%)" />
				<stop stop-color="rgb(50%, 0%, 50%)" stop-opacity="0" offset="0.33" />
				<stop stop-color="rgb(50%, 100%, 50%)" stop-opacity="0" offset=".66" />
				<stop stop-color="rgb(50%, 100%, 50%)" offset="1" />
			</linearGradient>
			<rect id="witness" width="100" height="100" fill="url(%23td)" />
			<rect id="witness" width="100" height="100" fill="url(%23lr)" />
			<rect id="witness" width="100" height="100" fill="url(%23rg)" />
		</svg>`;

		return xlinkHref.replace(/%(?!\d)/g, "%25").replace(/#/g, "%23");
	}

	function AnimateOffset() {
		var feImage = $("feImage.ripple", displacementDemo);
		var displayMap = $("image.ripple", displacementDemo);

		if (feImage && displayMap) {
			let xlinkHref = setXlinkHref();

			feImage.setAttribute("href", xlinkHref);
			displayMap.setAttribute("href", feImage.getAttribute("href"));

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
	}

	requestAnimationFrame(AnimateOffset);
}
