//
// UTILITY
//

(function () {

	// MATH EXTENSIONS
	Math.TWO_PI = 2 * Math.PI;
	Math.HALF_PI = Math.PI / 2;


	// SCREEN AND CANVAS

	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	// MIT license

    // var lastTime = 0;
    // var vendors = ['ms', 'moz', 'webkit', 'o'];
    // for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    //     window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    //     window.cancelAnimationFrame =  window[vendors[x]+'CancelAnimationFrame'] ||
    //                                    window[vendors[x]+'CancelRequestAnimationFrame'];
    // }

    // if (!window.requestAnimationFrame) {
    //     window.requestAnimationFrame = function(callback, element) {
    //         var currTime = new Date().getTime();
    //         var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    //         var id = window.setTimeout(function() { callback(currTime + timeToCall); },
    //           timeToCall);
    //         lastTime = currTime + timeToCall;
    //         return id;
    //     };
    // }

    // if (!window.cancelAnimationFrame) {
    //     window.cancelAnimationFrame = function(id) {
    //         clearTimeout(id);
    //     };
    // }

} ());


var edm = (function () {

	var sampleInterval = 20;
	var sampleCount = sampleInterval;

	return {

		ready: function ready(fn) {
			if (document.addEventListener) {
				document.addEventListener('DOMContentLoaded', fn);
			} else {
				document.attachEvent('onreadystatechange', function() {
					if (document.readyState === 'interactive') { fn(); }
				});
			}
		},

		extend: function extend(destination, source) {
			if (typeof destination == 'object' && typeof source == 'object') {
				for (var prop in source) {
					destination[prop] = source[prop];
				}
			}
			return destination || {};
		},

		// after http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
		deepExtend : function deepExtend(destination, source) {
			if (typeof destination == 'object' && typeof source == 'object') {
				for (var prop in source) {
					if (source[prop] && source[prop].constructor && source[prop].constructor === Object) {
						destination[prop] = destination[prop] || {};
						arguments.callee(destination[prop], source[prop]);
					} else {
						destination[prop] = source[prop];
					}
				}
			}
			return destination || {};
		},

		// Angle of a point from the origin. 0 = positive x axis ("east")
		calcAngle: function calcAngle(x, y) {
			var angle = 0;
			if (x === 0) {
				if (y !== 0) { angle = HALF_PI; }
			} else {
				angle = Math.atan(y/x);
			}
			return (x > 0) ? angle : angle+PI;
		},

		hexToRgb: function hexToRgb(string) {
			var r=0, g=0, b=0;

			string = string.replace('#', '');

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

		rgbToHex: function rgbToHex(color) {
			var r = Math.max(0, Math.min(255, Math.floor(color.r)));
			var g = Math.max(0, Math.min(255, Math.floor(color.g)));
			var b = Math.max(0, Math.min(255, Math.floor(color.b)));
			return "#" + ("0"+r.toString(16)).slice(-2) + ("0"+g.toString(16)).slice(-2) + ("0"+b.toString(16)).slice(-2);
		},

		sample: function sample() {
			sampleCount --;
			if (sampleCount <= 0) {
				console.log(arguments);
				sampleCount = sampleInterval;
			}
		}

	};

} ());
