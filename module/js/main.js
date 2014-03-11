edm.ready(function () {

	//
	// MAIN LOOP
	//

	var update = function update() {
		myBg.draw();
		myShape.draw();
	};



	//
	// INIT
	//

	var myDispatcher = new PkoDispatcher();

	var myScene = new PkoScene('canvas');
	var myGestureTracker = new GestureTracker(myScene);

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
	var my3Lfo = new PkoPulseLfo({
		params: {
			amp: 1,
			freq: 1.1
		}
	});
	var myFilter = new PkoSmoothingFilter({
		params: {
			strength: 0.6
		},
		inputs: {
			source: function() { return my3Lfo.outputs.signal(); }
		}
	});
	var myLfo = new PkoSineLfo({
		inputs: {
			freq: function() { return 1.1 + my2Lfo.outputs.signal(); }
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
			r: function() { return Math.PI / 4 + 0.5*myLfo.outputs.signal(); }
		}
	});
	var myShape2 = new PkoShape({
		scene: myScene,
		params: {
			x: 330,
			y: 430,
			width: 100,
			height: 100,
			fill: '#567'
		},
		inputs: {
			r: function() { return Math.PI / 4 - myFilter.outputs.signal(); }
		}
	});

	myDispatcher.addModule(myBg);
	myDispatcher.addModule(myLfo);
	myDispatcher.addModule(my2Lfo);
	myDispatcher.addModule(my3Lfo);
	myDispatcher.addModule(myShape);
	myDispatcher.addModule(myShape2);
	myDispatcher.addModule(myFilter);
	myDispatcher.addCallback(myScene.draw);

	myScene.addToDrawList(myBg, 0);
	myScene.addToDrawList(myShape, 10);
	myScene.addToDrawList(myShape2, 50);


	// globals for debugging
	sc = myScene;
	sh = myShape;
	lfo = myLfo;
	l2 = my2Lfo;
	dis = myDispatcher;

	// myDispatcher.update(); return; // run once and stop for debugging
	myDispatcher.start();
});

