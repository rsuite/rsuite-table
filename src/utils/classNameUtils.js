export function addPrefix(className, classPrefix) {
    let prefix = classPrefix ? classPrefix + '-' : '';
    return prefix + className;
};
