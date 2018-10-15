(async () => {

await Inspire.importsLoaded;

if (Inspire.profile !== "speaker") {
	var allowed = ["#cover", ".demo", ".takeaway", ".browser-support", "#registerProperty", ".language-javascript, [mv-app]"];

	$$(".slide" + allowed.map(s => `:not(${s}), .speaker-only`).join("")).forEach(slide => slide.remove());
}

})();
