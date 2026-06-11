for (let scale of document.querySelectorAll("color-scale.show-distances")) {
	let prevColor;
	let distancesEl = scale.querySelector(".distances");
	if (!distancesEl) {
		distancesEl = Object.assign(
				document.createElement("div"),
				{ className: "distances" }
			);
		scale.appendChild(distancesEl);
	}
	let colors = Object.values(scale.colors);
	scale.style.setProperty("--num-colors", colors.length);

	for (let i = 1; i < colors.length; i++) {
		let prevColor = colors[i - 1];
		let color = colors[i];
		let distance = prevColor.distance(color, color.space);
		let deltaE = color.deltaE(prevColor, "2000");
		let distanceEl = document.createElement("div");
		distanceEl.className = "distance";
		distanceEl.classList.toggle("dark", color.oklch.l < .7);
		distanceEl.innerHTML = `<div>
			<span class="coords-d">${distance.toLocaleString("en", { maximumFractionDigits: 2 })}</span>
			<span class="deltae">${deltaE.toLocaleString("en", { maximumFractionDigits: 2 })}</span>
		</div>`;

		distancesEl.appendChild(distanceEl);
		prevColor = color;
	}
}
