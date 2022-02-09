import React from 'react';
import isPlainObject from 'lodash/isPlainObject';
import { ColumnProps } from '../Column';

function getTotalByColumns(columns: React.ReactElement<ColumnProps> | React.ReactNode[]) {
  let totalFlexGrow = 0;
  let totalWidth = 0;

  const count = (items: React.ReactNode[]) => {
    Array.from(items).forEach(column => {
      if (React.isValidElement(column)) {
        const { flexGrow, width = 0 } = column.props as ColumnProps;
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
    const { flexGrow, width = 0 } = columns?.props;

    totalFlexGrow = flexGrow || 0;
    totalWidth = flexGrow ? 0 : width;
  }

  return {
    totalFlexGrow,
    totalWidth
  };
}

export default getTotalByColumns;
