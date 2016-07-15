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

    canvas.width = PIXEL_WIDTH;
    canvas.height = PIXEL_HEIGHT;
    canvas.style.width = SCREEN_WIDTH + 'px';
    canvas.style.height = SCREEN_HEIGHT + 'px';

    var x=[], y=[];
    var vx=[], vy=[];

    var segments = 120;
    var segIndex = 0;
    var nodes = 5;

    var bgColor = "000";
    var colorBase = ["e60050", "026464", "aa0078", "beaa14", "b45000"];
    var weight = 5;
    var maxWeight = 20;
    var colorTable=[], weightTable=[], alphaTable=[];

    var fadeIn=1, fadeOut=1;

    var pole = [];

    // "Magnetic" poles
    var Pole = function Pole(charge) {
        this.charge = charge || 0;
        this.x = PIXEL_WIDTH/2;
        this.y = PIXEL_HEIGHT/2;
    };
    pole[0] = new Pole(0.000014);


    function calcColors() {
        var rgb, r,g,b, n,i,f;

        for (n=0; n<nodes; n++) {
            colorTable[n] = [];
            rgb = hexToRgb(colorBase[n]);

            for (i=0; i<segments; i++) {
                // ramp up and down
                f = (i*2 <= segments) ? i*2/segments : 2-(i*2/segments);

                r = Math.floor(rgb.r * f);
                g = Math.floor(rgb.g * f);
                b = Math.floor(rgb.b * f);

                colorTable[n][i] = rgbToHex({"r": r, "g": g, "b": b});
            }
        }
    }

    function calcWeights() {
        var i,f;
        for (i=0; i<segments; i++) {
            f = (i*2 <= segments) ? i*2/segments : 2-(i*2/segments);
            alphaTable[i] = f;
            weightTable[i] = weight * f;
        }
    }

    // function circle(x,y,r) {
    //   context.beginPath();
    //   context.arc(x, y, r, 0, Math.PI*2, true);
    //   context.fill();
    // }

    function kick() {
        var n;
        for (n=0; n<nodes; n++) {
            vx[n][segIndex] += (Math.random()*10 - 5);
            vy[n][segIndex] += (Math.random()*10 - 5);
        }
    }

    function calcPositions() {
        var d,d2, dx,dy, fx,fy, i,j;
        var newIndex = segIndex + 1;
        if (newIndex >= segments) {
            newIndex = 0;
        }

        // Inertia: same velocity minus a bit for friction
        for (i=nodes-1; i>=0; i--) {
            vx[i][newIndex] = vx[i][segIndex] * 0.993;
            vy[i][newIndex] = vy[i][segIndex] * 0.993;
        }

        // Interaction of nodes
        for (i=nodes-1; i>0; i--) {
            for (j=i-1; j>=0; j--) {
                dx = x[i][segIndex] - x[j][segIndex];
                dy = y[i][segIndex] - y[j][segIndex];
                d2 = dx*dx + dy*dy;
                d = Math.sqrt(d2);

                fx = 500 * (dx/d) / d2;
                fy = 500 * (dy/d) / d2;

                vx[i][newIndex] += fx;
                vy[i][newIndex] += fy;
                vx[j][newIndex] -= fx;
                vy[j][newIndex] -= fy;
            }
        }

        // "Bowl" effect (d^4) around poles
        for (i=nodes-1; i>=0; i--) {
            for (j=0; j>=0; j--) {
                dx = x[i][segIndex] - pole[j].x;
                dy = y[i][segIndex] - pole[j].y;
                d2 = dx*dx + dy*dy;
                d = Math.sqrt(d2);

                fx = - pole[j].charge * dx/d / d2*d2*d2;
                fy = - pole[j].charge * dy/d / d2*d2*d2;

                vx[i][newIndex] += fx;
                vy[i][newIndex] += fy;
            }
        }

        // Calculate new position
        for (i=nodes-1; i>=0; i--) {
            x[i][newIndex] = x[i][segIndex] += vx[i][newIndex];
            y[i][newIndex] = y[i][segIndex] += vy[i][newIndex];
        }

        segIndex = newIndex;
    }

    function draw() {
        // Node, segment index and relative segment
        var n, i,s;

        requestAnimationFrame(draw);
        calcPositions();
        context.clearRect(0, 0, PIXEL_WIDTH, PIXEL_HEIGHT);

        for (n=nodes-1; n>=0; n--) {
            i = segIndex + 1;
            if (i >= segments) {
                i = 0;
            }

            for (s=0; s<segments; s++) {
                context.beginPath();
                context.moveTo(x[n][i], y[n][i]);
                if (++i >= segments) {
                    i = 0;
                }
                context.lineTo(x[n][i], y[n][i]);

                // context.strokeStyle = colorBase[n];
                context.strokeStyle = colorTable[n][s];
                // context.globalAlpha = alphaTable[s];
                context.lineWidth = weightTable[s];
                context.stroke();
            }
        }
    }


    function init() {
        var n,s;
        var position;
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
        context.canvas.width = PIXEL_WIDTH;
        context.canvas.height = PIXEL_HEIGHT;
        context.lineCap = 'round';
        calcColors();
        calcWeights();

        for (n=0; n<nodes; n++) {
            x[n] = [];
            y[n] = [];
            x[n][0] = (Math.random()*0.25 + 0.375) * PIXEL_WIDTH;
            y[n][0] = (Math.random()*0.25 + 0.375) * PIXEL_HEIGHT;

            vx[n] = [];
            vy[n] = [];
            vx[n][0] = (Math.random()*2 - 1);
            vy[n][0] = (Math.random()*2 - 1);

            for (s=1; s<segments; s++) {
                x[n][s] = PIXEL_WIDTH/2;
                x[n][s] = PIXEL_HEIGHT/2;
                vx[n][s] = vx[n][s-1];
                vy[n][s] = vy[n][s-1];
            }
        }


        $("#canvas").mousemove(function(e) {
            position = getPosition(e);
            pole[0].x = position.x * scaleFactor;
            pole[0].y = position.y * scaleFactor;
        });
        $(document).click(function(e) {
            e.preventDefault();
            kick();
        });
        $('#prompt').css('fontSize', (90/scaleFactor) + 'px').css('width', (100/scaleFactor) + '%').fadeIn().delay(2000).fadeOut(1000);

        draw();
    }

    init();
});
