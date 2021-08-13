import React from 'react';

import CellGroup from '../src/CellGroup';
import { getDOMNode } from './utils';

describe('CellGroup', () => {
  it('Should output a cell group', () => {
    const Title = 'Title';
    const instance = getDOMNode(<CellGroup>Title</CellGroup>);
    assert.include(instance.className, 'rs-cell-group');
    assert.equal(instance.style.transform, 'translate3d(0px, 0px, 0px)');
    assert.equal(instance.innerText, Title);
  });

  it('Should be 100 the width', () => {
    const instance = getDOMNode(<CellGroup width={100} />);

    assert.equal(instance.style.width, '100px');
  });

  it('Should be 100 the height', () => {
    const instance = getDOMNode(<CellGroup height={100} />);

    assert.equal(instance.style.height, '100px');
  });

  it('Should be 100 the left', () => {
    const instance = getDOMNode(<CellGroup left={100} />);

    assert.equal(instance.style.transform, 'translate3d(100px, 0px, 0px)');
  });

  it('Should be fixed', () => {
    const instance = getDOMNode(<CellGroup fixed="left" />);

    assert.ok(instance.className.match(/\bfixed\b/));
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<CellGroup className="custom" />);
    assert.ok(instance.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<CellGroup style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });
});
