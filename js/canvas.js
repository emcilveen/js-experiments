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

	this.logActive = false;
	this.logText = [];
	this.logMaxEntries = 10;
	this.logLeft = 10;
	this.logTop = 30;
	this.logLineHeight = 30;
	this.logColor = '#888';
	this.logFont = '20px serif';
	this.logBaseline = 'bottom';

	this.logDraw = function () {
		if (this.logActive) {
			this.context.fillStyle = this.logColor;
			this.context.font = this.logFont;
			this.context.textBaseline = this.logBaseline;
			for (var i=0; i<this.logText.length; i++) {
				this.context.fillText(this.logText[i], this.logLeft, this.logTop + this.logLineHeight*i);
			}
		}
	};

	this.draw = function () {
		window.requestAnimationFrame(self.draw);
		self.context.fillStyle = self.bgColor;
		self.context.fillRect(0, 0, self.pixelWidth, self.pixelHeight);
		self.drawCallback.apply();
		self.logDraw();
	};


	//
	// MOUSE
	//

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

	this.initMouse = function () {
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



	// PUBLIC METHODS

	// Write debugging log to canvas -- call from animation draw loop.
	this.log = function () {
		var text = '';

		for (var i=0; i<arguments.length; i++) {
			text += arguments[i].toString() + ' ';
		}
		this.logText.push(text);
		if (this.logText.length > this.logMaxEntries) {
			this.logText.shift();
		}
	};

	this.startLogging = function () {
		this.logActive = true;
	};

	this.stopLogging = function () {
		this.logActive = false;
	};

	this.startAnimating = function (callback) {
		this.drawCallback = callback;
		this.draw();
	};

	this.stopAnimating = function () {
		this.animating = false;
	};

	this.initMouse();
};
