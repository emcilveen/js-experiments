(function () {
    // MATH EXTENSIONS

	Math.TWO_PI = 2 * Math.PI;
	Math.HALF_PI = Math.PI / 2;
} ());



//
// UTILITY
//

var edm = (function () {

//	var myPrivateVar = 0; 
//	myPrivateMethod = function(foo) { console.log(foo); };
	var sampleInterval = 20;
	var sampleCount = sampleInterval;

	return {
 
	    // PUBLIC VARIABLES



		// PUBLIC METHODS

		ready: function (fn) {
			if (document.addEventListener) {
		    	document.addEventListener('DOMContentLoaded', fn);
			} else {
				document.attachEvent('onreadystatechange', function() {
					if (document.readyState === 'interactive')
						fn();
		    	});
			}
		},
	 
		extend: function (extension, destination) {
			for ( var prop in extension ){
				destination[prop] = extension[prop];
			}
		},

		//  Angle of a point from the origin. 0 = positive x axis ("east")
		calcAngle: function (x, y) {
			var angle = 0;
			if (x === 0) {
				if (y !== 0) { angle = HALF_PI; }
			} else {
				angle = Math.atan(y/x);
			}
			return (x > 0) ? angle : angle+PI;
		},

		hexToRgb: function (string) {
			var string = string.replace('#', '');

			var r=0, g=0, b=0;

			if (string.length === 3) {
				r = parseInt(string.slice(0,1), 16);
				r += r * 16;
				g = parseInt(string.slice(1,2), 16);
				g += g * 16;
				b = parseInt(string.slice(2,3), 16);
				b += b * 16;
			} else if (string.length === 6) {
				r = parseInt(string.slice(0,2), 16);
				g = parseInt(string.slice(2,4), 16);
				b = parseInt(string.slice(4,6), 16);
			}

			return {"r": r, "g": g, "b": b};
		},

		rgbToHex: function (color) {
			var r = Math.max(0, Math.min(255, Math.floor(color.r)));
			var g = Math.max(0, Math.min(255, Math.floor(color.g)));
			var b = Math.max(0, Math.min(255, Math.floor(color.b)));
			return ("0"+r.toString(16)).slice(-2) + ("0"+g.toString(16)).slice(-2) + ("0"+b.toString(16)).slice(-2);
		},

		sample: function () {
			sampleCount --;
			if (sampleCount <= 0) {
				console.log(arguments);
				sampleCount = sampleInterval;
			}
		}

	};
 
} ());