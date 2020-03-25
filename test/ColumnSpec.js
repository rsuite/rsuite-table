import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Column from '../src/Column';

describe('Column', () => {
  it('Should output a null', () => {
    const instance = ReactTestUtils.renderIntoDocument(<Column />);

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom, null);
  });
});
