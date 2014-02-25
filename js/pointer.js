//
// GESTURES
//

var Pointer = function (scene) {
	this.scene = scene;
	this.active = false;
	this.identifier = null;
	this.x = 0;
	this.y = 0;
	this.prevX = 0;
	this.prevY = 0;
	this.vx = 0;
	this.vy = 0;
	this.speed = 0;
	this.prevVx = 0;
	this.prevVy = 0;
	this.ax = 0;
	this.ay = 0;
	this.heading = NaN;
	this.prevHeading = 0;
	this.vHeading = 0;
	this.prevVHeading = 0;
	this.vHeadingSmoothed = 0;
	this.aHeading = 0;
	this.radius = NaN;
};

Pointer.prototype.update = function () {
	this.prevX = this.x;
	this.prevY = this.y;
	this.prevVx = this.vx;
	this.prevVy = this.vy;
	this.vx = this.x - this.prevX;
	this.vy = this.y - this.prevY;
	this.speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
	this.ax = this.vx - this.prevVx;
	this.ay = this.vy - this.prevVy;
	this.accel = Math.sqrt(this.ax*this.ax + this.ay*this.ay);

	this.prevHeading = this.heading;
	this.heading = Math.atan2(this.vy, this.vx);
	this.prevVHeading = this.vHeading;
	this.vHeading = this.heading - this.prevHeading;
	if (this.vHeading > Math.PI) { this.vHeading -= Math.TWO_PI; }
	else if (this.vHeading < -Math.PI) { this.vHeading += Math.TWO_PI; }
	if (! isNaN(this.vHeading)) {
		this.vHeadingSmoothed *= 0.5;
		this.vHeadingSmoothed += 0.5 * this.vHeading;
	}
	if (this.vHeadingSmoothed > Math.PI) { this.vHeadingSmoothed -= Math.TWO_PI; }
	else if (this.vHeadingSmoothed < -Math.PI) { this.vHeadingSmoothed += Math.TWO_PI; }
	this.aHeading = this.vHeading - this.prevVHeading;
	if (this.aHeading > Math.PI) { this.aHeading -= Math.TWO_PI; }
	else if (this.aHeading < -Math.PI) { this.aHeading += Math.TWO_PI; }

	this.radius = this.speed / this.vHeading;
};


var GestureTracker = function (scene) {
	var self = this;

	this.scene = scene;
	this.pointer = [];

	// MOUSE

	this.handleMouseDown = function (e) {
		e.preventDefault();
		if (e.which == 1) {
			self.pointer[0].active = true;
		}
		self.pointer[0].x = self.scene.scaleFactor * (e.pageX - self.scene.canvasLeft);
		self.pointer[0].y = self.scene.scaleFactor * (e.pageY - self.scene.canvasTop);
	};

	this.handleMouseMove = function (e) {
		e.preventDefault();
		if (self.pointer[0].active) {
			self.pointer[0].x = self.scene.scaleFactor * (e.pageX - self.scene.canvasLeft);
			self.pointer[0].y = self.scene.scaleFactor * (e.pageY - self.scene.canvasTop);
// console.log(self.pointer[0]);
		}
	};

	this.handleMouseUp = function (e) {
		e.preventDefault();
		if (e.which == 1) {
			self.pointer[0].active = false;
		}
	};


	// TOUCH
	// See https://developer.mozilla.org/en-US/docs/DOM/Touch_events#Example

	this.getCurrentTouchIndex = function (idToFind) {
		for (var i=0; i<self.pointer.length; i++) {
			var id = self.pointer[i].identifier;
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
self.log(self.pointer, self.pointerCount);

		if (self.pointer.length === 0) {
			for (var i=0; i<touches.length; i++) {
				sumX += touches[i].pageX;
				sumY += touches[i].pageY;
				self.pointer.push(touches[i]);
				count++;
			}
			self.mouseX = self.scene.scaleFactor * sumX / count - self.canvasLeft;
			self.mouseY = self.scene.scaleFactor * sumY / count - self.canvasTop;
		}
		self.pointerCount = e.touches.length;
	}

	this.handleTouchMove = function (e) {
		e.preventDefault();
		var sumX=0, sumY=0;
		var count = 0;

		for (var i=0; i<e.touches.length; i++) {
			var index = getCurrentTouchIndex(e.touches[i].identifier);
			if (index >= 0) {
				self.pointer[index].x = e.touches[index].pageX - self.canvasLeft;
				self.pointer[index].y = e.touches[index].pageY - self.canvasTop;
				count++;
			}
		}
		self.pointerCount = e.touches.length;
	}

	this.handleTouchEnd = function (e) {
		e.preventDefault();
		var touches = e.changedTouches;

		for (var i=0; i<touches.length; i++) {
			var index = getCurrentTouchIndex(touches[i].identifier);
			self.pointer.splice(index, 1);
		}
		self.pointerCount = e.touches.length;
	}
};

GestureTracker.prototype.update = function () {
	for (var i=0; i<this.pointer.length; i++) {
		this.pointer[i].update();
	}
}

GestureTracker.prototype.initMouse = function () {
	this.pointer.push(new Pointer(this.scene));

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

GestureTracker.prototype.initTouch = function () {
	window.addEventListener('touchstart', this.handleTouchStart, false);
	window.addEventListener('touchmove', this.handleTouchMove, false);
	window.addEventListener('touchend', this.handleTouchEnd, false);
	window.addEventListener('touchcancel', this.handleTouchEnd, false);
}

