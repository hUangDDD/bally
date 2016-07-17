"use strict";
/**
 * Check if the obj's members match the type.
 * @param obj the object to be tested, can be null or undefined.
 * @param members the members.
 * @param type the type.
 */
function checkObjectMemberType(obj, members, type) {
    if (!obj)
        return false;
    for (let i = 0; i < members.length; ++i) {
        if (typeof obj[members[i]] != type)
            return false;
    }
    return true;
}
exports.checkObjectMemberType = checkObjectMemberType;
function isArray(arr) {
    return arr && typeof arr.length == 'number';
}
/**
 *
 */
function objectVerify(obj, typedef) {
    if (!obj)
        return false;
    for (let key in typedef) {
        let type = typedef[key];
        if (typeof type === 'object') {
            if (!objectVerify(obj[key], type))
                return false;
        }
        else if (typeof type === 'function') {
            if (!type(obj[key]))
                return false;
        }
        else {
            let val = obj[key];
            switch (type) {
                case 'string':
                case 'number':
                case 'undefined':
                case 'boolean':
                    if (typeof val !== type)
                        return false;
                    break;
                case 'array':
                    if (!isArray(val))
                        return false;
                    break;
                case 'any':
                    if (!(key in obj))
                        return false;
                    break;
                default:
                    return false;
            }
        }
    }
    return true;
}
exports.objectVerify = objectVerify;
function getObjectByPath(obj, path, def) {
    var paths = path.split('.');
    for (var key of paths) {
        if (!obj)
            break;
        obj = obj[key];
    }
    return obj || def;
}
exports.getObjectByPath = getObjectByPath;
function safeParseJson(str) {
    let obj = null;
    if (typeof str == 'string') {
        try {
            obj = JSON.parse(str);
        }
        catch (e) {
        }
    }
    else {
        obj = str;
    }
    return obj;
}
exports.safeParseJson = safeParseJson;
