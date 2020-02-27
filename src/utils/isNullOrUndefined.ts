import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';

export default function isNullOrUndefined(value): boolean {
  return isNull(value) || isUndefined(value);
}
