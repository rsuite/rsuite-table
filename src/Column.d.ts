export interface ColumnProps {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  width?: number;
  fixed?: boolean | 'left' | 'right';
  resizable?: boolean;
  sortable?: boolean;
  flexGrow?: number;
  minWidth?: number;
  colSpan?: number;
  treeCol?: boolean;
  onResize?: (columnWidth?: number, dataKey?: string) => void;
}

declare const Column: React.ComponentType<ColumnProps>;

export default Column;
