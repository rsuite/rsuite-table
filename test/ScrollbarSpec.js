import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import sinon from 'sinon';

import { getDOMNode, getInstance } from './TestWrapper';
import Scrollbar from '../src/Scrollbar';

describe('Scrollbar', () => {
  it('Should output a scrollbar', () => {
    const instanceDom = getDOMNode(<Scrollbar />);
    assert.include(instanceDom.className, 'rs-table-scrollbar');
  });

  it('Should be vertical', () => {
    const instanceDom = getDOMNode(<Scrollbar vertical />);

    assert.ok(instanceDom.className.match(/\bvertical\b/));
  });

  it('Should render a scroll handle', () => {
    const scrollLength = 1000;
    const length = 100;
    const instance = getInstance(<Scrollbar scrollLength={scrollLength} length={length} />);
    assert.ok(instance.handle.style.width, `${scrollLength / length}%`);
  });

  it('Should call onMouseDown callback', done => {
    const doneOp = () => {
      done();
    };
    const instance = getInstance(<Scrollbar onMouseDown={doneOp} />);
    ReactTestUtils.Simulate.mouseDown(instance.handle);
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instanceDom = getDOMNode(<Scrollbar style={{ fontSize }} />);
    assert.equal(instanceDom.style.fontSize, fontSize);
  });

  it('Should call `onScroll` callback', done => {
    const instance = getInstance(
      <Scrollbar
        onScroll={() => {
          done();
        }}
      />
    );

    ReactTestUtils.Simulate.mouseDown(instance.handle);
    ReactTestUtils.Simulate.mouseMove(document.body);
    instance.hanldeDragMove(10, 10);
    instance.hanldeDragEnd();
  });

  it('Should call `onScroll` callback by click', done => {
    const instance = getInstance(
      <Scrollbar
        onScroll={() => {
          done();
        }}
      />
    );
    ReactTestUtils.Simulate.click(instance.bar);
  });

  it('Should not call `onScroll` callback by click', () => {
    const scroll = sinon.spy();
    const instance = getInstance(<Scrollbar onScroll={scroll} />);
    ReactTestUtils.Simulate.click(instance.handle);
    expect(scroll.callCount).to.equal(0);
  });

  it('Should not call `onScroll` callback', () => {
    const scroll = sinon.spy();
    const instance = getInstance(<Scrollbar onScroll={scroll} />);
    instance.hanldeDragMove(10, 10);
    instance.hanldeDragEnd();
    expect(scroll.callCount).to.equal(0);
  });

  it('Should not call `onScroll` callback', () => {
    const instance = getInstance(<Scrollbar length={100} scrollLength={1000} onScroll={scroll} />);
    instance.onWheelScroll(100);
    expect(
      findDOMNode(instance).innerHTML.match(/translate3d\(\d+px,\s*(\d+)px,\s*(\d+)px\)/i)[0]
    ).be.equal('translate3d(10px, 0px, 0px)');
  });

});
