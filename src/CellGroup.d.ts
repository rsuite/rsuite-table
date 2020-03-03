export interface CellGroupProps {
  fixed?: 'left' | 'right';
  width?: number;
  height?: number;
  left?: number;
  style?: React.CSSProperties;
  className?: string;
  classPrefix?: string;
}

declare const CellGroup: React.ComponentType<CellGroupProps>;

export default CellGroup;
