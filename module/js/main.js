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


	var myScene = new PkoScene('canvas');
	var myDispatcher = new PkoDispatcher(myScene);
	var myGestureTracker = new GestureTracker(myScene);

	myDispatcher.newShape({
		params: {
			width: 2000,
			height: 2000,
			fill: '#321'
		}
	});

	my2Lfo = myDispatcher.newSineLfo({
		params: {
			freq: 0.5
		}
	});
	var my3Lfo = myDispatcher.newPulseLfo({
		params: {
			amp: 1,
			freq: 1.1
		}
	});
	var myFilter = myDispatcher.newSmoothingFilter({
		params: {
			strength: 0.6
		},
		inputs: {
			source: function() { return my3Lfo.outputs.signal(); }
		}
	});
	var myLfo = myDispatcher.newSineLfo({
		inputs: {
			freq: function() { return 1.1 + my2Lfo.outputs.signal(); }
		}
	});
	myDispatcher.newShape({
		params: {
			x: 300,
			y: 400,
			z: 10,
			width: 100,
			height: 100,
			fill: '#cba'
		},
		inputs: {
			r: function() { return Math.PI / 4 + 0.5*myLfo.outputs.signal(); }
		}
	});
	myDispatcher.newShape({
		scene: myScene,
		params: {
			x: 330,
			y: 430,
			z: 4,
			width: 100,
			height: 100,
			fill: '#567'
		},
		inputs: {
			r: function() { return Math.PI / 4 - myFilter.outputs.signal(); }
		}
	});

	// globals for debugging
	sc = myScene;
	dis = myDispatcher;

	// myDispatcher.update(); return; // run once and stop for debugging
	myDispatcher.start();
});

