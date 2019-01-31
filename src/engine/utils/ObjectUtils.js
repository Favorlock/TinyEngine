function getLength(obj) {
    let count = 0;
    for (let prop in obj) count += 1;
    return count;
}

class ObjectUtils {
}

ObjectUtils.getLength = getLength;

export default ObjectUtils;