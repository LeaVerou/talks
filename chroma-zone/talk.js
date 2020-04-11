
function colorInput(display, input, colorStr) {
	input.value = colorStr;

	new Incrementable(input);

	(input.oninput = function() {
		var length = input.value.length;

		input.style.fontSize = length >= 15? (length > 25? '150%' : '200%') : (length <= 10? '400%' : '');

		var color = Color.fromString(input.value);

		if (!color) {
			return;
		}

		display.style.background = color;

		input.style.color = color.luminance > 50 || color.alpha < .5? 'black' : '';
	})();
}

$$('.color.slide').forEach(function(slide) {
	var input = document.createElement('input');

	slide.appendChild(input);

	colorInput(slide, input, slide.getAttribute('data-color'));
});

$$('textarea').forEach(function(textarea) {
	textarea.setAttribute('data-raw', '');
	new Incrementable(textarea);
	// new CSSSnippet(textarea);
});

$$('#blending-modes article').forEach(function(div) {
	// div.setAttribute('style', PrefixFree.prefixCSS('background-blend-mode:' + div.textContent))
});

// Decimal to hex converter
(function() {

var dc = $('#decimal-counter');
var hc = $('#hex-counter');

dc && (dc.oninput = function () {
	hc.textContent = (+dc.value).toString(16);
})();

})();

// RGB Color picker
Inspire.on('rgb-2d').then(function() {

var plane = $('#rgb-xy');

if (!plane.offsetWidth) {
	setTimeout(arguments.callee, 10);
	return;
}

var planeY = plane.firstChild;
var z = $('#rgb-z');
var axis = $('#rgb-axis');
var planeThumb = $('button', plane);
var selected = $('#rgb-2d output');
var ai = axis.selectedIndex;
var planeRect = plane.getBoundingClientRect();

z.oninput = function () {
	updatePlane();
	setColor(getXY(), +this.value);
};

axis.onchange = function() {
	var xy = getXY();
	xy.splice(ai, 0, +z.value);
	var previousRGB = xy;

	ai = axis.selectedIndex;

	z.value = previousRGB[ai];
	previousRGB.splice(ai, 1);

	planeThumb.style.left = plane.offsetWidth * previousRGB[0] / 255 + 'px';
	planeThumb.style.top = plane.offsetHeight * (1 - previousRGB[1] / 255) + 'px';

	updatePlane();
	updateSlider();
	setLabels();
};

function setLabels() {
	var labels = ['red', 'green', 'blue'];
	labels.splice(ai, 1);

	plane.setAttribute('data-label-x', labels[0]);
	plane.setAttribute('data-label-y', labels[1]);
}

function setColor(planeXY, slider) {
	var color = [planeXY[0], planeXY[1]];
	color.splice(axis.selectedIndex, 0, slider);
	color = Color(color);

	planeThumb.style.background = selected.style.background = color;
	selected.innerHTML = 'Red <b>' + color.red + '</b> Green <b>' + color.green + '</b> Blue <b>' + color.blue + '</b>';
}

function getXY() {
	var cs = getComputedStyle(planeThumb);
	var x255 = Math.round(255 * parseInt(cs.left) / plane.offsetWidth);
	var y255 = Math.round(255 - 255 * parseInt(cs.top) / plane.offsetHeight);

	return [x255, y255];
}

function updateSlider() {
	var xy = getXY();

	xy.splice(ai, 0, 255);
	var color0 = Color(xy);

	xy[ai] = 0;
	var color1 = Color(xy);

	z.style.background = 'linear-gradient(-90deg,' + color0 + ', ' + color1 + ')';
}

function updatePlane() {
	var colors = [[0,255], [255,255], [0,0], [255,0]].map(function(arr) {
	             	arr.splice(ai, 0, +z.value);
	             	return Color(arr);
	             });

	plane.style.background = 'linear-gradient(90deg, ' + colors[2] + ',' + colors[3] + ')';
	planeY.style.background = 'linear-gradient(90deg, ' + colors[0] + ',' + colors[1] + ')';
}

function dragThumb(evt) {
	var x = evt.clientX - planeRect.left;
	var y = evt.clientY - planeRect.top;

	var x255 = Math.round(255 * x / planeRect.width);
	var y255 = Math.round(255 - 255 * y / planeRect.height);

	if (x255 < 0 || x255 > 255 || y255 < 0 || y255 > 255) {
		return;
	}

	planeThumb.style.left = x + 'px';
	planeThumb.style.top = y + 'px';

	setColor([x255, y255], +z.value);
	updateSlider();
}

plane.onmousedown = function (evt) {
	dragThumb(evt);

	document.addEventListener('mousemove', dragThumb);

	document.addEventListener('mouseup', function() {
		document.removeEventListener('mousemove', dragThumb);
	});
};

updateSlider();
updatePlane();
setLabels();
setColor(getXY(), +z.value);

}, true);

$$('.color-list.slide').forEach(function(slide) {
	var colors = slide.textContent.trim().split(/\n\s+/);

	slide.textContent = '';
	slide.style.background = 'transparent';

	colors.forEach(function(name) {
		name = name.trim();

		var article = document.createElement('article');
		article.className = 'named-color';
		article.textContent = name;
		article.style.background = name;

		try {
			var color = Color(name);

			if (color.luminance < 50) {
				article.className = 'dark';
			}
		} catch(e) {}

		slide.appendChild(article);
	});
});

// HSL color picker
Inspire.on('hsl').then(function() {

var wheel = $('#hue-sat > div');

if (!wheel.offsetWidth) {
	setTimeout(arguments.callee, 10);
	return;
}

var wheelRect = wheel.getBoundingClientRect();
var thumb = $('.plane-thumb', wheel.parentNode);
var selected = $('#hsl output');
var nextSlideInput = $('#hsl + .slide input');

lightness.oninput = function () {
	updateWheel();

	var hsl = getHueSat(getXY()).concat(+lightness.value);
	setColor.apply(null, hsl);
};

function updateWheel() {
	var l = +lightness.value;

	if (l <= 50) {
		wheel.parentNode.style.background = 'transparent';
		wheel.style.opacity = l/50;
	}
	else {
		wheel.parentNode.style.background = 'white';
		wheel.style.opacity = 1 - (l-50)/50;
	}
}

function updateSlider() {
	var hs = getHueSat(getXY());

	lightness.style.backgroundColor = 'hsl(' + hs.join(',') + '%, 50%)';
}

function dragThumb(evt) {
	var x = evt.clientX - wheelRect.left;
	var y = evt.clientY - wheelRect.top;

	var hueSat = getHueSat([x,y]);

	var hue = hueSat[0];
	var saturation = hueSat[1];

	if (saturation > 100) {
		return;
	}

	thumb.style.left = x + 'px';
	thumb.style.top = y + 'px';

	setColor(hue, saturation, +lightness.value);
	updateSlider();
}

function setColor(hue, saturation, lightness) {
	var color = 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';

	thumb.style.background = selected.style.background = color;
	selected.innerHTML = 'Hue <b>' + hue + '</b> Saturation <b>' + saturation + '</b> Lightness <b>' + lightness + '</b>';

	nextSlideInput.value = color;
	nextSlideInput.oninput();
}

function getXY() {
	var cs = getComputedStyle(thumb);
	return [parseInt(cs.left), parseInt(cs.top)];
}

function getHueSat(xy) {
	var x = xy[0], y = xy[1];
	var r = wheelRect.width/2;
	var distance = Math.sqrt(Math.pow(r - x, 2) + Math.pow(r - y, 2));

	var saturation = r? 100 * distance / r : 0;

	var hue = 180 * Math.acos((x - r) / distance) / Math.PI + 180;

	if (y <= r) {
		hue = 360 - hue;
	}

	if (isNaN(hue)) {
		hue = 0;
	}

	hue = Math.round(hue);

	return [hue, Math.round(saturation)];
}

wheel.parentNode.onmousedown = function (evt) {
	dragThumb(evt);

	document.addEventListener('mousemove', dragThumb);

	document.addEventListener('mouseup', function() {
		document.removeEventListener('mousemove', dragThumb);
	});
};

updateWheel();
lightness.oninput();

});

// Luminance vs lightness demo
(function() {

var luminanceOut = $('#luminance-percentage');
var lightnessOut = $('#lightness-percentage');
var input = $('#luminance-vs-lightness input');

function compare() {
	var color = Color.fromString(input.value);
	var luminance = color.luminance;
	var lightness = color.lightness;

	luminanceOut.textContent = luminance + '%';
	lightnessOut.textContent = lightness + '%';

	luminanceOut.style.color = luminance > 50? 'black' : 'white';
	lightnessOut.style.color = lightness > 50? 'black' : 'white';

}


input.addEventListener('input', compare);

compare();

})();
