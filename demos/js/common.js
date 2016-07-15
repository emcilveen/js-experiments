function hexToRgb(string) {
    var r=0, g=0, b=0;

    if (string.length === 3) {
        r = parseInt(string.slice(0,1), 16);
        r += r * 16;
        g = parseInt(string.slice(1,2), 16);
        g += g * 16;
        b = parseInt(string.slice(2,3), 16);
        b += b * 16;
    } else if (string.length === 6) {
        r = parseInt(string.slice(0,2), 16);
        g = parseInt(string.slice(2,4), 16);
        b = parseInt(string.slice(4,6), 16);
    }

    return {"r": r, "g": g, "b": b};
}

function rgbToHex(color) {
    return "#" + ("0"+color.r.toString(16)).slice(-2) + ("0"+color.g.toString(16)).slice(-2) + ("0"+color.b.toString(16)).slice(-2);
}

// after http://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas
function getPosition(e) {
    var targ;
    if (!e) {
        e = window.event;
    }
    if (e.target) {
        targ = e.target;
    } else if (e.srcElement) {
        targ = e.srcElement;
    }
    if (targ.nodeType === 3) {
        targ = targ.parentNode;
    }

    var x = e.pageX - $(targ).offset().left;
    var y = e.pageY - $(targ).offset().top;
    return {"x": x, "y": y};
}
