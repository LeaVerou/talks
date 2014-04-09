/*
	A class for manipulating colors
	Lea Verou - http://lea.verou.me
	MIT license
*/

(function() {

var _ = self.Color = function (red, green, blue, alpha) {
	if (!(this instanceof _)) {
		return new _(red, green, blue, alpha);
	}
	
	if (Array.isArray(arguments[0])) {
		var arr = arguments[0];
		this.rgb = arr.slice(0,3);
		alpha = arr[3] >= 0? arr[3] : arguments[1];
		
		this.alpha = alpha >= 0? alpha : 1;
	}
	else if (typeof arguments[0] == 'string') {
		var color = _.fromString(arguments[0]);

		if (color) {
			this.rgba = color.rgba;
		}
		else {
			throw TypeError(arguments[0] + ' is not a valid CSS color');
		}
	}
	else {
		this.red = red || 0;
		this.green = green || 0;
		this.blue = blue || 0;
		this.alpha = alpha !== undefined? alpha : 1;
	}
	
	return this;
};

_.prototype = {
	get rgb () {
		return [this.red, this.green, this.blue];
	},
	
	set rgb(arr) {
		this.red = arr[0];
		this.green = arr[1];
		this.blue = arr[2];
	},
	
	get rgba () {
		return this.rgb.concat(this.alpha);
	},
	
	set rgba(arr) {
		this.rgb = arr.slice(0,3);
		this.alpha = arr[3] || arr[3] === 0 ? arr[3] : 1;
	},
	
	get lightness () {
		var rgb = this.rgb.map(function(a) { return a / 2.55 });
		
		var max = Math.max.apply(Math, rgb),
		    min = Math.min.apply(Math, rgb);
			
		return Math.round((min + max)/2);
	},
	
	get luminance () {
		// Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
		var rgb = this.rgb.map(function(c) {
			c /= 255; // to 0-1 range
			
			return c < .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);
		});
		
		return Math.round(21.26 * rgb[0] + 71.52 * rgb[1] + 7.22 * rgb[2]);
	},
	
	contrast: function(color) {
		var l1 = this.luminance;
		var l2 = color.luminance;
		
		var contrast = (l1 + .05) / (l2 + .05);
		
		if (contrast < 1) {
			contrast = 1 / contrast;
		}
		
		return contrast;
	},
	
	get hsl () {
		var rgb = this.rgb.map(function(a) { return a / 2.55 });
		
		var hsl = [],
		    max = Math.max.apply(Math, rgb),
		    min = Math.min.apply(Math, rgb);
			
		hsl[2] = Math.round((min + max)/2);
		
		var d = max - min;
		
		if(d !== 0) {
			hsl[1] = Math.round(d*100 / (100 - Math.abs(2*hsl[2] - 100)));
			
			switch(max){
				case rgb[0]: hsl[0] = (rgb[1] - rgb[2]) / d + (rgb[1] < rgb[2] ? 6 : 0); break;
				case rgb[1]: hsl[0] = (rgb[2] - rgb[0]) / d + 2; break;
				case rgb[2]: hsl[0] = (rgb[0] - rgb[1]) / d + 4;
			}
			
			hsl[0] = Math.round(hsl[0]*60);
		}
		else {
			hsl[0] = 0;
			hsl[1] = 0;
		}
		
		return hsl;
	},
	
	set hsl (hsl) {
		var c = _.fromString('hsl(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%)');
		
		this.rgb = c.rgb;
	},
	
	// Euclidean distance of the two colors in the RGB cube
	distance: function (color) {
		var dr = this.red - color.red;
		var dg = this.green - color.green;
		var db = this.blue - color.blue;
		
		return Math.sqrt(dr*dr + dg*dg + db*db);
	},
	
	get maxDistance () {
		var rgb = this.rgb;
		
		rgb = rgb.map(function(c) {
			return c < 127.5? 255 : 0;
		});
		
		var farthest = new _(rgb);
		
		return this.distance(new _(rgb));
	},
	
	toString: function () {
		return (this.alpha < 1? 'rgba(' + this.rgba.join(',') : 'rgb(' + this.rgb.join(',')) + ')';
	},
	
	clone: function () {
		return _(this.rgba);
	},
	
	// A number 0-1 representing how close we are to the current color
	proximity: function (color) {
		var maxDistance = this.maxDistance;
		var distance = this.distance(color);
		
		return 1 - distance/maxDistance;
	},
	
	mix: function (color, weight) {
		weight = weight || weight === 0? weight : .5;
		
		var rgba = this.rgba.map(function(c, i) {
			c = c * weight + color.rgba[i] * (1 - weight);
			
			return i < 3? Math.round(c) : c;
		});
		
		return _(rgba);
	},
	
	// The over Porter-Duff operator
	over: function (dest) {
		var source = this.clone();
		
		if (source.alpha < 1) {
			source.rgb = source.rgb.map(function (c,i) {
				return Math.round(c * source.alpha + dest.rgb[i] * dest.alpha * (1 - source.alpha));
			});
			
			source.alpha += dest.alpha * (1 - source.alpha);
			
		}
		
		return source;
	},
	
	multiply: function (dest) {
		var destRGB = dest.rgb;
		
		var rgb = this.rgb.map(function(c, i) {
			return (c * destRGB[i]) / 255;
		});

		return _(rgb);
	}
};

_.fromString = function(str) {
	var dummy = document.createElement('div');
	dummy.style.color = str;
	
	// Is the syntax valid?
	if (!dummy.style.color) {
		// Is it a CSS Color Level 4 color format?
		return _.css4Color(str);
	}
	
	document.head.appendChild(dummy);
	
	var normalized = getComputedStyle(dummy).color;
	
	document.head.removeChild(dummy);
	
	if (!normalized) {
		return null;
	}
	
	if (normalized === 'transparent') {
		return _(0, 0, 0, 0);
	}
	
	var rgba = normalized
	               .match(/[\d.]+(?=,|\))/g)
	               .map(function(c) { return +c });

	rgba[3] = rgba[3] >= 0? Math.round(+rgba[3]*100)/100 : 1; // Fix for precision issues
	
	return _(rgba);
};

_.css4Color = function (str) {
	str = str.trim();
	
	var gray = str.match(/^gray\(([\d]+%)(?:,\s*([\d.]+))?\)$/);
	
	if (gray) {
		var rgb = gray[1], alpha = gray[2];
		return _('rgb' + (alpha? 'a' : '') + '(' + rgb + ',' + rgb + ',' + rgb + (alpha? ',' + alpha : '') + ')');
	}
	
	if (/^#([a-f\d]{4}){1,2}$/i.test(str)) {
		var hexRGB = str.slice(1)
		                .match(RegExp('.{1,' + (str.length == 5? 1 : 2) + '}', 'g'))
		                .map(function(c) {
		                	if (c.length == 1) {
		                		c += c;
		                	}
		                	
		                	return parseInt(c, 16);
		                });
		
		if (hexRGB.length == 4) {
			hexRGB[3] /= 255;
		}
		
		return _(hexRGB);
	}
	
	var hwb = str.match(/^hwb\(([\d\s%deg.,]+)\)$/);

	if (hwb) {
		hwb = hwb[1].split(/\s*,\s*/).map(function(c) {
			if (c.indexOf('%') > -1) {
				return parseFloat(c) / 100;
			}
			
			return +c;
		});
		
		if (hwb[1] + hwb[2] > 1) {
			var factor = 1/(hwb[1] + hwb[2]);
			
			hwb[1] *= factor;
			hwb[2] *= factor;
		}
		
		var rgb = _.fromString('hsl(' + hwb[0] + ',100%,50%)').rgb.map(function (c) {
			c /= 255;

			return Math.round(255 * (c * (1 - hwb[1] - hwb[2]) + hwb[1]));
		});
		
		if (hwb.length > 3) {
			rgb[3] = hwb[3];
		}
		
		return _(rgb);
	}
	
	var color = str.match(/^color\((.+?)\)$/i);
	
	if (color) {
		var adjusters = color[1].trim().split(/\s+(?=[a-z]+\()/);
		var base = _.fromString(adjusters.shift());
		
		if (!base) {
			return null;
		}
		
		adjusters = adjusters.map(function(adjuster) {
			var parts = adjuster.match(/^([a-z]+)\((.+?)\)/);
			var name = parts[1];
			var param = parts[2];
			
			switch (name) {
				case 'tint':
					var p = parseInt(param)/100;
					base = Color.WHITE.mix(base, p);
					break;
				case 'shade':
					var p = parseInt(param)/100;
					base = Color.BLACK.mix(base, p);
					break;
				case 'blend':
					var p = param.split(/\s+/);
					
					if (p.length < 2) {
						base = null;
						return;
					}
					
					base = base.mix(Color(p[0]), 1 - parseInt(p[1])/100);
			}
			
			return {
				name: name,
				param: param
			};
		});
		
		return base;
	}
	
	// TODO implement color()
	
	return null;
};

_.WHITE = new _(255,255,255);
_.BLACK = new _(0,0,0);

})();

