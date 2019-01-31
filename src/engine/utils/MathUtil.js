function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180)
}

class MathUtil {}

MathUtil.radiansToDegrees = radiansToDegrees;
MathUtil.degreesToRadians = degreesToRadians;

export default MathUtil;