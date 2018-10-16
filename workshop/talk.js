(async () => {

await Inspire.importsLoaded;

if (Inspire.profile !== "speaker") {
	var allowed = ["header", ".demo", ".takeaway", ".browser-support", "#registerProperty", ".language-javascript", "[mv-app]", ".interactive"];

	$$(".slide" + allowed.map(s => `:not(${s})`).join("") + ", .speaker-only").forEach(slide => slide.remove());
}

})();
