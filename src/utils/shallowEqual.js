export default function shallowEqual(objA, objB) {
    if (objA === objB) {
        return true;
    }
    var key;
    // Test for A's keys different from B.
    for (key in objA) {
        if (objA.hasOwnProperty(key) &&
            (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
            return false;
        }
    }
    // Test for B's keys missing from A.
    for (key in objB) {
        if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
};
