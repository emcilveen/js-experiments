edm.ready(function () {

	//
	// MAIN LOOP
	//

	var update = function () {
		myGestureTracker.update();

		// Draw code
	}



	//
	// INIT
	//

	var myScene = new Scene('canvas');
	var myGestureTracker = new GestureTracker(myScene);

	myGestureTracker.initMouse();
	myGestureTracker.initTouch();
	myScene.startLogging();
	myScene.startAnimating(update);

	// globals for debugging
	sc = myScene;
	sp = mySpinner;
});
