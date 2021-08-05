import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { mergeRefs, useClassNames } from './utils';
import TableContext from './TableContext';
import { StandardProps } from './@types/common';

export interface RowProps extends StandardProps {
  width?: number;
  height?: number;
  headerHeight?: number;
  top?: number;
  isHeaderRow?: boolean;
  rowRef?: any;
}

const Row = React.forwardRef((props: RowProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    className,
    width,
    height,
    top,
    style,
    isHeaderRow,
    headerHeight,
    rowRef,
    classPrefix,
    children,
    ...rest
  } = props;

  const { translateDOMPositionXY } = useContext(TableContext);
  const { withClassPrefix, merge } = useClassNames(classPrefix);
  const classes = merge(className, withClassPrefix({ header: isHeaderRow }));

  const styles = {
    minWidth: width,
    height: isHeaderRow ? headerHeight : height,
    ...style
  };

  translateDOMPositionXY?.(styles, 0, top);

  return (
    <div role="row" {...rest} ref={mergeRefs(rowRef, ref)} className={classes} style={styles}>
      {children}
    </div>
  );
});

Row.displayName = 'Table.Row';
Row.defaultProps = {
  classPrefix: 'row',
  height: 46,
  headerHeight: 40
};
Row.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  headerHeight: PropTypes.number,
  top: PropTypes.number,
  isHeaderRow: PropTypes.bool,
  rowRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  style: PropTypes.object
};

export default Row;
