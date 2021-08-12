import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { getDOMNode } from './utils';
import HeaderCell from '../src/HeaderCell';

describe('HeaderCell', () => {
  it('Should output a header', () => {
    const instanceDom = getDOMNode(<HeaderCell>test</HeaderCell>);
    assert.equal(instanceDom.className, 'rs-cell-header');
  });

  it('Should output default sort icon', () => {
    const instanceDom = getDOMNode(
      <HeaderCell sortable dataKey="name">
        test
      </HeaderCell>
    );
    assert.isNotNull(instanceDom.querySelector('.rs-cell-header-icon-sort'));
  });

  it('Should output default sort desc icon', () => {
    const instanceDom = getDOMNode(
      <HeaderCell sortable sortColumn="name" sortType="desc" dataKey="name">
        test
      </HeaderCell>
    );
    assert.isNotNull(instanceDom.querySelector('.rs-cell-header-icon-sort-desc'));
  });

  it('Should call `onSortColumn` callback', done => {
    const doneOp = dataKey => {
      if (dataKey === 'name') {
        done();
      }
    };

    const instanceDom = getDOMNode(
      <HeaderCell width={100} onSortColumn={doneOp} sortable dataKey="name">
        test
      </HeaderCell>
    );

    ReactTestUtils.Simulate.click(instanceDom.querySelector('.rs-cell'));
  });

  it('Should call `onColumnResizeStart` callback', done => {
    const doneOp = () => {
      done();
    };

    const instanceDom = getDOMNode(
      <HeaderCell onColumnResizeStart={doneOp} resizable>
        test
      </HeaderCell>
    );

    ReactTestUtils.Simulate.mouseDown(instanceDom.querySelector('.rs-column-resize-spanner'));
  });
});
