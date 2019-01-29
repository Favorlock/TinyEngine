function getClassNames(obj) {
    let result = [];

    if (obj instanceof Object) {
        let proto = Object.getPrototypeOf(obj);
        while (proto != null) {
            result.push(proto.constructor.name);
            proto = Object.getPrototypeOf(proto);
        }
    }

    return result;
}

function isInstance(obj, type) {
    let names = getClassNames(obj);
    for (let i = 0, other; other = names[i]; i++){
        if (other === type) {
            return true;
        }
    }
    return false;
}

class ClassUtils {
}

ClassUtils.getClassNames = getClassNames;
ClassUtils.isInstance = isInstance;

export default ClassUtils;