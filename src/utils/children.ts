import React from 'react';
import * as ReactIS from 'react-is';

export const flattenChildren = (
  children: React.ReactNode | React.ReactNode[],
  flattened: React.ReactNode[] = []
) => {
  for (const child of React.Children.toArray(children)) {
    if (ReactIS.isFragment(child)) {
      const childEl = child as React.ReactElement;
      if (childEl.props?.children) {
        flattenChildren(childEl.props.children, flattened);
      }
    } else {
      flattened.push(child);
    }
  }
  return flattened;
};
