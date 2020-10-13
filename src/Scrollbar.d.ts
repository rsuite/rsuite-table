import * as React from 'react';

export interface ScrollbarProps {
  vertical?: boolean;
  length: number;
  scrollLength: number;
  className?: string;
  classPrefix?: string;
  tableId?: string;
  onScroll?: (delta: number, event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  [key: string]: any;
}

declare const Scrollbar: React.ComponentType<ScrollbarProps>;

export default Scrollbar;
