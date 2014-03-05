//
// LFO
//

// Creates a sawtooth waveform that (by default) ramps up from 0 to 1.
// Future addition: phase
var PkoLfo = function () {
	var self = this;
	PkoModule.call(this);

	edm.extend(this.inputs, {
		amp: null,
		freq: null,
		bias: null
	});
	edm.extend(this.params, {
		amp: 1,
		freq: 1,
		bias: 0
	});
	edm.extend(this.results, {
		signal: 0
	});
	edm.extend(this.next, {
		signal: 0
	});
	edm.extend(this.outputs, {
		signal: function () { return self.results.signal; }
	});

	this.cycle = 0;
};

PkoLfo.prototype = Object.create(PkoModule.prototype);
PkoLfo.prototype.constructor = PkoLfo;

// Ramp function provides the timing for all derived LFOs.
PkoLfo.prototype.ramp = function () {
	var s = this.cycle + this.params.freq/this.fps;
	if (s >= 1 || s < 0) {
		s -= Math.floor(s); // floor(n) gives the largest integer <= n, so this ensures that 0 <= s < 1.
	}
	this.cycle = s;
}

PkoLfo.prototype.update = function () {
	this.ramp();
	this.next.signal = this.cycle + this.params.bias;
}


//
// PULSE WAVE
//

var PkoPulseLfo = function () {
	PkoLfo.call(this);

	edm.extend(this.inputs, {
		width: null
	});
	edm.extend(this.params, {
		width: 0.5
	});
};

PkoPulseLfo.prototype = Object.create(PkoLfo.prototype);
PkoPulseLfo.prototype.constructor = PkoPulseLfo;

PkoPulseLfo.prototype.update = function () {
	this.ramp();
	this.next.signal = this.bias + (this.cycle < this.params.width) ? this.params.amp : 0;
}


//
// SINE WAVE
//

// By default, has values between -1 to 1.
var PkoSineLfo = function () {
	PkoLfo.call(this);
};

PkoSineLfo.prototype = Object.create(PkoLfo.prototype);
PkoSineLfo.prototype.constructor = PkoSineLfo;

PkoSineLfo.prototype.update = function () {
	this.ramp();
	this.next.signal = this.params.amp * Math.sin(this.cycle * Math.TWO_PI);
}

