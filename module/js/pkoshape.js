//
// SHAPE
//

var PkoShape = function (options) {
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
};

PkoShape.prototype = Object.create(PkoModule.prototype);
PkoShape.prototype.constructor = PkoShape;

PkoShape.prototype.draw = function () {
	ctx = this.scene.context;
	ctx.fillStyle = this.params.fill;
	ctx.save();
	ctx.translate(this.params.x, this.params.y);
	ctx.rotate(this.params.r);
	ctx.fillRect(0, 0, this.params.width, this.params.height);
	ctx.restore();
};
