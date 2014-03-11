edm.ready(function () {

	//
	// INIT
	//

	scn = new PkoScene('canvas');
	dis = new PkoDispatcher(scn);
	myGestureTracker = new GestureTracker(scn);

	myBg = new PkoShape(dis, scn, 0, {
		params: {
			width: 2000,
			height: 2000,
			fill: '#321'
		}
	});

	my2Lfo = new PkoSineLfo(dis, {
		params: {
			freq: 0.5
		}
	});
	my3Lfo = new PkoPulseLfo(dis, {
		params: {
			amp: 1,
			freq: 1.1
		}
	});
	myFilter = new PkoSmoothingFilter(dis, {
		params: {
			strength: 0.6
		},
		inputs: {
			source: function() { return my3Lfo.outputs.signal(); }
		}
	});
	myLfo = new PkoSineLfo(dis, {
		inputs: {
			freq: function() { return 1.1 + my2Lfo.outputs.signal(); }
		}
	});
	sq1 = new PkoShape(dis, scn, 10, {
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
	sq2 = new PkoShape(dis, scn, 2, {
		params: {
			x: 330,
			y: 430,
			originX: -50,
			originY: -50,
			width: 100,
			height: 100,
			fill: '#567'
		},
		inputs: {
			r: function() { return Math.PI / 4 - myFilter.outputs.signal(); }
		}
	});

	// dis.update(); return; // run once and stop for debugging
	dis.start();
});

