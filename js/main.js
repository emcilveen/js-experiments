EM_utility.ready(function () {

	//
	//  GRAPHICS DEFINITIONS
	//

	var flockFill = '#789';


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
		this.centerX = 0;
		this.centerY = 0;
		this.prevCenterX = 0;
		this.prevCenterY = 0;

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
				this.vHeadingSmoothed *= 0.3;
				this.vHeadingSmoothed += 0.7 * this.vHeading;
			}
			if (this.vHeadingSmoothed > Math.PI) { this.vHeadingSmoothed -= Math.TWO_PI; }
			else if (this.vHeadingSmoothed < -Math.PI) { this.vHeadingSmoothed += Math.TWO_PI; }
			this.aHeading = this.vHeading - this.prevVHeading;
			if (this.aHeading > Math.PI) { this.aHeading -= Math.TWO_PI; }
			else if (this.aHeading < -Math.PI) { this.aHeading += Math.TWO_PI; }

			this.radius = this.speed / this.vHeading;
			// if (this.speed == 0) {
			// 	this.centerX = this.x;
			// 	this.centerY = this.y;
			// } else {
			// 	this.centerX = this.x + (this.vy / this.vHeading);
			// 	this.centerY = this.y - (this.vx / this.vHeading);
			// }
			// EM_utility.sample(this.vHeadingSmoothed);

			this.prevCenterX = this.centerX;
			this.prevCenterY = this.centerY;
			if (this.speed != 0) {			
				var newCenterX = this.x + (this.vy / this.vHeadingSmoothed);
				var newCenterY = this.y - (this.vx / this.vHeadingSmoothed);

				if (newCenterX != NaN && newCenterX < 1000 && newCenterX > -500 && newCenterY != NaN && newCenterY < 1000 && newCenterY > -500) {
					this.centerX *= 0.7;
					this.centerY *= 0.7;
					this.centerX += 0.3 * newCenterX;
					this.centerY += 0.3 * newCenterY;
				}
			}
		};
	};



	//
	//  GAME ELEMENTS
	//

	var initGame = function () {
	};




	//
	//  USER INTERACTION
	//

	var update = function () {
		var ctx = myScene.context;

		ctx.fillStyle = '#123';
		ctx.fillRect(0, 0, myScene.pixelWidth, myScene.pixelHeight);

		myGestureTracker.update();

		ctx.fillStyle = '#fff';
		var x = myGestureTracker.centerX;
		var y = myGestureTracker.centerY;
		ctx.fillRect(x-1, myGestureTracker.y-1, 2, 2);
	}

	var myScene = new Scene('canvas');
	sc = myScene;
	var myGestureTracker = new GestureTracker(myScene);
	// myScene.startLogging();
	myScene.startAnimating(update);
});
