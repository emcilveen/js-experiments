//
// MODULES
//

var PkoModule = function (scene) {
	// functions mapped to parameters; should have the same set of keys as params, below
	this.sources = {};

	 // latest values copied from sources (these stay constant, if function is missing)
	 this.inputs = {};

	// public output functions;
	// for efficiency should generally be simple getter method, with processing done by actionPhase()
	this.outputs = {};
};

PkoModule.prototype.inputPhase = function () {
	for (fn in this.sources) {
		if (typeof this.sources == 'function') {
			this.inputs[fn] = apply(this, this.inlets[fn]);
		}
	}
};

PkoModule.prototype.actionPhase = function () {
}
