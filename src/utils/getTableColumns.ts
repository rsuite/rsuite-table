import React from 'react';
import flatten from 'lodash/flatten';
import ColumnGroup from '../ColumnGroup';

/**
 * Get the columns ReactElement array.
 * - Handling the case where there is an array of <Column> in children.
 * - Filter empty items in children.
 */
function getTableColumns(children) {
  if (!Array.isArray(children)) {
    return children as React.ReactNodeArray;
  }

  const flattenColumns = flatten(children).map((column: React.ReactElement) => {
    if (column?.type === ColumnGroup) {
      const {
        header,
        children: childColumns,
        align,
        fixed,
        verticalAlign,
        groupHeaderHeight
      } = column?.props;

      return childColumns.map((childColumn, index) => {
        // Overwrite the props set by ColumnGroup to Column.
        const groupCellProps: any = {
          ...childColumn?.props,
          groupHeaderHeight,
          align,
          fixed,
          verticalAlign
        };

        /**
         * Set attributes for the first column in the group:
         * @field groupCount: The number of grouping sub-items.
         * @field groupHeader: Group header title.
         * @field resizable: Set to not resizable.
         */
        if (index === 0) {
          groupCellProps.groupCount = childColumns.length;
          groupCellProps.groupHeader = header;
          groupCellProps.resizable = false;
        }

        return React.cloneElement(childColumn, groupCellProps);
      });
    }
    return column;
  });

  // Flatten the array in Columns into a one-dimensional array, and calculate lastColumn and firstColumn.
  return flatten(flattenColumns).filter(col => col);
}

export default getTableColumns;
