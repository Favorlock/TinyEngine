function requestAnimFrame() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setTimeout(callback, 1000 / 60);
        }
}

function cancelAnimFrame() {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        function (id) {
        }
}

class BrowserUtils {}

BrowserUtils.requestAnimFrame = requestAnimFrame().bind(null);
BrowserUtils.cancelAnimFrame = cancelAnimFrame().bind(null);

export default BrowserUtils;