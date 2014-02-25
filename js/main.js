edm.ready(function () {

	//
	// MAIN LOOP
	//

	var update = function () {
		var i, j;

		myGestureTracker.update();

		for (i=1; i<myScene.numSpinners; i++) {
			for (var j=0; j<i; j++) {
				mySpinner[i].interactWithParticle(mySpinner[j]);
			}
		}

		for (i=0; i<myScene.numSpinners; i++) {
			for (j=0; j<myGestureTracker.pointer.length; j++) {
				if (myGestureTracker.pointer[j].active) {
					mySpinner[i].interactWithPointer(myGestureTracker.pointer[j]);
				}
			}
			mySpinner[i].draw();
		}
	}



	//
	// INIT
	//

	var myScene = new Scene('canvas');
	var mySpinner = [];
	var myGestureTracker = new GestureTracker(myScene);
	var i;
	var scale2 = myScene.scaleFactor * myScene.scaleFactor;

	myScene.maxSpeed = 30 * myScene.scaleFactor; // pixels per frame
	myScene.maxRotation = Math.PI / 32;
	myScene.centerSeekingForce = 20.0 * scale2;
	myScene.interactionRadius = 200 * myScene.scaleFactor;
	myScene.interactionForce = 35 * scale2;
	myScene.pointerRadius = 200 * myScene.scaleFactor;
	myScene.pointerMinRadius = 20 * myScene.scaleFactor;
	myScene.pointerForce = 20000000 * scale2;
	myScene.numSpinners = Math.ceil(myScene.screenWidth * myScene.screenHeight) * 0.0002;
	myScene.baseRadius = ((myScene.screenWidth * myScene.pixelHeight) / myScene.numSpinners) / 1000;
	myScene.spinnerFill = '#789';

	var pointer = [];

	for (var i=0; i<myScene.numSpinners; i++) {
		mySpinner[i] = new Spinner(myScene);
	}

	myGestureTracker.initMouse();
	myGestureTracker.initTouch();
	myScene.startLogging();
	myScene.startAnimating(update);

	sc = myScene; // global for debugging
	sp = mySpinner;
});
