var nativeRequestAnimationFrame =
    global.requestAnimationFrame ||
    global.webkitRequestAnimationFrame ||
    global.mozRequestAnimationFrame ||
    global.oRequestAnimationFrame ||
    global.msRequestAnimationFrame;

module.exports = nativeRequestAnimationFrame;
