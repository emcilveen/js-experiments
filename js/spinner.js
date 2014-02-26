//
// PARTICLES
//

var Particle = function (scene) {
	this.scene = scene;
	this.x = scene.pixelWidth * Math.random();
	this.y = scene.pixelHeight * Math.random();
	this.r = Math.TWO_PI * Math.random();
	this.vx = this.scene.maxSpeed * Math.random() - this.scene.maxSpeed*0.5;
	this.vy = this.scene.maxSpeed * Math.random() - this.scene.maxSpeed*0.5;
	this.vr = this.scene.maxRotation*0.5 * Math.random() + this.scene.maxRotation*0.5;
	if (Math.random() > 0.5) { this.vr = -this.vr; }
	this.speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
	this.ax = 0;
	this.ay = 0;
	this.ar = 0;
};

Particle.prototype.seekCenter = function () {
	this.ax -= this.scene.centerSeekingForce * Math.pow((this.x - this.scene.centerX) / this.scene.pixelWidth, 3);
	this.ay -= this.scene.centerSeekingForce * Math.pow((this.y - this.scene.centerY) / this.scene.pixelHeight, 3);
};

Particle.prototype.interactWithParticle = function (other) {
	var diffX = other.x - this.x;
	var diffY = other.y - this.y;
	var dist = Math.abs(diffX) + Math.abs(diffY); // coarse: ortho distance to save calc time
	var dist2, fx, fy;

	if (dist < this.scene.interactionRadius) {
		dist = Math.sqrt(diffX*diffX + diffY*diffY); // fine
		if (dist < this.scene.interactionRadius) {
			dist2 = dist*dist;
			fx = this.scene.interactionForce * diffX / dist2;
			fy = this.scene.interactionForce * diffY / dist2;
			this.ax -= fx;
			this.ay -= fy;
			other.ax += fx;
			other.ay += fy;
		}
	}
};

Particle.prototype.interactWithPointer = function (pointer) {
	var diffX = pointer.x - this.x;
	var diffY = pointer.y - this.y;
	var dist = Math.abs(diffX) + Math.abs(diffY); // coarse: ortho distance to save calc time
	var dist2, fx, fy;
	var pApproach;

	if (dist < this.scene.pointerRadius && dist > this.scene.pointerMinRadius) {
		dist = Math.sqrt(diffX*diffX + diffY*diffY); // fine
		if (dist < this.scene.pointerRadius && dist > this.scene.pointerMinRadius) {
			dist2 = Math.pow(dist, 2);
			fx = this.scene.pointerForce * diffX / dist2;
			fy = this.scene.pointerForce * diffY / dist2;
			this.ax += fx;
			this.ay += fy;
		}
	}
}

Particle.prototype.update = function () {
	var speedScale;

	this.seekCenter();

	this.vx += this.ax;
	this.vy += this.ay;
	this.speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
	if (this.speed > this.scene.maxSpeed) {
		speedScale = this.scene.maxSpeed / this.speed;
		this.vx *= speedScale;
		this.vy *= speedScale;
	}
	this.x += this.vx * this.scene.scale;
	this.y += this.vy * this.scene.scale;
	this.r += this.vr;
	this.ax = 0;
	this.ay = 0;
	this.ar = 0;
};

Particle.prototype.draw = function () {
	this.update();
	ctx = this.scene.context;
	ctx.fillStyle = '#fff';

	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.fillRect(-1, -1, 2, 2);
	ctx.restore();
};



//
// SPINNERS
//

var Spinner = function (scene) {
	Particle.call(this, scene);

	var color = edm.hexToRgb(scene.spinnerFill);
	color.r += Math.random() * 40 - 20;
	color.g += Math.random() * 40 - 20;
	color.b += Math.random() * 40 - 20;
	this.fill = edm.rgbToHex(color);
	this.innerRadius = (1 + 2 * Math.random()) * scene.baseRadius;
	this.outerRadius = (3 + 4 * Math.random()) * scene.baseRadius;
};

Spinner.prototype = Object.create(Particle.prototype);
Spinner.prototype.constructor = Spinner;

Spinner.prototype.draw = function () {
	this.update();
	ctx = this.scene.context;
	ctx.fillStyle = this.fill;

	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.r);
	ctx.beginPath();
	ctx.moveTo(this.innerRadius, 0);
	for (var i=0; i<4; i++) {
		ctx.rotate(Math.PI/5);
		ctx.lineTo(this.outerRadius, 0);
		ctx.rotate(Math.PI/5);
		ctx.lineTo(this.innerRadius, 0);
	}
	ctx.rotate(Math.PI/5);
	ctx.lineTo(this.outerRadius, 0);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
};
