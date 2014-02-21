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
		this.prevVx = 0;
		this.prevVy = 0;
		this.ax = 0;
		this.ay = 0;
		this.heading = 0;
		this.prevHeading = 0;
		this.vHeading = 0;
		this.prevVHeading = 0;
		this.aHeading = 0;

		this.update = function () {
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = this.scene.mouseX;
			this.y = this.scene.mouseY;
			this.prevVx = this.vx;
			this.prevVy = this.vy;
			this.vx = this.x - this.prevX;
			this.vy = this.y - this.prevY;
			this.ax = this.vx - this.prevVx;
			this.ay = this.vy - this.prevVy;

			this.prevHeading = this.heading;
			this.heading = Math.atan2(this.vy, this.vx);
			this.prevVHeading = this.vHeading;
			this.vHeading = this.heading - this.prevHeading;
			if (this.vHeading > Math.PI) { this.vHeading -= Math.TWO_PI; }
			else if (this.vHeading < -Math.PI) { this.vHeading += Math.TWO_PI; }
			this.aHeading = this.vHeading - this.prevVHeading;
			if (this.aHeading > Math.PI) { this.aHeading -= Math.TWO_PI; }
			else if (this.aHeading < -Math.PI) { this.aHeading += Math.TWO_PI; }

			if (this.vHeading > 0.5 || this.vHeading < -0.5) {
				console.log('whee! ' + this.vHeading);
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
		// console.log(this);
		myGestureTracker.update(this);
	}

	var myScene = new Scene('canvas');
	var myGestureTracker = new GestureTracker(myScene);
	// myScene.startLogging();
	myScene.startAnimating(update);
});
