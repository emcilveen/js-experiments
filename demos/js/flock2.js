//
// SCREEN AND CANVAS
//

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
                                      window[vendors[x]+'CancelRequestAnimationFrame'];
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
    var SCREEN_HEIGHT = window.innerHeight|| document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var scaleFactor = backingScale(context);


    var PIXEL_WIDTH = SCREEN_WIDTH * scaleFactor;
    var PIXEL_HEIGHT = SCREEN_HEIGHT * scaleFactor;
    var CENTER_X = PIXEL_WIDTH / 2;
    var CENTER_Y = PIXEL_HEIGHT / 2;

    canvas.width = PIXEL_WIDTH;
    canvas.height = PIXEL_HEIGHT;
    canvas.style.width = SCREEN_WIDTH + 'px';
    canvas.style.height = SCREEN_HEIGHT + 'px';

    CANVAS_LEFT = canvas.offsetLeft;
    CANVAS_TOP = canvas.offsetTop;
    context.lineCap = 'round';



    //
    //  GRAPHICS DEFINITIONS
    //

    var flyerImage = [ 5,0, -5,-4, -3,0, -5,4 ];
    var flyerFill = '#9ab';
    var flockFill = '#789';



    //
    //  GAME ELEMENTS
    //

    var field;
    var player;
    var flock = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        flockForce: 2,
        flockSize: 50,
        flockerSize: 3,
        repulsion: 1000,
        members: [],
    };


    var uF_i, uFj;
    var uF_sumX, uF_sumY;
    var uF_sumVx, uF_sumVy;
    var uF_distance;
    var uF_count = this.flockSize;
    var uF_flocker;
    var uF_dx, uF_dy;
    var uF_fx, uF_fy;

    flock.update = function () {
        uF_sumX = 0;
        uF_sumY = 0;
        uF_sumVx = 0;
        uF_sumVy = 0;
        uF_count = this.flockSize;

        for (uF_i=0; uF_i<uF_count; uF_i++) {
            uF_sumX += this.members[uF_i].x;
            uF_sumY += this.members[uF_i].y;
            uF_sumVx += this.members[uF_i].vx;
            uF_sumVy += this.members[uF_i].vy;
        }
        this.x = uF_sumX / uF_count;
        this.y = uF_sumY / uF_count;
        this.vx = uF_sumVx / uF_count;
        this.vy = uF_sumVy / uF_count;

        for (uF_i=0; uF_i<uF_count; uF_i++) {
            uF_flocker = this.members[uF_i];
            uF_dx = this.x - uF_flocker.x;
            uF_dy = this.y - uF_flocker.y;
            uF_distance = Math.sqrt(uF_dx*uF_dx + uF_dy*uF_dy);

            // turn into unit vector
            uF_dx /= uF_distance;
            uF_dy /= uF_distance;
            uF_flocker.fx += uF_dx * this.flockForce;
            uF_flocker.fy += uF_dy * this.flockForce;

            // match velocity
            uF_flocker.vx = uF_flocker.vx*0.95 + this.vx*0.05;
            uF_flocker.vy = uF_flocker.vy*0.95 + this.vy*0.05;

            // heading
            uF_flocker.heading = calcAngle(uF_flocker.vx, -uF_flocker.vy);
            uF_flocker.updateHeading();
        }

        // nodes repel
        for (uF_i=uF_count-1; uF_i>0; uF_i--) {
            for (uF_j=uF_i-1; uF_j>=0; uF_j--) {
                uF_dx = this.members[uF_i].x - this.members[uF_j].x;
                uF_dy = this.members[uF_i].y - this.members[uF_j].y;
                uF_d2 = uF_dx*uF_dx + uF_dy*uF_dy;
                uF_d = Math.sqrt(uF_d2);

                uF_fx = this.repulsion * (uF_dx/uF_d) / uF_d2;
                uF_fy = this.repulsion * (uF_dy/uF_d) / uF_d2;

                this.members[uF_i].x += uF_fx;
                this.members[uF_i].y += uF_fy;
                this.members[uF_j].x -= uF_fx;
                this.members[uF_j].y -= uF_fy;
            }
        }

        // player object also repels
        rep = 4000 + 0.04 * this.repulsion * player.size * Math.sqrt(player.vx * player.vx + player.vy * player.vy);

        for (uF_i=uF_count-1; uF_i>=0; uF_i--) {
            uF_dx = player.x - this.members[uF_i].x;
            uF_dy = player.y - this.members[uF_i].y;
            uF_d2 = uF_dx*uF_dx + uF_dy*uF_dy;
            if (uF_d2 < 500) { uF_d2 = 500; }
            uF_d = Math.sqrt(uF_d2);

            uF_fx = - rep * (uF_dx/uF_d) / uF_d2;
            uF_fy = - rep * (uF_dy/uF_d) / uF_d2;

            // uF_fx = player.mass * (uF_dx/uF_d) / uF_d2;
            // uF_fy = player.mass * (uF_dy/uF_d) / uF_d2;

            this.members[uF_i].x += uF_fx;
            this.members[uF_i].y += uF_fy;
        }


        // "Bowl" effect (d^4) around poles
        for (uF_i=uF_count-1; uF_i>=0; uF_i--) {
                uF_dx = this.members[uF_i].x - player.x;
                uF_dy = this.members[uF_i].y - player.y;
                uF_d2 = uF_dx*uF_dx + uF_dy*uF_dy;
                uF_d = Math.sqrt(uF_d2);

                this.members[uF_i].fx -= 0.000024 * uF_dx/uF_d / uF_d2*uF_d2*uF_d2;
                this.members[uF_i].fy -= 0.000024 * uF_dy/uF_d / uF_d2*uF_d2*uF_d2;
        }
    };

    function initGame() {
        var flocker;

        field = new Field(canvas, {
            permissivity: 0.999,
            maxSpeed: 150,
            scale: 0.04
        });

        field.width = PIXEL_WIDTH;
        field.height = PIXEL_HEIGHT;

        player = new Particle(field, {
            x: 0.5 * PIXEL_WIDTH,
            y: 0.75 * PIXEL_HEIGHT,
            vx: 0,
            vy: 0,
            heading: HALF_PI,
            slip: 0.99,
            aSlip: 0.9,
            shape: flyerImage,
            fill: flyerFill
        });
        player.lockToBankingBoundary(0, field.width, 0, field.height, 200, 1000000);
        field.addParticle(player);

        for (var i=0; i<flock.flockSize; i++) {
            var index = Math.random();
            var color = rgbToHex({
                r: Math.floor(index*30)+100,
                g: Math.floor(index*30)+180,
                b: -Math.floor(index*60)+180
            });
            flocker = new Particle(field, {
                x: Math.random() * PIXEL_WIDTH,
                y: Math.random() * PIXEL_HEIGHT,
                vx: Math.random() * 5,
                vy: Math.random() * 5,
                size: flock.flockerSize,
                shape: flyerImage,
                fill: color
            });
            flocker.lockToBankingBoundary(0, field.width, 0, field.height, 200, 100000);
            flocker.lockToFieldSpeedLimit();
            flock.members.push(flocker);
            field.addParticle(flocker);
        }
    }




    //
    //  USER INTERACTION
    //

    var playerTargetX, playerTargetY;

    var keysDown = [];
    var keysWatched = [32, 37, 38, 39, 40, 65];

    var trackingTouches = [];
    var touchCount = 0;

    var currentClick = {
        primaryClick: false,
        secondaryClick: false,
        pageX: 0,
        pageY: 0,
        relAngle: 0
    };

    var userAcceleration = 20;
    var userRotation = Math.PI/360;



    //
    // DEBUGGING
    //

    // Write debugging log to canvas -- call from animation draw loop.
    var msgLog = [];

    function canvasLog(text) {
        msgLog.push(text);
        if (msgLog.length>10) {
            msgLog.shift();
        }
    }

    function showLog() {
        context.fillStyle = '#333';
        context.font = '20px serif';
        context.textBaseline = 'bottom';
        context.fillText('Logging.', 10, 30);
        for (var i=0; i<msgLog.length; i++) {
            context.fillText(msgLog[i], 10, 60+30*i);
        }
    }



    //
    // KEYBOARD
    //

    function handleKeyDown(e) {
        var key;

        if (window.event) {
            key = window.event.keyCode;
        } else if (e) {
            key = e.which;
        }
        if (keysWatched.indexOf(key) !== -1) {
            e.preventDefault();
            if (!keysDown[key]) {
                keysDown[key] = true;
                // console.log(key);
            }
        }
    }

    function handleKeyUp(e) {
        var key;

        if (window.event) {
            key = window.event.keyCode;
        } else if (e) {
            key = e.which;
        }
        if (keysWatched.indexOf(key) !== -1) {
            e.preventDefault();
            keysDown[key] = false;
            // console.log(key);
        }
    }

    function initKeyboard() {
        for (var k in keysWatched) {
            keysDown[k] = false;
        }
        window.onkeydown = handleKeyDown;
        window.onkeyup = handleKeyUp;
    }



    //
    // TOUCH
    // See https://developer.mozilla.org/en-US/docs/DOM/Touch_events#Example
    //

    function getCurrentTouchIndex(idToFind) {
        for (var i=0; i<trackingTouches.length; i++) {
            var id = trackingTouches[i].identifier;
            if (id === idToFind) {
                return i;
            }
        }
        return -1;
    }

    function handleTouchStart(e) {
        e.preventDefault();
        var touches = e.changedTouches;
        var sumX=0, sumY=0;
        var count = 0;

        if (trackingTouches.length === 0) {
            for (var i=0; i<touches.length; i++) {
                sumX += touches[i].pageX;
                sumY += touches[i].pageY;
                trackingTouches.push(touches[i]);
                count++;
            }
            playerTargetX = scaleFactor * sumX / count;
            playerTargetY = scaleFactor * sumY / count;
        }
        touchCount = e.touches.length;
    }

    function handleTouchMove(e) {
        e.preventDefault();
        var touches = e.touches;
        var sumX=0, sumY=0;
        var count = 0;

        for (var i=0; i<touches.length; i++) {
            var index = getCurrentTouchIndex(touches[i].identifier);
            if (index >= 0) {
                sumX += touches[index].pageX;
                sumY += touches[index].pageY;
                count++;
            }
        }
        if (count > 0) {
            playerTargetX = scaleFactor * sumX / count;
            playerTargetY = scaleFactor * sumY / count;
        }
        touchCount = e.touches.length;
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        var touches = e.changedTouches;
        for (var i=0; i<touches.length; i++) {
            var index = getCurrentTouchIndex(touches[i].identifier);
            trackingTouches.splice(index, 1);
        }
        touchCount = e.touches.length;
    }

    function initTouch() {
        window.addEventListener('touchstart', handleTouchStart, false);
        window.addEventListener('touchmove', handleTouchMove, false);
        window.addEventListener('touchend', handleTouchEnd, false);
        window.addEventListener('touchcancel', handleTouchEnd, false);
    }



    //
    // MOUSE
    //

    function handleMouseDown(e) {
        e.preventDefault();
        if (e.which > 1) {
            currentClick.secondaryClick = true;
        } else {
            currentClick.primaryClick = true;
        }
        playerTargetX = scaleFactor * e.pageX;
        playerTargetY = scaleFactor * e.pageY;

        // canvasLog('DOWN. x=' + e.pageX + ' y=' + e.pageY);
    }

    function handleMouseMove(e) {
        e.preventDefault();
        playerTargetX = scaleFactor * e.pageX;
        playerTargetY = scaleFactor * e.pageY;

        // canvasLog('MOVE. angle=' + Math.floor(180*player.heading/PI));
    }

    function handleMouseUp(e) {
        e.preventDefault();
        if (e.which > 1) {
            currentClick.secondaryClick = false;
        } else {
            currentClick.primaryClick = false;
        }

        // canvasLog('UP.');
    }

    function initMouse() {
        window.addEventListener('mousedown', handleMouseDown, false);
        window.addEventListener('mousemove', handleMouseMove, false);
        window.addEventListener('mouseup', handleMouseUp, false);
        window.addEventListener('contextmenu', function (e) {
            e.preventDefault(); return false;
        }, false);
        window.addEventListener('mousewheel', function (e) {
            e.preventDefault(); return false;
        }, false);
    }



    //
    // CANVAS
    //

    function update() {
        window.requestAnimationFrame(update);
        if (keysDown[37]) {
            player.rotAccelerate(userRotation);
        }
        if (keysDown[38] || keysDown[32]) {
            player.accelerate(userAcceleration);
        }
        if (keysDown[39]) {
            player.rotAccelerate(-userRotation);
        }
        if (keysDown[40]) {
            player.accelerate(-userAcceleration);
        }

        if (touchCount > 0 || currentClick.primaryClick || currentClick.secondaryClick) {
            player.heading = calcAngle(playerTargetX - (CANVAS_LEFT+player.x), (CANVAS_TOP+player.y) - playerTargetY);
            player.updateHeading();
            player.accelerate(userAcceleration);
        }

        flock.update();
        field.update();

        context.clearRect(0, 0, PIXEL_WIDTH, PIXEL_HEIGHT);
        // drawMarker(flock.x, flock.y);
        field.draw();

        // showLog();
    }

    initGame();
    initTouch();
    initMouse();
    initKeyboard();

    update();
});