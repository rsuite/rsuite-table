import React from 'react';
import flatten from 'lodash/flatten';
import ColumnGroup from '../ColumnGroup';

/**
 * 获取 columns ReactElement 数组
 * - 处理 children 中存在 <Column> 数组的情况
 * - 过滤 children 中的空项
 */
function getTableColumns(children) {
  if (!Array.isArray(children)) {
    return children as React.ReactNodeArray;
  }

  const flattenColumns = flatten(children).map((column: React.ReactElement) => {
    if (column?.type === ColumnGroup) {
      const { header, children: childColumns, align, fixed, verticalAlign } = column?.props;
      return childColumns.map((childColumn, index) => {
        // 把 ColumnGroup 设置的属性覆盖到 Column
        const groupCellProps: any = {
          ...childColumn?.props,
          align,
          fixed,
          verticalAlign
        };

        /**
         * 为分组中的第一列设置属性:
         * groupCount: 分组子项个数
         * groupHeader: 分组标题
         * resizable: 设置为不可自定义列宽
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

  // 把 Columns 中的数组，展平为一维数组，计算 lastColumn 与 firstColumn。
  return flatten(flattenColumns).filter(col => col);
}

export default getTableColumns;
