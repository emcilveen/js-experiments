// Particle system
// Draws on the Javascript Particle Toolkit:
// http://www.allcrunchy.com/Web_Stuff/Particle_Simulation_Toolkit/


//
// MATH
//

var PI = Math.PI;
var TWO_PI = 2 * PI;
var HALF_PI = PI / 2;

//  Angle of a point from the origin. 0 = positive x axis ("east")
function calcAngle(x, y) {
    var angle = 0;
    if (x === 0) {
        if (y !== 0) { angle = HALF_PI; }
    } else {
        angle = Math.atan(y/x);
    }
    return (x > 0) ? angle : angle+PI;
}



//
// OBJECTS
//

Object.extend = function (destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
};


//
// GRAPHICS DEFINITIONS
//

var defaultShape = [ 1,0, 0,1, -1,0, 0,-1 ];

function drawMarker(x, y) {
    var i = 0;
    // canvasLog(Math.floor(x) + ', ' + Math.floor(y));
    context.beginPath();
    context.setTransform(10, 0, 0, 10, x, y);
    context.moveTo(defaultShape[i++], defaultShape[i++]);
    while (i < defaultShape.length) {
        context.lineTo(defaultShape[i++], defaultShape[i++]);
    }
    context.fillStyle = "#333";
    context.fill();
    context.setTransform(1,0,0,1,0,0);
}



//
// FIELD
//

var Field = function () { this.init.apply(this, arguments); };

Field.prototype = {
    particles: [],
    permissivity: 1,
    maxSpeed: 0,
    nextID: 0,
    scale: 1,
    gridSize: 0,
    grid: [],

    init: function (canvas, options) {
        Object.extend(this, options || {});
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.width = canvas.offsetWidth;
        this.height = canvas.offsetHeight;
    },

    update: function () {
        for(var i=this.particles.length-1; i>=0; i--) {
            this.particles[i].update();
        }
        // handle gravity, etc.
    },

    draw: function () {
        for(var i=this.particles.length-1; i>=0; i--) {
            this.particles[i].draw();
        }
    },

    addParticle: function (particle) {
        this.particles.push(particle);
        if (this.bouncyWalls) {
            particle.lockToBoundary(0, this.width, 0, this.height);
        } else if (this.wraparound) {
            particle.lockToBoundary(0, this.width, 0, this.height);
        }
        return particle;
    },

    getNextID: function () {
        return this.nextID++;
    },

    getGridLocation: function (x, y) {
        return [
            Math.floor(x / this.gridSize) || 0,
            Math.floor(y / this.gridSize) || 0
        ];
    },

    getParticlesAtGridLocation: function (x, y) {
        if(!this.grid[x] || !this.grid[x][y]) { return false; }
        return this.grid[x][y];
    }
};



//
// PARTICLES
//

var Particle = function () { this.init.apply(this, arguments); };

Particle.prototype = {
    mass: 1,
    charge: 0,
    size: 5,
    slip: 1,
    aSlip: 1,
    restraints: [],
    heading: 0,
    rotation: 0,
    maxRotation: HALF_PI,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    fx: 0,
    fy: 0,
    shape: defaultShape,
    fill: '#000',

    init: function (field, options) {
        var i = 0;
        var x, y;
        var radius2, maxRadius2 = 0;

        this.field = field || null;
        Object.extend(this, options || {});
        this.updateHeading();

        while (i<this.shape.length) {
            x = this.shape[i++];
            y = this.shape[i++];
            radius2 = x*x + y*y;
            if (radius2 > maxRadius2) {
                maxRadius2 = radius2;
            }
        }
        this.radius = Math.sqrt(maxRadius2);

        // this.fadeIn();
    },

    getSpeed: function () {
        return Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    },

    setSpeed: function (speed) {
        var currentSpeed = this.getSpeed();
        this.vx = speed * this.vx/currentSpeed;
        this.vy = speed * this.vy/currentSpeed;
    },

    accelerate: function (diff) {
        this.vx += diff * this.cosHeading;
        this.vy -= diff * this.sinHeading;
    },

    setDirection: function (angle) {
        var v = this.getSpeed();
        this.vx = v * Math.cos(angle);
        this.vy = v * Math.sin(angle);
    },

    updateHeading: function () {
        this.cosHeading = Math.cos(this.heading);
        this.sinHeading = Math.sin(this.heading);
        this.cosHeadingScaled = this.cosHeading * this.size;
        this.sinHeadingScaled = this.sinHeading * this.size;
    },

    rotAccelerate: function (angle) {
        this.rotation += angle;
        if (this.rotation > this.maxRotation) {
            this.rotation = this.maxRotation;
        } else if (this.rotation < -this.maxRotation) {
            this.rotation = -this.maxRotation;
        }
    },


    processRestraints: function () {
        for(var i=this.restraints.length-1; i>=0; i--) {
            this.restraints[i]();
        }
    },

    addRestraint: function (fn) {
        this.restraints.push(fn);
    },

    lockGravityTo: function (particle) {
        this.addRestraint(function () {
            this.gravitateTowards(particle);
        }.bind(this));
    },

    lockToBoundary: function (xMin, xMax, yMin, yMax) {
        xMin = xMin + this.radius*this.size;
        yMin = yMin + this.radius*this.size;
        xMax = xMax - this.radius*this.size;
        yMax = yMax - this.radius*this.size;

        this.addRestraint(function () {
            if (this.x < xMin) {
                this.vx = Math.abs(this.vx);
                this.x = xMin;
            } else if (this.x > xMax) {
                this.vx = -Math.abs(this.vx);
                this.x = xMax;
            }
            if (this.y < yMin) {
                this.vy = Math.abs(this.vy);
                this.y = yMin;
            } else if (this.y > yMax) {
                this.vy = -Math.abs(this.vy);
                this.y = yMax;
            }
            this.updateHeading();
        }.bind(this));
    },

    lockToForceBoundary: function (xMin, xMax, yMin, yMax, depth, strength) {
        xMin += this.radius*this.size;
        yMin += this.radius*this.size;
        xMax -= this.radius*this.size;
        yMax -= this.radius*this.size;

        xForceMin = xMin+depth;
        xForceMax = xMax-depth;
        yForceMin = yMin+depth;
        yForceMax = yMax-depth;

        this.addRestraint(function () {
            var d;

            if (this.x < xMin) {
                this.vx = Math.abs(this.vx);
                this.x = xMin;
            } else if (this.x > xMax) {
                this.vx = -Math.abs(this.vx);
                this.x = xMax;
            }

            d = this.x - xForceMin;
            if (d < 0) {
                this.fx += d*d / strength;
            }
            d = xForceMax - this.x;
            if (d < 0) {
                this.fx -= d*d / strength;
            }

            if (this.y < yMin) {
                this.vy = Math.abs(this.vy);
                this.y = yMin;
            } else if (this.y > yMax) {
                this.vy = -Math.abs(this.vy);
                this.y = yMax;
            }

            d = this.y - yForceMin;
            if (d < 0) {
                this.fy += d*d / strength;
            }
            d = yForceMax - this.y;
            if (d < 0) {
                this.fy -= d*d / strength;
            }

            this.updateHeading();
        }.bind(this));
    },

    lockToBankingBoundary: function (xMin, xMax, yMin, yMax, depth, strength) {
        xMin += this.radius*this.size;
        yMin += this.radius*this.size;
        xMax -= this.radius*this.size;
        yMax -= this.radius*this.size;

        xForceMin = xMin+depth;
        xForceMax = xMax-depth;
        yForceMin = yMin+depth;
        yForceMax = yMax-depth;

        this.addRestraint(function () {
            var d, f;

            if (this.x < xMin) {
                this.vx = Math.abs(this.vx);
                this.x = xMin;
            } else if (this.x > xMax) {
                this.vx = -Math.abs(this.vx);
                this.x = xMax;
            }

            d = this.x - xForceMin;
            if (d < 0) {
                f = d*d / strength;
                this.fx += f;
                this.fy += (this.vy >= 0) ? f : -f;
            }
            d = xForceMax - this.x;
            if (d < 0) {
                f = d*d / strength;
                this.fx -= f;
                this.fy += (this.vy > 0) ? f : -f;
            }

            if (this.y < yMin) {
                this.vy = Math.abs(this.vy);
                this.y = yMin;
            } else if (this.y > yMax) {
                this.vy = -Math.abs(this.vy);
                this.y = yMax;
            }

            d = this.y - yForceMin;
            if (d < 0) {
                f = d*d / strength;
                this.fy += f;
                this.fx += (this.vx >= 0) ? f : -f;
            }
            d = yForceMax - this.y;
            if (d < 0) {
                f = d*d / strength;
                this.fy -= f;
                this.fx += (this.vx > 0) ? f : -f;
            }

            this.updateHeading();
        }.bind(this));
    },

    lockToWrap: function (xMin, xMax, yMin, yMax) {
        xMin = xMin - this.radius*this.size;
        yMin = yMin - this.radius*this.size;
        xMax = xMax + this.radius*this.size;
        yMax = yMax + this.radius*this.size;

        this.addRestraint(function () {
            if (this.x < xMin) {
                this.x = xMax;
            } else if (this.x > xMax) {
                this.x = xMin;
            }
            if (this.y < yMin) {
                this.y = yMax;
            } else if (this.y > yMax) {
                this.y = yMin;
            }
            this.updateHeading();
        }.bind(this));
    },

    lockToFieldSpeedLimit: function(){
        this.addRestraint(function(){
            if(this.getSpeed() > this.field.maxSpeed) this.setSpeed(this.field.maxSpeed);
        }.bind(this));
    },

    moveTowards: function (particle, amount) {
        var xy = this.getUnitVectorTowards(particle);
        this.x += xy[0] * amount;
        this.y += xy[1] * amount;
    },

    accelerateTowards: function (particle, multiplier) {
        var xy = this.getUnitVectorTowards(particle);
        this.xForce = xy[0] * multiplier;
        this.yForce = xy[1] * multiplier;
    },

    gravitateTowards: function (particle) {
        var dist = this.getDistFrom(particle);
        //this.attractTo(particle, this.mass * particle.mass / dist * dist);

        this.accelerateTowards(particle, particle.mass / dist * dist);
    },

    attractTo: function (particle, force) {
        this.accelerateTowards(particle, force / this.mass);
    },

    getDistFrom: function (particle) {
        var d1 = this.x - particle.x;
        var d2 = this.y - particle.y;
        return Math.sqrt(d1*d1 + d2*d2);
    },

    getUnitVectorTowards: function (particle) {
        var len = this.getDistFrom(particle);
        return [
            (particle.x - this.x) / len,
            (particle.y - this.y) / len
        ];
    },


    update: function () {
        this.vx = this.vx*this.field.permissivity*this.slip + this.fx/this.mass + this.ax;
        this.vy = this.vy*this.field.permissivity*this.slip + this.fy/this.mass + this.ay;
        this.processRestraints();

        this.x += this.vx * this.field.scale;
        this.y += this.vy * this.field.scale;
        this.heading += this.rotation;
        this.rotation *= this.aSlip;

        this.fx = 0;
        this.fy = 0;
        this.ax = 0;
        this.ay = 0;
    },

    draw: function () {
        var c = this.field.context;
        var i = 0;
        c.setTransform(this.cosHeadingScaled, -this.sinHeadingScaled, this.sinHeadingScaled, this.cosHeadingScaled, this.x, this.y);
        c.beginPath();

        c.moveTo(this.shape[i++], this.shape[i++]);
        while (i < this.shape.length) {
            c.lineTo(this.shape[i++], this.shape[i++]);
        }
        c.fillStyle = this.fill;
        c.fill();
        c.setTransform(1,0,0,1,0,0);
    }
};


