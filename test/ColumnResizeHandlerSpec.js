import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import ColumnResizeHandler from '../src/ColumnResizeHandler';
import { getDOMNode } from './utils';

const handlerLeft = -2;

describe('ColumnResizeHandler', () => {
  it('Should output a handler', () => {
    const instance = getDOMNode(<ColumnResizeHandler />);
    assert.include(instance.className, 'rs-column-resize-spanner');
  });

  it('Should be 100 the `height` ', () => {
    const instance = getDOMNode(<ColumnResizeHandler height={100} />);

    assert.equal(instance.style.height, '100px');
  });

  it('Should have a `left` style', () => {
    const columnWidth = 100;
    const columnLeft = 100;
    const instance = getDOMNode(
      <ColumnResizeHandler defaultColumnWidth={columnWidth} columnLeft={columnLeft} />
    );

    assert.equal(instance.style.left, `${columnWidth + columnLeft + handlerLeft}px`);
  });

  it('Should call `onColumnResizeStart` callback ', done => {
    const doneOp = () => {
      done();
    };

    const instance = getDOMNode(<ColumnResizeHandler onColumnResizeStart={doneOp} />);

    ReactTestUtils.Simulate.mouseDown(instance);
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<ColumnResizeHandler className="custom" />);
    assert.ok(instance.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<ColumnResizeHandler style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });
});
