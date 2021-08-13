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

  /**
   * The height of the header of the merged cell group.
   * The default value is the square value of the table `headerHeight` value.
   * */
  groupHeaderHeight?: number;

  /** Group header */
  header?: React.ReactNode;
  width?: number;
  headerHeight?: number;
}

const ColumnGroup = React.forwardRef((props: ColumnGroupProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    header,
    className,
    children,
    classPrefix,
    headerHeight,
    verticalAlign,
    width,
    groupHeaderHeight: groupHeightProp,
    ...rest
  } = props;

  const hasGroupHeight = typeof groupHeightProp !== 'undefined';
  const groupHeight = hasGroupHeight ? groupHeightProp : headerHeight / 2;
  const restHeight = hasGroupHeight ? headerHeight - groupHeightProp : headerHeight / 2;

  const styles: React.CSSProperties = {
    height: groupHeight,
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
          predefinedStyle: { height: restHeight, top: styles.height },
          headerHeight: restHeight,
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
  groupHeaderHeight: PropTypes.number,
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom'])
};

export default ColumnGroup;
