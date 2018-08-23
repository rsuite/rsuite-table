import React from 'react';
import _ from 'lodash';

function getTotalByColumns(columns) {
  let totalFlexGrow = 0;
  let totalWidth = 0;

  const count = items => {
    Array.from(items).forEach(column => {
      if (React.isValidElement(column)) {
        const { flexGrow, width = 0 } = column.props;
        totalFlexGrow += flexGrow || 0;
        totalWidth += flexGrow ? 0 : width;
      } else if (_.isArray(column)) {
        count(column);
      }
    });
  };

  if (_.isArray(columns)) {
    count(columns);
  } else if (_.isPlainObject(columns)) {
    const { flexGrow, width = 0 } = columns.props;

    totalFlexGrow = flexGrow || 0;
    totalWidth = flexGrow ? 0 : width;
  }

  return {
    totalFlexGrow,
    totalWidth
  };
}

export default getTotalByColumns;
