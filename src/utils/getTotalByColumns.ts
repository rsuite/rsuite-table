import React from 'react';
import isPlainObject from 'lodash/isPlainObject';
import getColumnProps from './getColumnProps';
import type { RowDataType } from '../types';
import type { ColumnProps } from '../Column';

function getTotalByColumns<Row extends RowDataType>(
  columns: React.ReactElement<ColumnProps<Row>> | React.ReactElement<ColumnProps<Row>>[]
) {
  let totalFlexGrow = 0;
  let totalWidth = 0;

  const count = (items: React.ReactNode[]) => {
    Array.from(items).forEach(column => {
      if (React.isValidElement(column)) {
        const { flexGrow, width } = getColumnProps<Row>(column);
        totalFlexGrow += flexGrow || 0;
        totalWidth += flexGrow ? 0 : width;
      } else if (Array.isArray(column)) {
        count(column);
      }
    });
  };

  if (Array.isArray(columns)) {
    count(columns);
  } else if (isPlainObject(columns)) {
    const { flexGrow, width } = getColumnProps<Row>(columns);

    totalFlexGrow = flexGrow || 0;
    totalWidth = flexGrow ? 0 : width;
  }

  return {
    totalFlexGrow,
    totalWidth
  };
}

export default getTotalByColumns;
