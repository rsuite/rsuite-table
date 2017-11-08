import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import sinon from 'sinon';
import { mount } from 'enzyme';

import HeaderCell from '../src/HeaderCell';



describe('HeaderCell', () => {

  it('Should output a header', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <HeaderCell >test</HeaderCell>
    );

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.className, 'rsuite-table-cell-header');
  });


  it('Should call `onSortColumn` callback', (done) => {

    const doneOp = () => {
      done();
    };

    const instance = ReactTestUtils.renderIntoDocument(
      <HeaderCell onSortColumn={doneOp} sortable>test</HeaderCell>
    );
    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.click(instanceDom.querySelector('.rsuite-table-cell'));
  });

  it('Should call `onColumnResizeStart` callback', (done) => {

    const doneOp = () => {
      done();
    };

    const instance = ReactTestUtils.renderIntoDocument(
      <HeaderCell onColumnResizeStart={doneOp} resizable>test</HeaderCell>
    );
    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.mouseDown(instanceDom.querySelector('.rsuite-table-column-resize-spanner'));
  });

  it('Should update props', () => {

    const wrapper = mount(<HeaderCell width={100} flexGrow={1} />);
    wrapper.setProps({
      width: 200,
      flexGrow: 2
    });

    expect(wrapper.props().width).to.equal(200);
    expect(wrapper.props().flexGrow).to.equal(2);

  });

  it('Should call `onColumnResizeEnd` callback', (done) => {

    const wrapper = mount(
      <HeaderCell
        width={100}
        onColumnResizeEnd={() => {
          done();
        }}
      />
    );
    wrapper.instance().onColumnResizeEnd(10, 2);

  });

});
