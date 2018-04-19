import React from 'react';

import CellGroup from '../src/CellGroup';
import { getDOMNode } from './TestWrapper';

describe('CellGroup', () => {
  it('Should output a cell group', () => {
    const Title = 'Title';
    const instanceDom = getDOMNode(<CellGroup>Title</CellGroup>);
    assert.include(instanceDom.className, 'rs-table-cell-group');
    assert.equal(instanceDom.style.transform, 'translate3d(0px, 0px, 0px)');
    assert.equal(instanceDom.innerText, Title);
  });

  it('Should be 100 the width', () => {
    const instanceDom = getDOMNode(<CellGroup width={100} />);

    assert.equal(instanceDom.style.width, '100px');
  });

  it('Should be 100 the height', () => {
    const instanceDom = getDOMNode(<CellGroup height={100} />);

    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should be 100 the left', () => {
    const instanceDom = getDOMNode(<CellGroup left={100} />);

    assert.equal(instanceDom.style.transform, 'translate3d(100px, 0px, 0px)');
  });

  it('Should be fixed', () => {
    const instanceDom = getDOMNode(<CellGroup fixed />);

    assert.ok(instanceDom.className.match(/\bfixed\b/));
  });

  it('Should have a custom className', () => {
    const instanceDom = getDOMNode(<CellGroup className="custom" />);
    assert.ok(instanceDom.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instanceDom = getDOMNode(<CellGroup style={{ fontSize }} />);
    assert.equal(instanceDom.style.fontSize, fontSize);
  });
});
