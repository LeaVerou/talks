(async () => {

await Inspire.importsLoaded;

if (Inspire.profile !== "speaker") {
	var allowed = ["#cover", ".demo", ".takeaway", ".browser-support", "#registerProperty", ".language-javascript"];

	$$(".slide" + allowed.map(s => `:not(${s})`).join("")).forEach(slide => slide.remove());
}

})();
