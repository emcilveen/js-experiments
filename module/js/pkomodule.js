//
// MODULES
//

var PkoModule = function PkoModule(dispatcher, options) {
	var self = this;
	this.dispatcher = dispatcher;
	this.fps = 60;

	// functions mapped to parameters; should have the same set of keys as params, below
	this.inputs = options ? edm.extend({}, options.inputs) : {};

	// latest values copied from sources (these stay constant, if function is missing)
	this.params = options ? edm.extend({}, options.params) : {};

	// results of calculation
	this.next = {};
	this.results = options ? edm.extend({}, options.results) : {};

	// public output functions;
	// for efficiency should generally be simple getter method, with processing done by actionPhase()
	this.outputs = options ? edm.extend({}, options.outputs) : {};

	// create getters for results that haven't been explicitly assigned functions
	for (var key in this.results) {
		if (!this.outputs[key]) {
			this.bindGetter(key, this.results[key]);
		}
	}

	dispatcher.addModule(this);
};

PkoModule.prototype.bindGetter = function bindGetter(prop) {
	var _prop = prop;
	var _object = this;
	this.outputs[prop] = function() {
		return _object.results[_prop];
	};
};

PkoModule.prototype.inputPhase = function inputPhase() {
	for (fn in this.inputs) {
		if (typeof this.inputs[fn] == 'function') {
			this.params[fn] = this.inputs[fn].apply(this);
		}
	}
};

PkoModule.prototype.processPhase = function processPhase() {
};

PkoModule.prototype.resultPhase = function resultPhase() {
	for (v in this.results) {
		this.results[v] = this.next[v];
	}
};
