edm.ready(function () {

	//
	// PARTICLES
	//

	var maxSpeed = 10; // pixels per frame
	var maxRotation = Math.PI / 16;
	var interactionRadius = 200;
	var userRadius = 200;

	var Particle = function (scene) {
		this.scene = scene;
		this.x = scene.pixelWidth * Math.random();
		this.y = scene.pixelHeight * Math.random();
		this.r = Math.TWO_PI * Math.random();
		this.vx = maxSpeed * Math.random() - maxSpeed*0.5;
		this.vy = maxSpeed * Math.random() - maxSpeed*0.5;
		this.vr = maxRotation*2 * Math.random() -maxRotation;
		this.speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
		this.ax = 0;
		this.ay = 0;
		this.ar = 0;
	}

	Particle.prototype.update = function () {
		var scale;

		this.vx += this.ax;
		this.vy += this.ay;
		this.speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
		if (this.speed > maxSpeed) {
			scale = maxSpeed / this.speed;
			this.vx *= scale;
			this.vy *= scale;
		}
		this.vr += this.ar;
		if (this.vr > maxRotation) {
			this.vr = maxRotation;
		} else if (this.vx < -maxRotation) {
			this.vr = -maxRotation;
		}
		this.x += this.vx;
		this.y += this.vy;
		this.r += this.vr;
		this.ax = 0;
		this.ay = 0;
		this.ar = 0;
	}

	Particle.prototype.draw = function () {
		this.update();
		ctx = this.scene.context;
		ctx.fillStyle = '#fff';

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.fillRect(-1, -1, 2, 2);
		ctx.restore();
	}

	//
	// SPINNERS
	//

	var numSpinners = 40;
	var mySpinner = [];
	var spinnerFill = '#789';

	var Spinner = function (scene) {
		Particle.call(this, scene);
		var color = edm.hexToRgb(spinnerFill);
		color.r += Math.random() * 80 - 40;
		color.g += Math.random() * 20 - 10;
		color.b += Math.random() * 40 - 20;
		this.fill = edm.rgbToHex(color);

		this.innerRadius = (1 + 2 * Math.random()) * (scene.pixelWidth/numSpinners)/2;
		this.outerRadius = (3 + 4 * Math.random()) * (scene.pixelWidth/numSpinners)/2;
		this.following = -1;
	}

	Spinner.prototype = Object.create(Particle.prototype);
	Spinner.prototype.constructor = Spinner;

	Spinner.prototype.draw = function () {
		this.update();
		ctx = this.scene.context;
		ctx.fillStyle = this.fill;

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.r);
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
		var mouse = 0;

		myGestureTracker.update();

		for (var i=0; i<numSpinners; i++) {
			if (mySpinner[i].following == mouse) {
				mySpinner[i].vr *= 0.9;
				mySpinner[i].vr += 0.1 * myGestureTracker.vHeadingSmoothed;
			}
			if (Math.random() < 0.01) {
				// mySpinner[i].following = -1 - mySpinner[i].following;
			}
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

	myScene.initMouse();
	myScene.initTouch();
	myScene.startLogging();
	myScene.startAnimating(update);

	sc = myScene; // global for debugging
	sp = mySpinner;
});
