//
// DISPATCHER
//

// A dispatcher is the parent object for a set of modules, and calls their
// respective input, process and result methods when it's time to update.

var PkoDispatcher = function () {
	this.modules = [];
};

PkoDispatcher.prototype.update = function () {
	var i;

	for (i=this.modules.length-1; i>=0; i--) {
		this.modules[i].inputPhase.apply(this.modules[i]);
	}
	for (i=this.modules.length-1; i>=0; i--) {
		this.modules[i].processPhase.apply(this.modules[i]);
	}
	for (i=this.modules.length-1; i>=0; i--) {
		this.modules[i].resultPhase.apply(this.modules[i]);
	}
}

PkoDispatcher.prototype.addModule = function (m) {
	this.modules.push(m);
	m.dispatcher = this;
}

PkoDispatcher.prototype.removeModule = function (m) {
	for (var i=this.modules.length-1; i; i--) {
		if (this.modules[i] === m) {
			this.modules.splice(i, 1);
			return;
		}
	}
}
