import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import { getDOMNode } from './utils';
import HeaderCell from '../src/HeaderCell';

describe('HeaderCell', () => {
  it('Should output a header', () => {
    const instance = getDOMNode(<HeaderCell>test</HeaderCell>);
    assert.equal(instance.className, 'rs-cell-header');
  });

  it('Should output default sort icon', () => {
    const instance = getDOMNode(
      <HeaderCell sortable dataKey="name">
        test
      </HeaderCell>
    );
    assert.isNotNull(instance.querySelector('.rs-cell-header-icon-sort'));
  });

  it('Should output default sort desc icon', () => {
    render(
      <HeaderCell sortable sortColumn="name" sortType="desc" dataKey="name">
        test
      </HeaderCell>
    );

    expect(
      screen.getByRole('columnheader').querySelector('.rs-cell-header-icon-sort')
    ).to.have.attribute('data-sort', 'desc');
  });

  it('Should call `onSortColumn` callback', done => {
    const doneOp = dataKey => {
      if (dataKey === 'name') {
        done();
      }
    };

    const instance = getDOMNode(
      <HeaderCell width={100} onSortColumn={doneOp} sortable dataKey="name">
        test
      </HeaderCell>
    );

    ReactTestUtils.Simulate.click(instance.querySelector('.rs-cell'));
  });

  it('Should call `onColumnResizeStart` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getDOMNode(
      <HeaderCell onColumnResizeStart={doneOp} resizable>
        test
      </HeaderCell>
    );

    ReactTestUtils.Simulate.mouseDown(instance.querySelector('.rs-column-resize-spanner'));
  });

  it('Should render custom sort icons', () => {
    const renderSortIcon = sortType => {
      if (sortType === 'asc') {
        return 1;
      } else if (sortType === 'desc') {
        return 2;
      }
      return 3;
    };

    const instance1 = getDOMNode(
      <HeaderCell sortable dataKey="name" renderSortIcon={renderSortIcon}>
        test
      </HeaderCell>
    );

    assert.equal(instance1.querySelector('.rs-cell-header-sort-wrapper').textContent, 3);

    const instance2 = getDOMNode(
      <HeaderCell sortable dataKey="name" renderSortIcon={renderSortIcon} sortType="asc">
        test
      </HeaderCell>
    );
    assert.equal(instance2.querySelector('.rs-cell-header-sort-wrapper').textContent, 3);

    const instance3 = getDOMNode(
      <HeaderCell
        sortable
        dataKey="name"
        renderSortIcon={renderSortIcon}
        sortType="asc"
        sortColumn="name"
      >
        test
      </HeaderCell>
    );
    assert.equal(instance3.querySelector('.rs-cell-header-sort-wrapper').textContent, 1);

    const instance4 = getDOMNode(
      <HeaderCell
        sortable
        dataKey="name"
        renderSortIcon={renderSortIcon}
        sortType="desc"
        sortColumn="name"
      >
        test
      </HeaderCell>
    );
    assert.equal(instance4.querySelector('.rs-cell-header-sort-wrapper').textContent, 2);
  });
});
