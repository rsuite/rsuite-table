import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Scrollbar from '../src/Scrollbar';


describe('Scrollbar', () => {

  it('Should output a scrollbar', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Scrollbar />
    );

    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.className.match(/\brsuite-table-scrollbar-wrapper horizontal\b/));
  });

  it('Should be vertical', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Scrollbar vertical />
    );

    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.className.match(/\bvertical\b/));
  });

  it('Should render a scroll handle', () => {
    const scrollLength = 1000;
    const length = 100;
    const instance = ReactTestUtils.renderIntoDocument(
      <Scrollbar scrollLength={scrollLength} length={length} />
    );
    assert.ok(instance.handle.style.width, `${scrollLength / length}%`);
  });

  it('Should call onMouseDown callback', (done) => {
    const doneOp = () => {
      done();
    };
    const instance = ReactTestUtils.renderIntoDocument(
      <Scrollbar onMouseDown={doneOp} />
    );
    ReactTestUtils.Simulate.mouseDown(instance.handle);
  });


  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = ReactTestUtils.renderIntoDocument(
      <Scrollbar style={{ fontSize }} />
    );
    assert.equal(findDOMNode(instance).style.fontSize, fontSize);
  });

});
