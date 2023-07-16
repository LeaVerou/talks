$$('.iframe.slide').forEach(function(slide) {
	slide.classList.add('dont-resize');
});

$$('textarea').forEach(function(textarea) {
	textarea.setAttribute('data-raw', '');
	new Incrementable(textarea);
	new CSSSnippet(textarea);
});

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

//$$('#total-support dfn').forEach(function(dfn) {
//	dfn.textContent = $$('section > section.slide .browser-support > dfn[title="' + dfn.title + '"]:not(:empty)').length
//});

$$('.show-html').forEach(function(element) {
	element.onmouseover = function (evt) {
		if (!element.tooltip) {
			element.tooltip = document.createElement('pre');
			
			var code = document.createElement('code');
			
			element.classList.remove('show-html');
			code.textContent = element.outerHTML || element.innerHTML;
			element.classList.add('show-html');
			
			element.tooltip.className = 'tooltip';
			code.className = 'language-markup';
			
			element.tooltip.appendChild(code);
			
			SlideShow.getSlide(element).appendChild(element.tooltip);
			
			Prism.highlightElement(code);
		}
		
		element.tooltip.style.top = evt.clientY - 10 + 'px';
		
		element.tooltip.classList.add('active');
		
		element.tooltip.style.left = Math.min(innerWidth - element.tooltip.offsetWidth - 10, evt.clientX) + 'px';
	};
	
	element.onmouseout = function () {
		element.tooltip.classList.remove('active');
	}
});

document.addEventListener('keyup', function(evt) {
	if (evt.ctrlKey && evt.keyCode == 68) {
		drumroll.play();
	}
});