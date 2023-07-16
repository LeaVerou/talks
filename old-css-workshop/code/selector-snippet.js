$$('.self-populating').forEach(function(list) {
	var initial = +list.getAttribute('data-initial') || 1,
		single = list.hasAttribute('data-single');
	
	for(var i=initial; i--;) {
		addItem(single || Math.round(Math.random())? 'b' : 'i');
	}
	
	list.onclick = function(evt) {
		var target = evt.target;
		
		if(!/^button$/i.test(target.nodeName)) {
			return;
		}
		
		if(target.classList.contains('delete')) {
			if(list.children.length > 1) {
				list.removeChild(target.parentNode);
				target = null;
			}
		}
		else {
			addItem(single || target.classList.contains('b')? 'b' : 'i');
		}
	};
	
	function addItem(type) {
		var child = document.createElement(type);
		
		child.innerHTML = (single? '<button class="add">+</button>' : '<button class="add b">+b</button> <button class="add i">+i</button>') +
						   '<button class="delete">×</button>';
		
		list.appendChild(child);
	}
});

$$('.selector-snippet').forEach(function(field) {
	CSSEdit.elastic(field);
	
	window.Incrementable && new Incrementable(field);
	
	addEventListener('hashchange', interactive, false);
	
	interactive();
	
	function interactive() {
		if (slideshow.onCurrent(field)) {
			field.css = document.createElement('style');
			
			document.head.appendChild(field.css);
			
			(field.oninput = field.onkeyup = function () {
				var prefix = this.getAttribute('data-prefix') || '.slide ';
					selector = this.value.replace(/(^|,\s*)/g, '$1' + prefix),
					unselected = this.getAttribute('data-style-unselected') || '';
					
				if(unselected) {
					var unSelector = prefix;
					
					// Add star if it ends in a combinator
					if(/\s*(>|\+|~|\s)\s*$/.test(prefix)) {
						unSelector += '*';
					}
					
					unselected = unSelector + '{' + unselected + '}';
				}

				this.css.innerHTML = unselected + selector + '{' + this.getAttribute('data-style') + '}';
			}).call(field);
		}
		else if(field.css) {
			document.head.removeChild(field.css);
			field.css = null;
		}
	}
});