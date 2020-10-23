import { CellProps } from './Cell.d';

export interface HeaderCellProps extends CellProps {
  index?: number;
  sortColumn?: string;
  sortType?: 'desc' | 'asc';
  sortable?: boolean;
  resizable?: boolean;
  onColumnResizeStart?: (columnWidth?: number, left?: number, fixed?: boolean) => void;
  onColumnResizeEnd?: (
    columnWidth?: number,
    cursorDelta?: number,
    dataKey?: any,
    index?: number
  ) => void;
  onResize?: (columnWidth?: number, dataKey?: string) => void;
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: boolean) => void;
  onSortColumn?: (dataKey?: string) => void;
  flexGrow?: number;
  fixed?: boolean | 'left' | 'right';
  children: React.ReactNode;
}

declare const HeaderCell: React.ComponentType<HeaderCellProps>;

export default HeaderCell;
