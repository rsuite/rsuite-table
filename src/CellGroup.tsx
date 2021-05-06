import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultClassPrefix, prefix } from './utils';
import TableContext from './TableContext';

export interface CellGroupProps {
  fixed?: 'left' | 'right';
  width?: number;
  height?: number;
  left?: number;
  style?: React.CSSProperties;
  className?: string;
  classPrefix?: string;
  children?: React.ReactNode;
}

const CellGroup = React.forwardRef((props: CellGroupProps, ref: React.Ref<HTMLDivElement>) => {
  const { fixed, width, left, height, style, classPrefix, className, children, ...rest } = props;

  const { translateDOMPositionXY, classPrefix: tableClassPrefix } = useContext(TableContext);
  const addPrefix = (name: string) =>
    prefix(classPrefix || defaultClassPrefix('table-cell-group', tableClassPrefix))(name);

  const classes = classNames(classPrefix, className, {
    [addPrefix(`fixed-${fixed || ''}`)]: fixed,
    [addPrefix('scroll')]: !fixed
  });
  const styles = {
    width,
    height,
    ...style
  };

  translateDOMPositionXY?.(styles, left, 0);

  return (
    <div {...rest} ref={ref} className={classes} style={styles}>
      {children}
    </div>
  );
});

CellGroup.displayName = 'CellGroup';
CellGroup.propTypes = {
  fixed: PropTypes.oneOf(['left', 'right']),
  width: PropTypes.number,
  height: PropTypes.number,
  left: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string,
  classPrefix: PropTypes.string
};

export default CellGroup;
