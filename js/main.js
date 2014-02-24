EM_utility.ready(function () {

	//
	// SPINNERS
	//

	var numSpinners = 40;
	var mySpinner = [];
	var spinnerFill = '#789';

	var Spinner = function (scene) {
		var color = EM_utility.hexToRgb(spinnerFill);
		color.r += Math.random() * 80 - 40;
		color.g += Math.random() * 20 - 10;
		color.b += Math.random() * 40 - 20;

		this.scene = scene;
		this.x = scene.pixelWidth * Math.random();
		this.y = scene.pixelHeight * Math.random();
		this.rotation = Math.TWO_PI * Math.random();
		this.rotationSpeed = Math.random() * 0.04 - 0.02;
		this.innerRadius = 10 + 20 * Math.random();
		this.outerRadius = 30 + 40 * Math.random();
		this.fill = EM_utility.rgbToHex(color);
	}

	Spinner.prototype.draw = function () {
		this.rotation += this.rotationSpeed;
		ctx = this.scene.context;
		ctx.fillStyle = this.fill;

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);
		ctx.beginPath();
		ctx.moveTo(this.innerRadius, 0);
		for (var i=0; i<4; i++) {
			ctx.rotate(Math.PI/5);
			ctx.lineTo(this.outerRadius, 0);
			ctx.rotate(Math.PI/5);
			ctx.lineTo(this.innerRadius, 0);
		}
		ctx.rotate(Math.PI/5);
		ctx.lineTo(this.outerRadius, 0);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}


	//
	// GESTURES
	//

	var GestureTracker = function (scene) {
		this.scene = scene;
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

		this.update = function () {
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = this.scene.mouseX;
			this.y = this.scene.mouseY;
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
	};



	//
	// MAIN LOOP
	//

	var update = function () {
		myGestureTracker.update();

		for (var i=0; i<numSpinners; i++) {
			mySpinner[i].draw();
		}
	}



	//
	// INIT
	//

	var myScene = new Scene('canvas');
	var myGestureTracker = new GestureTracker(myScene);
	for (var i=0; i<numSpinners; i++) {
		mySpinner[i] = new Spinner(myScene);
	}

	myScene.startLogging();
	myScene.startAnimating(update);

	sc = myScene;
});
