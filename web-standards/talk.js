var slideshow = new SlideShow();

// WG pie charts
$$('div.wg').forEach(function(div){
	var members = +div.getAttribute('data-members'),
	    ies = +div.getAttribute('data-ies'),
	    w3c = +div.getAttribute('data-w3c');
	    
	var ieDiv = document.createElement('div'),
	    w3cDiv = document.createElement('div');
	
	ieDiv.className = 'invited-experts';
	w3cDiv.className = 'w3c-staff';
	
	var ieAngle = 360 * ies/members;
	
	ieDiv.style.cssText = PrefixFree.prefixCSS('transform: rotate(-90deg) skewX(' + (90 - ieAngle) + 'deg)');
	w3cDiv.style.cssText = PrefixFree.prefixCSS('transform: rotate(' + (ieAngle-90) + 'deg) skewX(' + (90 - 360 * w3c/members) + 'deg)');
	
	div.appendChild(ieDiv);
	div.appendChild(w3cDiv);
	
	// Create legend
	
	var legend = document.createElement('dl');
	
	legend.className = 'legend';
	
	var distribution = {
		'Member companies': (members - ies - w3c) + ' (' + percentage(members - ies - w3c,members) + '%)',
		'Invited Experts': ies + ' (' + percentage(ies,members) + '%)',
		'W3C Staff': w3c + ' (' + percentage(w3c,members) + '%)'
	}
	
	for (var i in distribution) {
		var dt = document.createElement('dt');
		dt.className = i.toLowerCase().replace(/\s+/g, '-');
		dt.textContent = i;
		legend.appendChild(dt);
		
		var dd = document.createElement('dd');
		dd.textContent = distribution[i];
		legend.appendChild(dd);
	}
	
	div.parentNode.insertBefore(legend, div);
});

function percentage (portion, total) {
	return Math.round(1000*portion/total)/10;
}

var questionList = $('#questions ol');

$$('.question.slide h1').forEach(function(h1) {
	var li = document.createElement('li');
	var a = document.createElement('a');
	
	a.textContent = h1.textContent;
	a.href = '#' + h1.parentNode.id;
	
	li.appendChild(a);
	
	questionList.appendChild(li);
});