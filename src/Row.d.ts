import * as React from 'react';
import { StandardProps } from './common';

export interface RowProps extends StandardProps {
  width?: number;
  height?: number;
  headerHeight?: number;
  top?: number;
  isHeaderRow?: boolean;
  rowRef?: React.Ref<any>;
  className?: string;
  classPrefix?: string;
  style?: React.CSSProperties;
}

declare const Row: React.ComponentType<RowProps>;

export default Row;
