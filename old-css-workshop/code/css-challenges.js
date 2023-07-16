(function(){

var self = window.CSSChallenge = function (slide) {
	var me = this;
	
	// Containing slide
	this.slide = slide;
	
	// Demo box displaying the effect
	this.goal = $('.demo-box:not(.my)', slide);
	
	// Demo box displaying the user's attempt
	this.test = $('.my.demo-box', slide);
	
	// Where the attendee types
	this.textarea = $('textarea.my.code', slide);
	
	// Textarea containing the solution
	this.solution = $('textarea:not(.my).code', slide);
	
	// Markup stuff that would otherwise be coded manually
	this.test.setAttribute('style', this.goal.getAttribute('style'));
	this.test.innerHTML = this.goal.innerHTML;
	
	this.textarea.setAttribute('data-subject', '#' + slide.id + ' .my.demo-box');
	this.textarea.placeholder = 'Type your code here';
	
	$u.element.create('h1', {
		contents: 'Challenge goal',
		before: this.goal
	});
	
	$u.element.create('h1', {
		contents: 'Your result',
		before: this.test
	});
	
	this.testSnippet = new CSSSnippet(this.textarea);
	
	new Incrementable(this.textarea);
	
	this.solution.setAttribute('data-subject', '#' + slide.id + ' :not(.my).demo-box');
	this.solution.readonly = true;
	
	this.goalSnippet = new CSSSnippet(this.solution);
	
	this.textarea.oninput = function() {
		if(!me.slide.classList.contains('success') &&
			me.solved()) {
			// I solved it!!
			me.slide.classList.add('success');
			
			self.sounds.winner.play();
			
			me.end = Date.now();
			
			me.status.innerHTML = 'Congrats! It only took you ' + me.timeTaken() + ' to solve.';
		}
	};
	
	// Add solve button
	this.solve = document.createElement('button');
	
	this.solve.className = 'solve';
	this.solve.innerHTML = 'Show solution';
	this.solve.onclick = function() {
		if(!confirm('Are you sure you want to give up? There’s no going back!')) {
			return;
		}
		
		self.sounds.loser.play();
		
		me.slide.classList.add('fail');
		
		me.end = Date.now();
		
		me.status.innerHTML = 'Hey, at least you tried for  ' + me.timeTaken() + '.';
		
		me.textarea.style.display = 'none';
		me.solution.style.display = 'block';
		
		this.disabled = true;
	};
	
	slide.appendChild(this.solve);
	
	this.start = Date.now();
	
	addEventListener('hashchange', function() {
		if(location.hash === '#' + slide.id) {
			me.textarea.focus();
			me.start = Date.now();
		}
	}, false);
	
	this.status = document.createElement('p');
	
	this.status.className = 'status';
	
	slide.appendChild(this.status);
};

self.prototype = {
	solved: function() {
		// Compare computed styles instead, it's more solid
		var goalStyle = getComputedStyle(this.goal),
			testStyle = getComputedStyle(this.test);
			
		for(var i=goalStyle.length; i--;) {
			var property = goalStyle[i],
				goalValue = goalStyle.getPropertyValue(property),
				testValue = testStyle.getPropertyValue(property);

			if(goalValue != testValue) {
				return false;
			}
		}
		
		return true;
	},
	
	timeTaken: function() {
		var ms = this.end - this.start,
			s = Math.round(ms/1000),
			m = ~~(s/60),
			ret = '';
			
		s = s % 60;
		
		if(m > 0) {
			ret = m + ' minutes' + (s > 0? ' and ' : '');
		}
		
		return ret + (s > 0? s + ' seconds' : '');
	}
};

self.sounds = {
	winner: new Audio('winner.wav'),
	loser: new Audio('loser.mp3')
};

self.defaults = getComputedStyle(document.createElement('div'));

// Private helpers
function cssText(rule) {
	var cssText = rule.cssText, selector = rule.selectorText;
	
	if(selector) {
		return cssText.replace(RegExp('^' + selector + '\\s+\\{'), '');
	}
	else {
		return cssText;
	}
}

function sortCssText(cssText) {
	return cssText.split(/;\s+/).sort().join(';\r\n');
}

function compareRules(rule1, rule2) {
	if(!rule1.cssRules != !rule2.cssRules) { // xor
		return false;
	}
	
	if(rule1.cssRules) {
		if(rule1.cssRules.length != rule2.cssRules.length) {
			return false;
		}
		
		for (var i=0; i<rule1.cssRules.length; i++) {
			if(!compareRules(rule1.cssRules[i], rule2.cssRules[i])) {
				return false;
			}
		}
		
		return true;
	}
	else {
		return rule1.selectorText == rule2.selectorText
			&& rule1.cssText.length == rule2.cssText.length
			&& sortCssText(cssText(rule1)) == sortCssText(cssText(rule2));
	}
}

})();