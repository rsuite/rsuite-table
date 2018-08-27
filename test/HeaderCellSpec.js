import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';

import { getDOMNode, getInstance } from './TestWrapper';
import HeaderCell from '../src/HeaderCell';

describe('HeaderCell', () => {
  it('Should output a header', () => {
    const instanceDom = getDOMNode(<HeaderCell>test</HeaderCell>);
    assert.equal(instanceDom.className, 'rs-table-cell-header');
  });

  it('Should call `onSortColumn` callback', done => {
    const doneOp = (dataKey, sortType) => {
      if (dataKey === 'name' && sortType === 'desc') {
        done();
      }
    };

    const instanceDom = getDOMNode(
      <HeaderCell onSortColumn={doneOp} sortable dataKey="name">
        test
      </HeaderCell>
    );

    ReactTestUtils.Simulate.click(instanceDom.querySelector('.rs-table-cell'));
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

    ReactTestUtils.Simulate.mouseDown(instanceDom.querySelector('.rs-table-column-resize-spanner'));
  });

  it('Should call `onColumnResizeEnd` callback', done => {
    const instance = getInstance(
      <HeaderCell
        width={100}
        onColumnResizeEnd={() => {
          done();
        }}
      />
    );
    instance.handleColumnResizeEnd(10, 2);
  });

  it('Should call `onResize` callback', done => {
    const instance = getInstance(
      <HeaderCell
        width={100}
        onResize={() => {
          done();
        }}
      />
    );
    instance.handleColumnResizeEnd(10, 2);
  });
});
