//
// FILTER
//

// Default filter: simple amp, defaults to unity gain.
var PkoFilter = function PkoFilter(options) {
	options = edm.deepExtend({
		params: {
			source: 0,
			amp: 1,
			bias: 0
		},
		results: {
			signal: 0
		}
	}, options);

	PkoModule.call(this, options);
};

PkoFilter.prototype = Object.create(PkoModule.prototype);
PkoFilter.prototype.constructor = PkoFilter;

PkoFilter.prototype.processPhase = function processPhase() {
	this.next.signal = this.params.source * this.params.amp + this.params.bias;
};

//
// SMOOTHING
//

var PkoSmoothingFilter = function PkoSmoothingFilter(options) {
	options = edm.deepExtend({
		params: {
			strength: 0.9 // range: 0..1 where 0 is unfiltered and 1 is DC
		}
	}, options);

	PkoFilter.call(this, options);

	this.current = 0;
};

PkoSmoothingFilter.prototype = Object.create(PkoLfo.prototype);
PkoSmoothingFilter.prototype.constructor = PkoSmoothingFilter;

PkoSmoothingFilter.prototype.processPhase = function processPhase() {
	this.current = this.current * this.params.strength +
		(this.params.source * this.params.amp) * (1-this.params.strength);
	this.next.signal = this.current;
	// TODO: Bias?
};

PkoDispatcher.prototype.newFilter = function newFilter(options) {
	var m = new PkoFilter(options);
	this.addModule(m);
	return m;
};

PkoDispatcher.prototype.deleteFilter = function deleteFilter(m) {
	this.removeModule(m);
	// TODO: Delete?
};

PkoDispatcher.prototype.newSmoothingFilter = function newSmoothingFilter(options) {
	var m = new PkoSmoothingFilter(options);
	this.addModule(m);
	return m;
};

PkoDispatcher.prototype.deleteSmoothingFilter = function deleteSmoothingFilter(m) {
	this.removeModule(m);
	// TODO: Delete?
};
