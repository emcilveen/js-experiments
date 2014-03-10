//
// SCENE
//

var PkoScene = function (id) {
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
	this.scale = Math.sqrt(this.pixelWidth * this.pixelHeight) * 0.0008;
	this.context = this.canvas.getContext('2d');

	this.drawListObject = [];
	this.drawListZIndex = [];

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

	this.draw = function draw() {
		// for (var i=self.drawListObject.length-1; i>=0; i--) {
		for (var i=0; i<self.drawListObject.length; i++) {
			self.drawListObject[i].draw.apply(self);
		}
	};
};



//
// DRAW LIST
//

// Newest module sharing a z-index goes on top (after)
PkoScene.prototype.addToDrawList = function addToDrawList(m, zIndex) {
	var p; // position under consideration
	var floor = 0;
	var ceiling = this.drawListObject.length;

	zIndex = zIndex || 0;

	if (this.drawListObject.indexOf(m) < 0) {
		while (ceiling > floor) {
			p = Math.floor((ceiling + floor) * 0.5);
			if (zIndex >= this.drawListZIndex[p]) {
				floor = p + 1;
			} else if (zIndex < this.drawListZIndex[p]) {
				ceiling = p;
			}
		}

		this.drawListObject.splice(floor, 0, m);
		this.drawListZIndex.splice(floor, 0, zIndex);
		return true;
	}
	return false;
};

PkoScene.prototype.removeFromDrawList = function removeFromDrawList(m) {
	var i = this.drawListObject.indexOf(m);
	if (i >= 0) {
		this.drawListObject.splice(i, 1);
		this.drawListZIndex.splice(i, 1);
		return true;
	}
	return false;
};

PkoScene.prototype.changeZIndex = function changeZIndex(m, zIndex) {
	if (this.removeFromDrawList(m)) {
		this.addToDrawList(m, zIndex);
		return true;
	}
	return false;
};


//
// LOGGING
//

// Write debugging log to canvas -- call from animation draw loop.
PkoScene.prototype.logDraw = function logDraw() {
	if (this.logActive) {
		this.context.fillStyle = this.logColor;
		this.context.font = this.logFont;
		this.context.textBaseline = this.logBaseline;
		for (var i=0; i<this.logText.length; i++) {
			this.context.fillText(this.logText[i], this.logLeft, this.logTop + this.logLineHeight*i);
		}
	}
};

PkoScene.prototype.log = function log() {
	var text = '';

	for (var i=0; i<arguments.length; i++) {
		text += arguments[i].toString() + ' ';
	}
	this.logText.push(text);
	if (this.logText.length > this.logMaxEntries) {
		this.logText.shift();
	}
};

PkoScene.prototype.startLogging = function startLogging() {
	this.logActive = true;
};

PkoScene.prototype.stopLogging = function stopLogging() {
	this.logActive = false;
};


//
// MAIN LOOP
//



