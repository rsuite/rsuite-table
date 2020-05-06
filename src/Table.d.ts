import * as React from 'react';
import { StandardProps, SortType, RowDataType } from './common';

export interface TableProps extends StandardProps {
  width?: number;
  data: object[];
  height: number;
  autoHeight?: boolean;
  minHeight: number;
  rowHeight: number | ((rowData: object) => number);
  headerHeight: number;
  rowKey: string | number;
  isTree?: boolean;
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: string[] | number[];
  expandedRowKeys?: string[] | number[];
  renderTreeToggle?: (
    expandButton: React.ReactNode,
    rowData?: RowDataType,
    expanded?: boolean
  ) => React.ReactNode;
  renderRowExpanded?: (rowDate?: object) => React.ReactNode;
  rowExpandedHeight?: number;
  locale: any;
  style?: React.CSSProperties;
  sortColumn?: string;
  sortType?: SortType;
  defaultSortType?: SortType;
  disabledScroll?: boolean;
  hover: boolean;
  loading?: boolean;
  className?: string;
  classPrefix?: string;
  children: React.ReactNode;
  bordered?: boolean;
  cellBordered?: boolean;
  wordWrap?: boolean;
  onRowClick?: (rowData: object, event: React.MouseEvent) => void;
  onRowContextMenu?: (rowData: object, event: React.MouseEvent) => void;
  onScroll?: (scrollX: number, scrollY: number) => void;
  onSortColumn?: (dataKey: string, sortType?: SortType) => void;
  onExpandChange?: (expanded: boolean, rowData: object) => void;
  onTouchStart?: (event: React.TouchEvent) => void; // for tests
  onTouchMove?: (event: React.TouchEvent) => void; // for tests
  bodyRef?: (ref: HTMLElement) => void;
  loadAnimation?: boolean;
  showHeader?: boolean;
  rowClassName?: string | ((rowData: object) => string);
  virtualized?: boolean;
  renderEmpty?: (info: React.ReactNode) => React.ReactNode;
  renderLoading?: (loading: React.ReactNode) => React.ReactNode;
  translate3d?: boolean;
  affixHeader?: boolean | number;
  affixHorizontalScrollbar?: boolean | number;
  rtl?: boolean;
  onDataUpdated?: (nextData: object[], scrollTo: (coord: { x: number; y: number }) => void) => void;
  shouldUpdateScroll?: boolean;
}
