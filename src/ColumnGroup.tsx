import * as React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { ColumnGroupProps } from './ColumnGroup.d';
import { defaultClassPrefix, prefix } from './utils/prefix';

const ColumnGroup = React.forwardRef((props: ColumnGroupProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    header,
    className,
    children,
    classPrefix,
    headerHeight,
    verticalAlign,
    width,
    ...rest
  } = props;

  const height = headerHeight / 2;
  const styles: React.CSSProperties = {
    height,
    width
  };

  const contentStyles = { ...styles, verticalAlign };
  const addPrefix = React.useCallback((name: string) => prefix(classPrefix)(name), []);

  return (
    <div ref={ref} className={classNames(classPrefix, className)} {...rest}>
      <div className={addPrefix('header')} style={styles}>
        <div className={addPrefix('header-content')} style={contentStyles}>
          {header}
        </div>
      </div>

      {React.Children.map(children, (node: React.ReactElement) => {
        const nodeStyles = { height, ...node.props?.style, top: styles.height };
        return React.cloneElement(node, {
          className: addPrefix('cell'),
          style: nodeStyles,
          headerHeight: height,
          verticalAlign,
          children: <span className={addPrefix('cell-content')}>{node.props.children}</span>
        });
      })}
    </div>
  );
});

ColumnGroup.displayName = 'ColumnGroup';
ColumnGroup.defaultProps = {
  headerHeight: 80,
  classPrefix: defaultClassPrefix('table-column-group')
};

ColumnGroup.propTypes = {
  header: PropTypes.node,
  classPrefix: PropTypes.string,
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom'])
};

export default ColumnGroup;
