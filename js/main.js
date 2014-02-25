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
			if (myGestureTracker.pointer[0].active) {
				mySpinner[i].interactWithPointer(myGestureTracker.pointer[0]);
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

	myScene.maxSpeed = 20; // pixels per frame
	myScene.maxRotation = Math.PI / 32;
	myScene.centerSeekingForce = 10.0;
	myScene.interactionRadius = 200;
	myScene.interactionForce = 15;
	myScene.pointerRadius = 300;
	myScene.pointerForce = 2000000;
	myScene.numSpinners = Math.ceil(myScene.screenWidth * myScene.screenHeight) * 0.0003;
	myScene.baseRadius = ((myScene.pixelWidth * myScene.pixelHeight) / myScene.numSpinners) / 1000;
	myScene.spinnerFill = '#789';

	var pointer = [];

	for (var i=0; i<myScene.numSpinners; i++) {
		mySpinner[i] = new Spinner(myScene);
	}


	myGestureTracker.initMouse();
	// myScene.initTouch();
	myScene.startLogging();
	myScene.startAnimating(update);

	sc = myScene; // global for debugging
	sp = mySpinner;
});
