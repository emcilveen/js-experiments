edm.ready(function () {

	//
	// MAIN LOOP
	//

	var update = function () {
		myGestureTracker.update();
		myScene.context.fillStyle = '#000';
		myScene.context.fillRect(0,0,2000,2000);

		myLfo.doUpdate();
		myShape.doUpdate();
		myLfo.doOutput();
		myShape.doOutput();

		// Draw code
	}



	//
	// INIT
	//

	var myScene = new Scene('canvas');
	var myGestureTracker = new GestureTracker(myScene);

	// myGestureTracker.initMouse();
	// myGestureTracker.initTouch();
	// myScene.startLogging();

	var myLfo = new PkoSineLfo();
	var myShape = new PkoShape(myScene);
	myShape.params.x = 300;
	myShape.params.y = 400;
	myShape.params.r = 0;
	myShape.params.width = 100;
	myShape.params.height = 100;

	myShape.inputs.r = function () {
		return Math.PI / 4 + myLfo.outputs.signal();
	}

	myScene.startAnimating(update);

	// globals for debugging
	sc = myScene;
	sh = myShape;
	lfo = myLfo;
});
