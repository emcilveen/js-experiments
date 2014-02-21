EM_utility.ready(function () {

	//
	//  GRAPHICS DEFINITIONS
	//

	var flockFill = '#789';


	//
	// GESTURES
	//

	var gestureTracker = (function () {
		var x = 0;
		var y = 0;
		var prevX = 0;
		var prevY = 0;
		var vx = 0;
		var vy = 0;
		var prevVx = 0;
		var prevVy = 0;
		var ax = 0;
		var ay = 0;
		var heading = 0;
		var prevHeading = 0;
		var vHeading = 0;
		var prevVHeading = 0;
		var aHeading = 0;

		var myUpdate = function (scene) {
			prevX = x;
			prevY = y;
			x = scene.mouseX;
			y = scene.mouseY;
			prevVx = vx;
			prevVy = vy;
			vx = x - prevX;
			vy = y - prevY;
			prevAx = ax;
			prevAy = ay;
			ax = vx - prevVx;
			ay = vy - prevVy;
		};

		return {
			update: myUpdate
		}
	} ());



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
		gestureTracker.update(this);
	}

	var myScene = new Scene('canvas');
	// myScene.startLogging();
	myScene.startAnimating(update);
});
