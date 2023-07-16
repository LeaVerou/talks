var slideshow = new SlideShow();

$$('.image.slide').forEach(function(slide) {
	slide.classList.add('dont-resize');
});

$$('textarea').forEach(function(textarea) {
	new CSSSnippet(textarea);
});

$$('.slide > iframe:only-child').forEach(function(iframe) {
	var slide = iframe.parentNode,
		h = document.createElement('h1'),
		a = document.createElement('a');
	
	slide.classList.add('iframe');
		
	var title = iframe.getAttribute('data-src')
					.replace(/\/#?$/, '')
					.replace(/^\w+:\/\/w{0,3}\.?/, '');
	
	a.href = iframe.src;
	a.target = '_blank';
	a.innerHTML = title;
	h.appendChild(a);
	
	slide.appendChild(h);
});