import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from './utils';
import { StandardProps } from './@types/common';

export interface ColumnGroupProps extends StandardProps {
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Vertical alignment */
  verticalAlign?: 'top' | 'middle' | 'bottom';
  /** Fixed column */
  fixed?: boolean | 'left' | 'right';

  /** Group header */
  header?: React.ReactNode;
  width?: number;
  headerHeight?: number;
}

const ColumnGroup = React.forwardRef((props: ColumnGroupProps, ref: React.Ref<HTMLDivElement>) => {
  const { header, className, children, classPrefix, headerHeight, verticalAlign, width, ...rest } =
    props;

  const height = headerHeight / 2;
  const styles: React.CSSProperties = {
    height,
    width
  };

  const { withClassPrefix, merge, prefix } = useClassNames(classPrefix);
  const classes = merge(className, withClassPrefix());
  const contentStyles = { ...styles, verticalAlign };

  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={prefix('header')} style={styles}>
        <div className={prefix('header-content')} style={contentStyles}>
          {header}
        </div>
      </div>

      {React.Children.map(children, (node: React.ReactElement) => {
        return React.cloneElement(node, {
          className: prefix('cell'),
          predefinedStyle: { height, top: styles.height },
          headerHeight: height,
          verticalAlign,
          children: <span className={prefix('cell-content')}>{node.props.children}</span>
        });
      })}
    </div>
  );
});

ColumnGroup.displayName = 'Table.ColumnGroup';
ColumnGroup.defaultProps = {
  headerHeight: 80,
  classPrefix: 'column-group'
};

ColumnGroup.propTypes = {
  header: PropTypes.node,
  classPrefix: PropTypes.string,
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom'])
};

export default ColumnGroup;
