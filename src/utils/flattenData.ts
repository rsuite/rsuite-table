import { PARENT_KEY } from '../constants';
import type { RowDataType } from '../@types/common';

/**
 * Flatten the data of a tree structure into a one-dimensional array.
 * @param treeData
 * @returns
 */
function flattenData<Row extends RowDataType>(treeData: readonly Row[]) {
  const flattenItems: Row[] = [];

  function loop(treeData, parentNode) {
    if (!Array.isArray(treeData)) {
      return;
    }

    treeData.forEach(rowData => {
      rowData[PARENT_KEY] = parentNode;
      flattenItems.push({
        ...rowData
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
