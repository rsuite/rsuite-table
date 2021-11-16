import { PARENT_KEY } from '../constants';
import type { RowKeyType } from '../@types/common';

/**
 * Find all parent nodes of a node
 */
export default function findAllParents(rowData: any, rowKey: RowKeyType) {
  const parents = [];

  if (!rowData) {
    return parents;
  }

  function findParent(data) {
    if (data) {
      parents.push(data[rowKey]);
      if (data[PARENT_KEY]) {
        findParent(data[PARENT_KEY]);
      }
    }
  }
  findParent(rowData[PARENT_KEY]);
  return parents;
}
