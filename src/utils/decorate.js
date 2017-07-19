
import PropTypes from 'prop-types';


export default function decorate(skin = {
  prefixClass: 'rsuite-table'
}) {
  return (Component) => {
    const { prefixClass } = skin;
    let propTypes = Component.propTypes || (Component.propTypes = {});
    let defaultProps = Component.defaultProps || (Component.defaultProps = {});

    propTypes.prefixClass = PropTypes.string;
    defaultProps.prefixClass = prefixClass;

    Component.prototype.prefix = className => `${prefixClass}-${className}`;

    return Component;
  };
}
