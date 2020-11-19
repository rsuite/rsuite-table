import * as React from 'react';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';
import ColumnGroup from '../ColumnGroup';

import isNullOrUndefined from './isNullOrUndefined';

function cloneCell(Cell, props) {
  return React.cloneElement(Cell, props);
}

function mergeCells(cells) {
  const nextCells = [];
  for (let i = 0; i < cells.length; i += 1) {
    const {
      width,
      colSpan,
      groupCount,
      groupHeader,
      isHeaderCell,
      headerHeight,
      verticalAlign
    } = cells[i].props;

    const groupChildren = [];

    /**
     * 为列头添加分组
     */
    if (groupCount && isHeaderCell) {
      let nextWidth = width;
      let left = 0;
      for (let j = 0; j < groupCount; j += 1) {
        const nextCell = cells[i + j];
        const { width: nextCellWidth, children } = nextCell.props;

        if (j !== 0) {
          nextWidth += nextCellWidth;
          left += cells[i + j - 1].props.width;
          cells[i + j] = cloneCell(nextCell, { removed: true });
        }
        groupChildren.push(
          <div key={j} style={{ width: nextCellWidth, left }}>
            {children}
          </div>
        );
      }
      nextCells.push(
        cloneCell(cells[i], {
          width: nextWidth,
          children: (
            <ColumnGroup
              width={nextWidth}
              headerHeight={headerHeight}
              header={groupHeader}
              verticalAlign={verticalAlign}
            >
              {groupChildren}
            </ColumnGroup>
          )
        })
      );
      continue;
    } else if (colSpan) {
      /**
       * 如果存在 colSpan 属性，就去找它的下一个 Cell,
       * 看看值是否是 isNullOrUndefined，，如果为空这可以合并这个单元格
       */
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
          width: nextWidth,
          'aria-colspan': colSpan && nextWidth > width ? colSpan : undefined
        })
      );
      continue;
    }
    nextCells.push(cells[i]);
  }
  return nextCells;
}

export default mergeCells;
