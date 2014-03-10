//
// LFO
//

// Creates a sawtooth waveform that (by default) ramps up from 0 to 1.
// Future addition: phase
var PkoLfo = function PkoLfo(options) {
	options = edm.deepExtend({
		params: {
			amp: 1,
			freq: 1,
			bias: 0
		},
		results: {
			signal: 0
		}
	}, options);

	PkoModule.call(this, options);

	this.cycle = 0;
};

PkoLfo.prototype = Object.create(PkoModule.prototype);
PkoLfo.prototype.constructor = PkoLfo;

// Ramp function provides the timing for all derived LFOs.
PkoLfo.prototype.ramp = function ramp() {
	var s = this.cycle + this.params.freq/this.fps;
	if (s >= 1 || s < 0) {
		s -= Math.floor(s); // floor(n) gives the largest integer <= n, so this ensures that 0 <= s < 1.
	}
	this.cycle = s;
};

PkoLfo.prototype.processPhase = function processPhase() {
	this.ramp();
	this.next.signal = this.cycle + this.params.bias;
};


//
// PULSE WAVE
//

var PkoPulseLfo = function PkoPulseLfo(options) {
	options = edm.deepExtend({
		params: {
			width: 0.5
		}
	}, options);

	PkoLfo.call(this, options);
};

PkoPulseLfo.prototype = Object.create(PkoLfo.prototype);
PkoPulseLfo.prototype.constructor = PkoPulseLfo;

PkoPulseLfo.prototype.processPhase = function processPhase() {
	this.ramp();
	this.next.signal = this.params.bias + (this.cycle < this.params.width) ? this.params.amp : 0;
};


//
// SINE WAVE
//

// By default, has values between -1 to 1.
var PkoSineLfo = function PkoSineLfo(options) {
	PkoLfo.call(this, options);
};

PkoSineLfo.prototype = Object.create(PkoLfo.prototype);
PkoSineLfo.prototype.constructor = PkoSineLfo;

PkoSineLfo.prototype.processPhase = function processPhase() {
	this.ramp();
	this.next.signal = this.params.amp * Math.sin(this.cycle * Math.TWO_PI);
};
