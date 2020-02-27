import * as React from 'react';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';

import isNullOrUndefined from './isNullOrUndefined';

function cloneCell(Cell, props) {
  return React.cloneElement(Cell, props);
}

function colSpanCells(cells) {
  const nextCells = [];
  for (let i = 0; i < cells.length; i += 1) {
    const { width, colSpan } = cells[i].props;
    /**
     * 如果存在 colSpan 属性，就去找它的下一个 Cell,
     * 看看值是否是 isNullOrUndefined，，如果为空这可以合并这个单元格
     */

    if (colSpan) {
      let nextWidth = width;
      for (let j = 0; j < colSpan; j += 1) {
        const nextCell = cells[i + j];
        if (nextCell) {
          const {
            rowData,
            rowIndex,
            children,
            width: colSpanWidth,
            isHeaderCell,
            dataKey
          } = nextCell.props;
          const cellText = isFunction(children)
            ? children(rowData, rowIndex)
            : get(rowData, dataKey);

          if (
            (rowData && isNullOrUndefined(cellText)) ||
            (isHeaderCell && isNullOrUndefined(children))
          ) {
            nextWidth += colSpanWidth;
            cells[i + j] = cloneCell(nextCell, {
              removed: true
            });
          }
        }
      }

      nextCells.push(
        cloneCell(cells[i], {
          width: nextWidth
        })
      );
      continue;
    }
    nextCells.push(cells[i]);
  }
  return nextCells;
}

export default colSpanCells;
