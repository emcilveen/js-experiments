//
// DISPATCHER
//

// A dispatcher is the parent object for a set of modules, and calls their
// respective input, process and result methods when it's time to update.
// It also maintains a list of generic callbacks.

var PkoDispatcher = function PkoDispatcher(scene) {
	var self = this;

	this.scene = scene;
	this.modules = [];
	this.callbacks = [];
	this.animating = false;
	this.cycle = 0;
	this.addCallback(scene.draw);

	this.update = function update() {
		var i;

		if (self.animating) {
			window.requestAnimationFrame(self.update);

			for (i=0; i<self.modules.length; i++) {
				self.modules[i].inputPhase.apply(self.modules[i]);
			}
			for (i=0; i<self.modules.length; i++) {
				self.modules[i].processPhase.apply(self.modules[i]);
			}
			for (i=0; i<self.modules.length; i++) {
				self.modules[i].resultPhase.apply(self.modules[i]);
			}
			for (i=0; i<self.callbacks.length; i++) {
				self.callbacks[i].apply();
			}
		}

		self.cycle ++;
	};
};


// MODULES

PkoDispatcher.prototype.addModule = function addModule(m) {
	if (this.modules.indexOf(m) < 0) {
		this.modules.push(m);
		m.dispatcher = this;
	}
};

PkoDispatcher.prototype.removeModule = function removeModule(m) {
	var i = this.modules.indexOf(m);
	if (i >= 0) {
		this.modules.splice(i, 1);
	}
};


// GENERIC CALLBACKS

PkoDispatcher.prototype.addCallback = function addCallback(fn) {
	if (this.callbacks.indexOf(fn) < 0) {
		this.callbacks.push(fn);
	}
};

PkoDispatcher.prototype.removeCallback = function removeCallback(fn) {
	var i = this.callbacks.indexOf(fn);
	if (i >= 0) {
		this.callbacks.splice(i, 1);
	}
};


// UPDATE

PkoDispatcher.prototype.start = function start() {
	this.animating = true;
	this.update();
};

PkoDispatcher.prototype.stop = function stop() {
	this.animating = false;
};
