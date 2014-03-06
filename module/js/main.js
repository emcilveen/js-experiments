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

	var myBg = new PkoShape({
		scene: myScene,
		params: {
			width: 2000,
			height: 2000,
			fill: '#321'
		}
	});

	var my2Lfo = new PkoSineLfo({
		params: {
			freq: 0.5
		}
	});
	var myLfo = new PkoSineLfo({
		inputs: {
			freq: function () { return 1.1 + my2Lfo.outputs.signal(); }
		}
	});

	var myShape = new PkoShape({
		scene: myScene,
		params: {
			x: 300,
			y: 400,
			width: 100,
			height: 100,
			fill: '#cba'
		},
		inputs: {
			r: function () { return Math.PI / 4 + myLfo.outputs.signal(); }
		}
	});

	myDispatcher.addModule(myBg);
	myDispatcher.addModule(myLfo);
	myDispatcher.addModule(my2Lfo);
	myDispatcher.addModule(myShape);

	// globals for debugging
	sc = myScene;
	sh = myShape;
	lfo = myLfo;
	l2 = my2Lfo;
	dis = myDispatcher;

	// update(); return;
	myScene.startAnimating(update);
});
