import PropTypes from 'prop-types';

export interface ColumnProps {
  /** Alignment */
  align?: 'left' | 'center' | 'right';

  /** Merges column cells to merge when the dataKey value for the merged column is null or undefined. */
  colSpan?: number;

  /** Fixed column */
  fixed?: boolean | 'left' | 'right';

  /** Vertical alignment */
  verticalAlign?: 'top' | 'middle' | 'bottom';

  /** Column width */
  width?: number;

  /** Customizable Resize Column width */
  resizable?: boolean;

  /** Sortable */
  sortable?: boolean;

  /** A column of a tree */
  treeCol?: boolean;

  /** Set the column width automatically adjusts, when set flexGrow cannot set resizable and width property */
  flexGrow?: number;

  /** When you use flexGrow, you can set a minimum width by  minwidth */
  minWidth?: number;

  /** Callback function for resize the colum */
  onResize?: (columnWidth?: number, dataKey?: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Column(_props: ColumnProps) {
  return null;
}

const propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  width: PropTypes.number,
  fixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['left', 'right'])]),
  resizable: PropTypes.bool,
  sortable: PropTypes.bool,
  flexGrow: PropTypes.number,
  minWidth: PropTypes.number,
  colSpan: PropTypes.number,
  treeCol: PropTypes.bool,
  onResize: PropTypes.func
};

Column.displayName = 'Table.Column';
Column.defaultProps = {
  width: 100
};

Column.propTypes = propTypes;

export const columnHandledProps = Object.keys(propTypes);

export default Column;
