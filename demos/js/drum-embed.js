// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function backingScale(context) {
    if ('devicePixelRatio' in window) {
        if (window.devicePixelRatio > 1) {
            return window.devicePixelRatio;
        }
    }
    return 1;
}

$(function() {

    var SCREEN_WIDTH = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    // var SCREEN_HEIGHT = window.innerHeight|| document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

    var SCREEN_HEIGHT = SCREEN_WIDTH;

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var scaleFactor = backingScale(context);

    var PIXEL_WIDTH = SCREEN_WIDTH * scaleFactor;
    var PIXEL_HEIGHT = SCREEN_HEIGHT * scaleFactor;

    canvas.width = PIXEL_WIDTH;
    canvas.height = PIXEL_HEIGHT;
    canvas.style.width = SCREEN_WIDTH + 'px';
    canvas.style.height = SCREEN_HEIGHT + 'px';

    cellsX = 21;
    cellsY = 12;

    var LINE_WIDTH = 0.93 * SCREEN_WIDTH / cellsX;
    context.lineCap = 'round';
    context.lineWidth = LINE_WIDTH;
    context.strokeStyle = '#000';

    var xSpacing = SCREEN_WIDTH / (cellsX);
    var ySpacing = SCREEN_HEIGHT / (cellsY);
    var yZigzag = ySpacing / 3;

    var minSplashSize = 40, maxSplashSize = 60;
    var splashWidth = 6;
    var splash = [];

    for (var i=0; i<splashWidth; i++) {
        splash[i] = (Math.cos(2*Math.PI * i/splashWidth) - 1) / 2;
    }

    function Drum( cellsX, cellsY, constant, entropy ) {
        this.drumPos = [];
        this.prevPos = [];
        this.nextPos = [];
        this.rowStart = [];
        this.rowOffset = [];
        this.cellsX = cellsX;
        this.cellsY = cellsY;
        this.cellsTotal = cellsX * cellsY;
        this.constant = constant;
        this.entropy = entropy;

        var i, start=0;

        for (i=0; i<this.cellsTotal; i++) {
            this.drumPos[i] = 0;
            this.prevPos[i] = 0;
        }
        for (i=0; i<=cellsY; i++) {
            this.rowStart[i] = start;
            this.rowOffset[i] = 0;
            start += cellsX;
        }

        this.draw();
    }

    Drum.prototype.strike = function( x, y ) {
        var i;
        var p = this.rowStart[y] + x - Math.floor(splashWidth/2);
        var scale = Math.random() * (maxSplashSize-minSplashSize) + minSplashSize;

        for (i=0; i<splashWidth; i++,p++) {
            if (p>=this.rowStart[y] && p<this.rowStart[y+1]) {
                this.drumPos[p] += splash[i] * scale;
                this.prevPos[p] += splash[i] * scale;
            }
        }
    };

    Drum.prototype.tick = function() {
        var pos, vel, sum, force;  // position, velocity, sum of neighbouring differences
        var prevStart, thisStart, nextStart, beyondStart;
        var above, below;
        var i, row=0, j;
        var hexDirection;

        prevStart = this.cellsTotal + 1; // set high since there's no row before the first
        thisStart = 0;
        nextStart = this.rowStart[1];
        beyondStart = this.rowStart[2];
        above = -this.cellsTotal; // no previous row
        below = nextStart + this.rowOffset[1];

        for (i=0; i<this.cellsTotal; i++) {
            if (i >= nextStart) {
                row ++;
                prevStart = thisStart;
                thisStart = nextStart;
                nextStart = beyondStart;
                beyondStart = (row < cellsY-1) ? this.rowStart[row+2] : 0; // set low if we're on the last row
                above = prevStart + this.rowOffset[row];
                below = nextStart - this.rowOffset[row+1];
            }

            pos = this.drumPos[i];
            vel = (pos - this.prevPos[i]) * this.entropy;
            sum = -3 * pos;

            // if cellsX is even,
            // hexDirection = (row+i) % 2 > 0;

            // if cellsX is odd,
            hexDirection = i % 2 > 0;

            if (hexDirection && above>=prevStart && above<thisStart) { sum += this.drumPos[above]; }
            if (! hexDirection && below>=nextStart && below<beyondStart) { sum += this.drumPos[below]; }
            if (i > thisStart) { sum += this.drumPos[i-1]; }
            if (i < nextStart-1) { sum += this.drumPos[i+1]; }

            force = Math.atan(sum/80) * 4;
            this.nextPos[i] = (pos + vel + force) * this.constant;

            above ++;
            below ++;
        }

        for (i=0; i<this.cellsTotal; i++) {
            this.prevPos[i] = this.drumPos[i];
            this.drumPos[i] = this.nextPos[i];
        }
    };

    Drum.prototype.draw = function() {
        var i=0, end, row, x,y, xNext,yNext, yBase, yAlt, yTemp;
        var c;

        yBase = ySpacing / 3;
        yAlt = yBase + yZigzag;
        for (row=0; row<cellsY; row++) {
            x = xSpacing / 2;

            end = this.rowStart[row+1];
            while (i < end) {
                c = Math.floor(25*this.drumPos[i] + 127);
                if (c<0) {c=0;}
                if (c>255) {c=255;}
                y = (row+i)%2 ? yBase : yAlt;
                y -= this.drumPos[i];

                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x+1, y);
                context.strokeStyle = 'rgb(' + c + ',' + c + ',' + 255 + ')';
                context.stroke();
                x += xSpacing;
                i ++;
            }

            yTemp = yAlt + ySpacing;
            yAlt = yBase + ySpacing;
            yBase = yTemp;
        }
    };

    // function drawPrompt() {
    //  context.fillStyle = 'rgba(255,255,255,' + Math.floor(255 * (90-frame)/90) + ')';
    //  context.font = '60px "Alegreya Sans"';
    //  context.textAlign = 'center';
    //  context.textBaseline = 'middle';
    //  context.fillText('click', PIXEL_WIDTH*0.5, PIXEL_HEIGHT*0.5);
    // }

    var theDrum = new Drum(cellsX, cellsY, 0.99999, 0.99);
    // var frame = 0;

    function draw() {
    requestAnimationFrame(draw);
        context.clearRect(0, 0, PIXEL_WIDTH, PIXEL_HEIGHT);
        theDrum.tick();
        theDrum.draw();

        // if (frame <= 90) {
        //  drawPrompt();
        //  frame ++;
        // }
    }

    function  strikeWhereClicked(e) {
        var p = getPosition(e);
        var x = Math.floor(cellsX * (scaleFactor * p.x/SCREEN_WIDTH));
        var y = Math.floor(cellsY * (scaleFactor * p.y/SCREEN_HEIGHT));

        if (y < 0) {
            y = 0;
        } else if (y >= cellsY) {
            y = cellsY - 1;
        }

        theDrum.strike(x, y);
    }


  // Initialize

    $(canvas).click(strikeWhereClicked);

    $('#prompt').css('fontSize', (90/scaleFactor) + 'px').css('width', (100/scaleFactor) + '%').fadeIn().delay(2000).fadeOut(1000);
    draw();
    theDrum.strike(Math.floor(Math.random()*cellsX), Math.floor(Math.random()*cellsY));
});
