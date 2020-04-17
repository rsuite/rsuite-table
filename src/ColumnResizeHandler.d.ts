import * as React from 'react';
export type FixedType = boolean | 'left' | 'right';
export interface Client {
  clientX?: number;
  clientY?: number;
  preventDefault?: Function;
}

export interface ColumnResizeHandlerProps {
  height?: number;
  defaultColumnWidth?: number;
  columnLeft?: number;
  columnFixed?: FixedType;
  className?: string;
  classPrefix?: string;
  style?: React.CSSProperties;
  onColumnResizeStart?: (client: Client) => void;
  onColumnResizeEnd?: (columnWidth?: number, cursorDelta?: number) => void;
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: FixedType) => void;
}

declare const ColumnResizeHandler: React.ComponentType<ColumnResizeHandlerProps>;

export default ColumnResizeHandler;
