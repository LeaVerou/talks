// General JS for the talk that doesn't fit in separate files

function $(expr, con) { return (con || document).querySelector(expr); }

document.addEventListener('DOMContentLoaded', function() {
	var textareas = $$('.css-snippet');
	
	for(var i=0, len = textareas.length; i<len; i++) {
		new CSSSnippet(textareas[i]);
		new Incrementable(textareas[i]);
	}
}, false);

// Color bounce
(function(){
	var buttons = $$('#color-bounce button');
	
	for(var i=0; i<buttons.length; i++) {
		buttons[i].onclick = function(evt) {
			var slide = this.parentNode.parentNode;
			slide.style.background = this.style.background;
		}
	}
})();

// Slide about styling based on sibling count
(function(){
	var colors = [
			'#082323', '#E6E2AF', '#A7A37E', '#EFECCA', '#046380', // Sandy stone beach
	    	'#1C171D', '#FEE169', '#CDD452', '#F9722E', '#C9313D', // Sushi Maki
	    	'#2E95A3', '#50B8B4', '#C6FFFA', '#E2FFA8', '#D6E055'  // Agave
	    ],
	    palette = document.getElementById('palette');
	
	function addColor(evt) {
		evt && evt.stopPropagation();
		
		removeSelected();
		
		var li = document.createElement('li');
		li.className = 'selected';
		li.style.background = colors.pop();
		li.onclick = function() {
			removeSelected();
			this.className = 'selected';
		};
		
		// Add color options
		var addColor = document.createElement('a'),
		    deleteColor = document.createElement('a'),
		    colorOptions = document.createElement('div');
		    
		colorOptions.className = 'color-options';
		
		addColor.className = 'add-color';
		deleteColor.className = 'delete-color';
		
		addColor.innerHTML = '<span class="first-word">Add</span> <span class="second-word">color</span>';
		deleteColor.innerHTML = '<span class="first-word">Delete</span> <span class="second-word">color</span>';
		
		addColor.href = deleteColor.href = '#';
		
		addColor.onclick = arguments.callee;
		deleteColor.onclick = function(evt) {
			evt.stopPropagation();
			
			var li = this.parentNode.parentNode;
			
			colors.push(li.style.backgroundColor);
			
			(li.previousElementSibling || {}).className = 'selected';
			li.parentNode.removeChild(li);
			
			return false;
		};
		
		colorOptions.appendChild(addColor);
		colorOptions.appendChild(deleteColor);
		
		li.appendChild(colorOptions);
		
		palette.appendChild(li);
		
		return false;
	}
	
	function removeSelected() {
		var lis = $$('li', palette);
		for(var i=0; i<lis.length; i++) {
			lis[i].className = '';
		}
	}
	
	addColor();
})();

// Make toggles for visible <style> elements
$$('style[contentEditable]').forEach(function(style, i) {
	var div =  document.createElement('div'),
	    checkbox = div.appendChild(document.createElement('input')),
		label = div.appendChild(document.createElement('label'));
	
	checkbox.type = 'checkbox';
	checkbox.checked = style.disabled = style.hasAttribute('disabled');
	checkbox.id = label.htmlFor = 'style-toggle-' + (i+1);
	checkbox.onclick = function(){
		var style = this.parentNode.nextElementSibling;

		if(this.checked) {
			style.setAttribute('disabled', 'disabled');
		}
		else {
			style.removeAttribute('disabled');
		}
		
		style.disabled = this.checked;
	};
	
	div.className = 'style-toggle';
	style.parentNode.insertBefore(div, style);
	checkbox.onclick();
});
	

(function(){
	var lis = $$('.cursor-list > li');
	
	for(var i=0; i<lis.length; i++) {
		var li = lis[i],
		    cursor = li.innerHTML;
		    
		li.style.cursor = cursor;

		if(!li.style.cursor) {
			li.style.cursor = PrefixFree.prefix + cursor;
		}
	}
})();

(function(){
	// Browser score card
	var table = $('table'),
		rows = table.rows;
		
	for(var i=1; i<rows.length; i++) {
		var cells = rows[i].cells,
			browser = cells[0].innerHTML;
		
		cells[1].innerHTML = $$('.browser-support > li[title="' + browser + '"].supported').length;
		cells[2].innerHTML = $$('.browser-support > li[title="' + browser + '"].buggy').length;
		cells[3].innerHTML = $$('.browser-support > li[title="' + browser + '"].not-supported').length;
	}
	
})();