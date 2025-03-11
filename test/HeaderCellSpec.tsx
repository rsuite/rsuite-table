import React from 'react';
import HeaderCell from '../src/HeaderCell';
import { render, screen, fireEvent } from '@testing-library/react';

describe('HeaderCell', () => {
  it('Should output a header', () => {
    render(<HeaderCell>test</HeaderCell>);
    expect(screen.getByRole('columnheader').parentNode).to.have.class('rs-cell-header');
  });

  it('Should output default sort icon', () => {
    render(
      <HeaderCell sortable dataKey="name">
        test
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').querySelector('.rs-cell-header-icon-sort')).to.be.not
      .null;
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

    render(
      <HeaderCell width={100} onSortColumn={doneOp} sortable dataKey="name">
        test
      </HeaderCell>
    );

    fireEvent.click(screen.getByRole('columnheader'));
  });

  it('Should call `onColumnResizeStart` callback', done => {
    const doneOp = () => {
      done();
    };

    const { container } = render(
      <HeaderCell onColumnResizeStart={doneOp} resizable>
        test
      </HeaderCell>
    );

    fireEvent.mouseDown(container.querySelector('.rs-column-resize-spanner') as Element);
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

    const { container, rerender } = render(
      <HeaderCell sortable dataKey="name" renderSortIcon={renderSortIcon}>
        test
      </HeaderCell>
    );

    expect(container.querySelector('.rs-cell-header-sort-wrapper')).to.have.text('3');

    rerender(
      <HeaderCell sortable dataKey="name" renderSortIcon={renderSortIcon} sortType="asc">
        test
      </HeaderCell>
    );
    expect(container.querySelector('.rs-cell-header-sort-wrapper')).to.have.text('3');

    rerender(
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
    expect(container.querySelector('.rs-cell-header-sort-wrapper')).to.have.text('1');

    rerender(
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

    expect(container.querySelector('.rs-cell-header-sort-wrapper')).to.have.text('2');
  });
});
