import React from 'react';
import { RowDataType } from '../@types/common';
import { ColumnProps } from '../Column';

/**
 * Get the union of the props of the column itself and the props of the custom column
 *
 * e.g.
 * const CustomColumn = React.forwardRef((props, ref) => {
 *   return <Column ref={ref} sortable align="center" flexGrow={1} fullText {...props} />;
 * });
 *
 * <CustomColumn width={100} >
 *   <HeaderCell>Header</HeaderCell>
 *   <Cell>Cell</Cell>
 * </CustomColumn>
 *
 */
export default function getColumnProps<Row extends RowDataType>(
  column: React.ReactElement
): ColumnProps<Row> {
  const columnDefaultProps = column['type']?.['render']?.()?.props || {};

  return { ...columnDefaultProps, ...column?.props };
}
