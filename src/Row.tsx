import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultClassPrefix, prefix, mergeRefs } from './utils';
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

  const addPrefix = prefix(classPrefix);
  const classes = classNames(classPrefix, className, {
    [addPrefix('header')]: isHeaderRow
  });
  const { translateDOMPositionXY } = useContext(TableContext);

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

Row.displayName = 'Row';
Row.defaultProps = {
  classPrefix: defaultClassPrefix('table-row'),
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
