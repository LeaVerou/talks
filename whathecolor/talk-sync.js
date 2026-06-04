/* Tailwind key colors */
var TwColors = {
	red: "oklch(57.7% 0.245 27.325)",
	orange: "oklch(64.6% 0.222 41.116)",
	// amber: "oklch(82.8% 0.189 84.429)",
	yellow: "oklch(85.2% 0.199 91.936)",
	lime: "oklch(84.1% 0.238 128.85)",
	green: "oklch(72.3% 0.219 149.58)",
	// emerald: "oklch(76.5% 0.177 163.22)",
	teal: "oklch(77.7% 0.152 181.91)",
	cyan: "oklch(78.9% 0.154 211.53)",
	sky: "oklch(68.5% 0.169 237.32)",
	blue: "oklch(54.6% 0.245 262.88)",
	indigo: "oklch(51.1% 0.262 276.97)",
	// violet: "oklch(54.1% 0.281 293.01)",
	purple: "oklch(55.8% 0.288 302.32)",
	// fuchsia: "oklch(66.7% 0.295 322.15)",
	pink: "oklch(59.2% 0.249 0.584)",
	// rose: "oklch(58.6% 0.253 17.585)",

	stone: "oklch(55.3% 0.013 58.071)",
	slate: "oklch(55.4% 0.046 257.42)",
	zinc: "oklch(44.2% 0.017 285.79)",
	gray: "oklch(37.3% 0.034 259.73)"
};

for (let color in TwColors) {
	document.documentElement.style.setProperty(`--tw-${color}`, TwColors[color]);
}
