import Color from "colorjs.io";

/*
 * Fills the #gamut-mapped-scales palette. CSS can't gamut map (yet — that's the
 * whole point of the talk), so we compute each tint here: take the same
 * constant-chroma oklch tint as the "failed" scale, then properly gamut map it
 * to P3 (the CSS algorithm: reduce chroma in oklch until it fits, with binary
 * search + ΔEOK clipping). The resulting --color-N tokens drive both the
 * swatches and the callout, exactly like the CSS-defined scales.
 */

const tiers = [90, 80, 70, 60, 50, 40, 30, 20, 10];

// Lightness per tier, read from the same CSS tokens the other scales use.
const root = getComputedStyle(document.documentElement);
const lightness = Object.fromEntries(
	tiers.map(tier => [tier, parseFloat(root.getPropertyValue(`--l-${tier}`))])
);

for (const tr of document.querySelectorAll("#gamut-mapped-scales tbody tr")) {
	// Constant chroma & hue come from the row's key color.
	const key = new Color(getComputedStyle(tr).getPropertyValue("--color")).to("oklch");
	const [, chroma, hue] = key.coords;

	for (const tier of tiers) {
		const tint = new Color("oklch", [lightness[tier], chroma, hue])
			.toGamut({ space: "p3" });
		tr.style.setProperty(`--color-${tier}`, tint.to("p3").toString());
	}
}
