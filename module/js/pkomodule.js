//
// MODULES
//

var PkoModule = function (scene) {
	var self = this;
	this.dispatcher = null;
	this.fps = 60;

	// functions mapped to parameters; should have the same set of keys as params, below
	this.inputs = {};

	// latest values copied from sources (these stay constant, if function is missing)
	this.params = {};

	// results of calculation
	this.next = {};
	this.results = {};

	// public output functions;
	// for efficiency should generally be simple getter method, with processing done by actionPhase()
	this.outputs = {};
};

PkoModule.prototype.inputPhase = function () {
	for (fn in this.inputs) {
		if (typeof this.inputs[fn] == 'function') {
			this.params[fn] = this.inputs[fn].apply(this);
		}
	}
};

PkoModule.prototype.processPhase = function () {
}

PkoModule.prototype.resultPhase = function () {
	for (v in this.results) {
		this.results[v] = this.next[v];
	}
}
