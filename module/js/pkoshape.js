//
// SHAPE
//

var PkoShape = function PkoShape(options) {
	var self = this;

	options = edm.deepExtend({
		params: {
			x: 1,
			y: 1,
			r: 0,
			width: 1,
			height: 1,
			fill: '#fff'
		}
	}, options);

	PkoModule.call(this, options);

	if (typeof options.scene == 'object') {
		this.scene = options.scene;
	} else {
		throw 'PkoShape: Scene parameter missing.';
	}

	this.draw = function draw() {
		ctx = self.scene.context;
		ctx.fillStyle = self.params.fill;
		ctx.save();
		ctx.translate(self.params.x, self.params.y);
		ctx.rotate(self.params.r);
		ctx.fillRect(0, 0, self.params.width, self.params.height);
		ctx.restore();
	};
};

PkoShape.prototype = Object.create(PkoModule.prototype);
PkoShape.prototype.constructor = PkoShape;

PkoDispatcher.prototype.newShape = function newShape(options) {
	options = edm.deepExtend({
		scene: this.scene
	}, options);
	var m = new PkoShape(options);
	this.addModule(m);
	this.scene.addToDrawList(m, options.z || 0);
};

PkoDispatcher.prototype.deleteShape = function deleteShape(m) {
	this.removeModule(m);
	// TODO: Delete?
};
