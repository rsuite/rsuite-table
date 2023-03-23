import { PARENT_KEY } from '../constants';
import type { RowDataType } from '../@types/common';

/**
 * Flatten the data of a tree structure into a one-dimensional array.
 * @param treeData
 * @returns
 */
function flattenData<Row extends RowDataType>(treeData: readonly Row[]) {
  const flattenItems: Row[] = [];

  function loop(treeData: readonly Row[], parentNode: Row | null) {
    if (!Array.isArray(treeData)) {
      return;
    }

    treeData.forEach(rowData => {
      flattenItems.push({
        ...rowData,
        [PARENT_KEY]: parentNode
      });
      if (rowData.children) {
        loop(rowData.children, rowData);
      }
    });
  }

  loop(treeData, null);
  return flattenItems;
}

export default flattenData;
