// Challenges
var challenges = $$('[data-type="challenge"]');

for(var i=0; i<challenges.length; i++) {
	new CSSChallenge(challenges[i]);
}

// # of exercises indicator on cover
var challengeCount = challenges.length + $$('.dabblet-challenge').length;
var sticker = $u.element.create('div',{
	properties: {
		className: 'sticker'
	},
	contents: [$u.element.create('strong', challengeCount + '+'), ' exercises inside!'],
	inside: slideshow.slides[0]
});

// Activate CSS snippets
var cssSnippets = $$('.examples-list > textarea:not(.selector-snippet), .css-snippet');
for(var i=0; i<cssSnippets.length; i++) {
	var field = cssSnippets[i];
	
	field.classList.add('dont-resize');
	
	new CSSSnippet(field);
	new Incrementable(field);
}

/*$$('.cursor-list > li').forEach(function(li) {
	var cursor = li.textContent;
	    
	li.style.cursor = PrefixFree.value(cursor);
});*/

StyleFix.register(function(css, raw) {
	if (PrefixFree.functions.indexOf('radial-gradient') > -1) {
		css = css.replace(/radial-gradient\(([\w\s%-]+\s+)?at ([^,]+)(?=,)/g, function($0, shape, center){
			return 'radial-gradient(' + center + (shape? ', ' + shape : '');
		});
	}
	
	if (PrefixFree.Prefix + 'Filter' in document.body.style) {
		css = css.replace(/\bfilter:/ig, PrefixFree.prefix + 'filter:');
	}
	
	return css;
});

// Blending modes showcase
$$('#blending-modes article').forEach(function(div) {
	div.setAttribute('style', PrefixFree.prefixCSS('background-blend-mode:' + div.textContent))
});

(function(slide){

var topics = slide.textContent.split(/\s*\r?\n\s*/);
slide.textContent = '';

var ul = document.createElement('ul');

topics.forEach(function(topic) {
	topic = topic.trim();
	
	if (topic) {
		$u.element.create('li', {
			contents: topic,
			inside: ul
		});
	}
});

slide.appendChild(ul);

})(window['css-topics']);