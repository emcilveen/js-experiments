edm.ready(function () {

	//
	// MAIN LOOP
	//

	var update = function () {
		// myGestureTracker.update();

		myDispatcher.update();
		myBg.draw();
		myShape.draw();
	}



	//
	// INIT
	//

	var myDispatcher = new PkoDispatcher();

	var myScene = new Scene('canvas');
	var myGestureTracker = new GestureTracker(myScene);

	// myGestureTracker.initMouse();
	// myGestureTracker.initTouch();
	// myScene.startLogging();

	var myBg = new PkoShape(myScene);
	myBg.params.width = 2000;
	myBg.params.height = 2000;
	myBg.params.fill = '#000';

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

	myDispatcher.addModule(myBg);
	myDispatcher.addModule(myLfo);
	myDispatcher.addModule(myShape);

	myScene.startAnimating(update);

	// globals for debugging
	sc = myScene;
	sh = myShape;
	lfo = myLfo;
});
