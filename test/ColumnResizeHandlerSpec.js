import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import sinon from 'sinon';
import { mount } from 'enzyme';

import ColumnResizeHandler from '../src/ColumnResizeHandler';


const handlerWidth = 6;
const handlerLeft = -2;

describe('ColumnResizeHandler', () => {

  it('Should output a handler', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.className, 'rsuite-table-column-resize-spanner');
    assert.equal(instanceDom.style.width, `${handlerWidth}px`);
  });

  it('Should be 100 the `height` ', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler height={100} />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should have a `left` style', () => {
    const columnWidth = 100;
    const columnLeft = 100;
    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler columnWidth={columnWidth} columnLeft={columnLeft} />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.left, `${columnWidth + columnLeft + handlerLeft}px`);
  });

  it('Should call `onColumnResizeStart` callback ', (done) => {
    const doneOp = () => {
      done();
    };

    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler onColumnResizeStart={doneOp} />
    );
    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.mouseDown(instanceDom);
  });

  it('Should be true for `isKeyDown` value when trigger mouseDown', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler />
    );

    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.mouseDown(instanceDom);
    expect(instance.isKeyDown).to.equal(true);

  });

  it('Should call `onColumnResizeMove` callback', (done) => {
    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler
        onColumnResizeMove={() => {
          done();
        }}
      />
    );

    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.mouseDown(instanceDom);

    ReactTestUtils.Simulate.mouseMove(document.body);
    instance.onMove(10);
  });

  it('Should not call `onColumnResizeMove` callback', () => {
    const resize = sinon.spy();

    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler
        onColumnResizeMove={resize}
      />
    );
    instance.isKeyDown = false;
    instance.onMove(10);

    expect(resize.callCount).to.equal(0);

  });

  it('Should call `onColumnResizeEnd` callback', (done) => {
    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler
        onColumnResizeEnd={() => {
          done();
        }}
      />
    );
    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.mouseDown(instanceDom);
    instance.onColumnResizeEnd();
  });


  it('Should have a custom className', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler className="custom" />
    );
    assert.ok(findDOMNode(instance).className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = ReactTestUtils.renderIntoDocument(
      <ColumnResizeHandler style={{ fontSize }} />
    );
    assert.equal(findDOMNode(instance).style.fontSize, fontSize);
  });

  it('Should be a complete life cycle', () => {


    const wrapper = mount(<ColumnResizeHandler />);

    wrapper.setProps({
      columnWidth: 20
    });

    console.log(wrapper.html());

    assert.ok(wrapper.html().match(/left: 18px;/));

    wrapper.simulate('mouseDown');
    wrapper.unmount();

  });

});
