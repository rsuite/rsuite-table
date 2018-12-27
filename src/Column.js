// @flow

type Props = {
  align?: 'left' | 'center' | 'right',
  width?: number,
  fixed?: boolean | 'left' | 'right',
  resizable?: boolean,
  sortable?: boolean,
  flexGrow?: number,
  minWidth?: number,
  colSpan?: number,
  onResize?: (columnWidth?: number, dataKey?: string) => void
};

/* eslint-disable */
function Column(props: Props) {
  return null;
}

Column.defaultProps = {
  width: 100
};

export default Column;
