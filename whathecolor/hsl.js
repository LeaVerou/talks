function rgbToHsl (r, g, b) {
	let max = Math.max(r, g, b);
	let min = Math.min(r, g, b);
	let [h, s, l] = [null, 0, (min + max)/2];
	let d = max - min;
	let ε = 1 / 100000;   // max Sat is 1, in this code

	if (d !== 0) {
		s = (l === 0 || l === 1)
			? 0
			: (max - l) / Math.min(l, 1 - l);

		switch (max) {
			case r:   h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b:  h = (r - g) / d + 4;
		}

		h = h * 60; // degrees
	}

	if (s <= ε) {
		h = null;
	}

	return [h, s * 100, l * 100];
}

function hsl_to_rgb(h, s, l) {
	s /= 100;
	l /= 100;

	return [0, 8, 4].map(n => {
		let k = (n + h/30) % 12;
		let a = s * Math.min(l, 1 - l);
		return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
	});
}
