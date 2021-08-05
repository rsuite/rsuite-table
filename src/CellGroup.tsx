import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from './utils';
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

  const { translateDOMPositionXY } = useContext(TableContext);
  const { withClassPrefix, merge } = useClassNames(classPrefix);
  const classes = merge(className, withClassPrefix({ [`fixed-${fixed}`]: fixed, scroll: !fixed }));

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

CellGroup.displayName = 'Table.CellGroup';
CellGroup.propTypes = {
  fixed: PropTypes.oneOf(['left', 'right']),
  width: PropTypes.number,
  height: PropTypes.number,
  left: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string,
  classPrefix: PropTypes.string
};
CellGroup.defaultProps = {
  classPrefix: 'cell-group'
};
export default CellGroup;
