(function () {
	// SCREEN AND CANVAS

	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	// MIT license

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
} ());


var Scene = function (id) {
	var self = this;

	this.id = id;
	this.canvas = document.getElementById(id);
	this.context = this.canvas.getContext('2d');

	var element = this.canvas;
	this.canvasLeft = 0;
	this.canvasTop = 0;
	if (element.offsetParent !== undefined) {
		do {
			this.canvasLeft += element.offsetLeft;
			this.canvasTop += element.offsetTop;
		} while ((element = element.offsetParent));
	}

	this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
	this.screenHeight = window.innerHeight|| document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;


	this.scaleFactor = 1;
	if (('devicePixelRatio' in window) && (window.devicePixelRatio > 1)) {
        this.scaleFactor = window.devicePixelRatio;
    }
	this.pixelWidth = this.screenWidth * this.scaleFactor;
	this.pixelHeight = this.screenHeight * this.scaleFactor;
	this.centerX = this.pixelWidth / 2;
	this.centerY = this.pixelHeight / 2;

	this.canvas.width = this.pixelWidth;
	this.canvas.height = this.pixelHeight;
	this.canvas.style.width = this.screenWidth + 'px';
	this.canvas.style.height = this.screenHeight + 'px';

	this.context = this.canvas.getContext('2d');

	this.bgColor = '#123';

	this.drawCallback = function () {};


	// LOGGING

	this.logActive = false;
	this.logText = [];
	this.logMaxEntries = 10;
	this.logLeft = 10;
	this.logTop = 30;
	this.logLineHeight = 30;
	this.logColor = '#888';
	this.logFont = '20px serif';
	this.logBaseline = 'bottom';


	// MOUSE

	this.mouseX = 0, this.mouseY = 0;
	this.click = {
		primary: false,
		secondary: false,
		x: 0,
		y: 0,
		relAngle: 0
	};

	this.handleMouseDown = function (e) {
		e.preventDefault();
		if (e.which > 1) {
			self.click.secondary = true;
		} else {
			self.click.primary = true;
		}
		self.mouseX = self.scaleFactor * (e.pageX - self.canvasLeft);
		self.mouseY = self.scaleFactor * (e.pageY - self.canvasTop);
	};

	this.handleMouseMove = function (e) {
		e.preventDefault();
		self.mouseX = self.scaleFactor * (e.pageX - self.canvasLeft);
		self.mouseY = self.scaleFactor * (e.pageY - self.canvasTop);
	};

	this.handleMouseUp = function (e) {
		e.preventDefault();
		if (e.which > 1) {
			self.click.secondary = false;
		} else {
			self.click.primary = false;
		}
		self.mouseX = self.scaleFactor * (e.pageX - self.canvasLeft);
		self.mouseY = self.scaleFactor * (e.pageY - self.canvasTop);
	};


	// TOUCH
	// See https://developer.mozilla.org/en-US/docs/DOM/Touch_events#Example

	this.trackingTouches = [];
	this.touchCount = 0;

	this.getCurrentTouchIndex = function (idToFind) {
		for (var i=0; i<self.trackingTouches.length; i++) {
			var id = self.trackingTouches[i].identifier;
			if (id === idToFind) {
				return i;
			}
		}
		return -1;
	}

	this.handleTouchStart = function (e) {
		e.preventDefault();
		var touches = e.changedTouches;
		var sumX=0, sumY=0;
		var count = 0;
self.log(self.trackingTouches, self.touchCount);

		if (self.trackingTouches.length === 0) {
			for (var i=0; i<touches.length; i++) {
				sumX += touches[i].pageX;
				sumY += touches[i].pageY;
				self.trackingTouches.push(touches[i]);
				count++;
			}
			self.mouseX = self.scaleFactor * sumX / count - self.canvasLeft;
			self.mouseY = self.scaleFactor * sumY / count - self.canvasTop;
		}
		self.touchCount = e.touches.length;
	}

	this.handleTouchMove = function (e) {
		e.preventDefault();
		var touches = e.touches;
		var sumX=0, sumY=0;
		var count = 0;

		for (var i=0; i<touches.length; i++) {
			var index = getCurrentTouchIndex(touches[i].identifier);
			if (index >= 0) {
				sumX += touches[index].pageX - self.canvasLeft;
				sumY += touches[index].pageY;
				count++;
			}
		}
		if (count > 0) {
			self.mouseX = self.scaleFactor * sumX / count - self.canvasLeft;
			self.mouseY = self.scaleFactor * sumY / count - self.canvasTop;
			self.log(self.mouseX, self.mouseY);
		}
		self.touchCount = e.touches.length;
	}

	this.handleTouchEnd = function (e) {
		e.preventDefault();
		var touches = e.changedTouches;
		
		for (var i=0; i<touches.length; i++) {
			var index = getCurrentTouchIndex(touches[i].identifier);
			self.trackingTouches.splice(index, 1);
		}
		self.touchCount = e.touches.length;
	}


	// DRAW LOOP

	this.draw = function () {
		window.requestAnimationFrame(self.draw);
		self.context.fillStyle = self.bgColor;
		self.context.fillRect(0, 0, self.pixelWidth, self.pixelHeight);
		self.drawCallback.apply();
		self.logDraw();
	};
}



//
// MOUSE
//

Scene.prototype.initMouse = function () {
	window.addEventListener('mousedown', this.handleMouseDown, false);
	window.addEventListener('mousemove', this.handleMouseMove, false);
	window.addEventListener('mouseup', this.handleMouseUp, false);
	window.addEventListener('contextmenu', function (e) {
		e.preventDefault(); return false;
	}, false);
	window.addEventListener('mousewheel', function (e) {
		e.preventDefault(); return false;
	}, false);
};

Scene.prototype.initTouch = function () {
	window.addEventListener('touchstart', this.handleTouchStart, false);
	window.addEventListener('touchmove', this.handleTouchMove, false);
	window.addEventListener('touchend', this.handleTouchEnd, false);
	window.addEventListener('touchcancel', this.handleTouchEnd, false);
}



//
// LOGGING
//

// Write debugging log to canvas -- call from animation draw loop.
Scene.prototype.logDraw = function () {
	if (this.logActive) {
		this.context.fillStyle = this.logColor;
		this.context.font = this.logFont;
		this.context.textBaseline = this.logBaseline;
		for (var i=0; i<this.logText.length; i++) {
			this.context.fillText(this.logText[i], this.logLeft, this.logTop + this.logLineHeight*i);
		}
	}
};

Scene.prototype.log = function () {
	var text = '';

	for (var i=0; i<arguments.length; i++) {
		text += arguments[i].toString() + ' ';
	}
	this.logText.push(text);
	if (this.logText.length > this.logMaxEntries) {
		this.logText.shift();
	}
};

Scene.prototype.startLogging = function () {
	this.logActive = true;
};

Scene.prototype.stopLogging = function () {
	this.logActive = false;
};

Scene.prototype.startAnimating = function (callback) {
	this.drawCallback = callback;
	this.draw();
};

Scene.prototype.stopAnimating = function () {
	this.animating = false;
};

