if (+document.body.getAttribute('data-duration') < 30) {
	$$('#browser-compat, #browser-compat + .slide, #spec, .multi-value.slide, #overlapping-math, #overlapping-math + .slide, #r-inner-math, #animatable,' + 
	'#adding-border, #adding-border + .plain.slide, #box-shadow, #box-shadow + .slide, #different-borders, #different-borders + .slide, ' +
	'section.powerpoint.slide:not([id]), #forgot, #resources, #making-of').forEach(function(slide) {
		slide.parentNode.removeChild(slide);
	});
}

var slideshow = new SlideShow();

$$('textarea').forEach(function(textarea) {
	if (textarea.getAttribute('data-subject')) {
		var wrapper = document.createElement('div');
		wrapper.className = 'speech-bubble';
		textarea.parentNode.replaceChild(wrapper, textarea);
		wrapper.appendChild(textarea);
	}
	
	new Incrementable(textarea);
	new CSSSnippet(textarea);
});

$$('.mr-border-radius').forEach(function(div) {
	var animation = div.getAttribute('data-animation');
	
	var object = document.createElement('object');
	object.data = 'img/mr-border-radius.svg' + (animation? '#' + animation : '');
	div.appendChild(object);
	
	var structure = document.createElement('div');
	structure.className = 'structure';
	div.appendChild(structure);
	
	var slide = SlideShow.getSlide(div);
	
	if (slide && slide.classList.contains('example')) {
		var textarea = $('textarea', slide);
		
		function showStructure(left, inner) {
			var cs = getComputedStyle(div),
			    rtl = cs['borderTop' + (left? 'Left' : 'Right') + 'Radius'].split(/\s+/);

			var rh = parseFloat(rtl[0]), rv = parseFloat(rtl[1] || rtl[0]);
			
			structure.classList.add(left? 'left' : 'right');
			structure.classList.remove(!left? 'left' : 'right');
			
			if (inner) {
				rh -= parseFloat(left? cs.borderLeftWidth : cs.borderRightWidth);
				console.log(left? cs.borderLeftWidth : cs.borderRightWidth);
				
				rv -= parseFloat(cs.borderTopWidth);
				
				rv = Math.max(0, rv);
				rh = Math.max(0, rh);
				
				structure.style.margin = '0';
			}
			else {
				structure.style.marginTop = '-' + cs.borderTopWidth;
				
				if (left) {
					structure.style.marginLeft = '-' + cs.borderleftWidth;
				}
				else {
					structure.style.marginRight = '-' + cs.borderRightWidth;
				}
			}
			
			structure.style.lineHeight = rv + 'px';
			structure.style.width = 2*rh + 'px';
			structure.style.height = 2*rv + 'px';
			
			structure.setAttribute('data-rh', rh + 'px');
			structure.setAttribute('data-rv', rv + 'px');
			
			setTimeout(function(){
				slide.classList[rh > 120? 'add' : 'remove']('big-radius');
			}, 0);
		}
		
		textarea.addEventListener('input', function(){
			
			var left = slide.recentKeyCode == 65 || slide.recentKeyCode == 90, // A, Z
			    inner = slide.recentKeyCode == 90 || slide.recentKeyCode == 88; // Z, X
			
			showStructure(left, inner);
		});
		
		slide.addEventListener('keydown', function(evt) {
			if ([65,83, 88,90].indexOf(evt.keyCode) > -1 && evt.ctrlKey) {
				
				// Toggle structure
				var left = evt.keyCode == 65 || evt.keyCode == 90, // A, Z
				    inner = evt.keyCode == 90 || evt.keyCode == 88; // Z, X
				    
				showStructure(left, inner);

				if (slide.recentKeyCode !== evt.keyCode) {
					slide.classList.add('show-structure');
					
					slide.classList.remove('show-structure-left');
					slide.classList.remove('show-structure-right'); 
					slide.classList.add('show-structure-' + (left? 'left' : 'right')); 
					
					slide.recentKeyCode = evt.keyCode;
				}
				else {
					slide.classList.remove('show-structure');
					slide.classList.remove('show-structure-left');
					slide.classList.remove('show-structure-right'); 
					
					slide.recentKeyCode = '';
				}
				
				evt.preventDefault();
				return false;
			}
		});
	}
});



document.addEventListener('hashchange', function() {
	$$('object').forEach(function(object){
		var doc = object.contentDocument.documentElement;
		
		doc.pauseAnimations();
	});
	
	if (!location.hash) {
		return;
	}
	
	var slide = $(location.hash + '.slide');
	
	if (slide) {
		var object = $('object', slide);
		
		object.contentDocument.documentElement.unpauseAnimations();
	}
});

$$('.example.slide').forEach(function(slide) {
	
});