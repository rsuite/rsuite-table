import React from 'react';
import PropTypes from 'prop-types';
import { TableLocaleType } from './@types/common';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  locale: TableLocaleType;
  loadAnimation: boolean;
  loading: boolean;
  addPrefix: (...classes: any) => string;
  renderLoading: (loading: React.ReactNode) => any;
}

const Loader = React.forwardRef((props: LoaderProps, ref: React.Ref<HTMLDivElement>) => {
  const { loadAnimation, loading, locale, addPrefix, renderLoading } = props;

  if (!loadAnimation && !loading) {
    return null;
  }

  const loadingElement = (
    <div ref={ref} className={addPrefix('loader-wrapper')}>
      <div className={addPrefix('loader')}>
        <i className={addPrefix('loader-icon')} />
        <span className={addPrefix('loader-text')}>{locale?.loading}</span>
      </div>
    </div>
  );

  return renderLoading ? renderLoading(loadingElement) : loadingElement;
});

Loader.propTypes = {
  locale: PropTypes.object,
  loadAnimation: PropTypes.bool,
  loading: PropTypes.bool,
  addPrefix: PropTypes.func,
  renderLoading: PropTypes.func
};
Loader.displayName = 'Table.Loader';

export default Loader;
