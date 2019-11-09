import _ from 'lodash';
export default function shouldShowRowByExpanded(expandedRowKeys = [], parentKeys = []) {
  const intersectionKeys = _.intersection(expandedRowKeys, parentKeys);
  if (intersectionKeys.length === parentKeys.length) {
    return true;
  }
  return false;
}
