import intersection from 'lodash/intersection';

export default function shouldShowRowByExpanded(expandedRowKeys = [], parentKeys = []): boolean {
  const intersectionKeys = intersection(expandedRowKeys, parentKeys);
  if (intersectionKeys.length === parentKeys.length) {
    return true;
  }
  return false;
}
