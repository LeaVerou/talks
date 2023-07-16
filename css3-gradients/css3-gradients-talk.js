// General JS for the talk that doesn't fit in separate files

document.addEventListener('DOMContentLoaded', function() {
	var textareas = document.querySelectorAll('.gradient-snippet');
	
	for(var i=0, len = textareas.length; i<len; i++) {
		var textarea = textareas[i];
		textarea.setAttribute('wrap', 'off');
		
		new CSSSnippet(textarea);
		new Incrementable(textarea);
	}
}, false);