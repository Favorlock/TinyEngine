function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

class MathUtils {
}

MathUtils.radiansToDegrees = radiansToDegrees;
MathUtils.degreesToRadians = degreesToRadians;

export default MathUtils;