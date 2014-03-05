//
// SHAPE
//

var PkoShape = function (scene) {
	PkoModule.call(this);
	this.scene = scene;

	edm.extend(this.inputs, {
		x: null,
		y: null,
		r: null,
		width: null,
		height: null,
		fill: null
	});
	edm.extend(this.params, {
		x: 1,
		y: 1,
		r: 0,
		width: 1,
		height: 1,
		fill: '#fff'
	});
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

PkoShape.prototype.update = function () {
	this.draw();
}
