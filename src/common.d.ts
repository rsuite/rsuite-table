export interface StandardProps {
  /** The prefix of the component CSS class */
  classPrefix?: string;

  /** Additional classes */
  className?: string;

  /** Additional style */
  style?: React.CSSProperties;

  [key: string]: any;
}

export type SortType = 'desc' | 'asc';
export interface RowDataType {
  dataKey: string;
  [key: string]: any;
}
