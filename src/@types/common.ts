export interface StandardProps extends React.HTMLAttributes<HTMLElement> {
  /** The prefix of the component CSS class */
  classPrefix?: string;

  /** Additional classes */
  className?: string;

  /** Primary content */
  children?: React.ReactNode;

  /** Additional style */
  style?: React.CSSProperties;
}

export type SortType = 'desc' | 'asc';
export interface RowDataType {
  dataKey?: string;
  [key: string]: any;
}

export type RowKeyType = string | number;
