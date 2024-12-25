import React from 'react';
import ColumnGroup from '../ColumnGroup';
import { flatten } from 'lodash-es';
import { isFragment } from './react-is';

/**
 * Get the columns ReactElement array.
 * - Handling the case where there is an array of <Column> in children.
 * - Filter empty items in children.
 */
function getTableColumns(children) {
  const childrenArray = Array.isArray(children) ? children : [children];

  const flattenColumns = flatten(childrenArray).map((column: React.ReactElement) => {
    // If the column is a group, we need to get the columns from the children.
    if (column?.type === ColumnGroup) {
      const {
        header,
        children: groupChildren,
        align,
        fixed,
        verticalAlign,
        groupHeaderHeight
      } = column?.props;

      const childColumns = getTableColumns(groupChildren);

      return childColumns.map((childColumn, index) => {
        // Overwrite the props set by ColumnGroup to Column.
        const groupCellProps: any = {
          ...childColumn?.props,
          groupHeaderHeight,
          fixed,

          // Column extends the properties of Group （align，verticalAlign）
          align: childColumn?.props.align || align,
          verticalAlign: childColumn?.props.verticalAlign || verticalAlign
        };

        /**
         * Set attributes for the first column in the group:
         * @field groupCount: The number of grouping sub-items.
         * @field groupHeader: Group header title.
         * @field resizable: Set to not resizable.
         */

        if (index === 0) {
          groupCellProps.groupAlign = align;
          groupCellProps.groupVerticalAlign = verticalAlign;
          groupCellProps.groupCount = childColumns.length;
          groupCellProps.groupHeader = header;
          groupCellProps.resizable = false;
        }

        return React.cloneElement(childColumn, groupCellProps);
      });
    } else if (isFragment(column)) {
      // If the column is a fragment, we need to get the columns from the children.
      return getTableColumns(column.props?.children);
    } else if (Array.isArray(column)) {
      // If the column is an array, need check item in the array.
      return getTableColumns(column);
    }

    // If the column is not a group, we just return the column.
    return column;
  });

  // Flatten the array in Columns into a one-dimensional array, and calculate lastColumn and firstColumn.
  return flatten(flattenColumns).filter(Boolean);
}

export default getTableColumns;
