import curry from 'lodash/curry';
import classNames from 'classnames';

export const globalKey = 'rs-';
export const getClassNamePrefix = () => {
  if (typeof __RSUITE_CLASSNAME_PREFIX__ !== 'undefined') {
    return __RSUITE_CLASSNAME_PREFIX__;
  }
  return globalKey;
};
export const defaultClassPrefix = name => `${getClassNamePrefix()}${name}`;
export const prefix = curry((pre: string, className: string | string[]) => {
  if (!pre || !className) {
    return '';
  }

  if (Array.isArray(className)) {
    return classNames(className.filter(name => !!name).map(name => `${pre}-${name}`));
  }

  return `${pre}-${className}`;
});
