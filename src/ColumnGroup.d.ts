export interface ColumnGroupProps {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  fixed?: boolean | 'left' | 'right';
  width?: number;
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerHeight?: number;
}

declare const Column: React.ComponentType<ColumnGroupProps>;

export default Column;
