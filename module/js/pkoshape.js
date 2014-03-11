//
// SHAPE
//

var PkoShape = function PkoShape(dispatcher, scene, zIndex, options) {
	var self = this;

	options = edm.deepExtend({
		params: {
			x: 0,
			y: 0,
			originX: 0,
			originY: 0,
			r: 0,
			width: 1,
			height: 1,
			fill: '#fff'
		}
	}, options);

	PkoModule.call(this, dispatcher, options);

	if (typeof scene == 'object') {
		this.scene = scene;
		scene.addToDrawList(this, zIndex || 0);
	} else {
		throw 'PkoShape: Scene parameter missing.';
	}

	this.draw = function draw() {
		ctx = self.scene.context;
		ctx.fillStyle = self.params.fill;
		ctx.save();
		ctx.translate(self.params.x, self.params.y);
		ctx.rotate(self.params.r);
		ctx.translate(self.params.originX, self.params.originY);
		ctx.fillRect(0, 0, self.params.width, self.params.height);
		ctx.restore();
	};
};

PkoShape.prototype = Object.create(PkoModule.prototype);
PkoShape.prototype.constructor = PkoShape;
