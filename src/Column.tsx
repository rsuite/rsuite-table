import PropTypes from 'prop-types';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Column(_props: ColumnProps) {
  return null;
}

Column.defaultProps = {
  width: 100
};

Column.propTypes = {
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

export default Column;
