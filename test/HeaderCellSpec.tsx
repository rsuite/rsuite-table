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

describe('HeaderCell keyboard sorting', () => {
  it('makes only sortable leaf headers tabbable and honors an explicit tab index', () => {
    const { rerender } = render(
      <HeaderCell sortable dataKey="amount">
        Amount
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').getAttribute('tabindex')).to.equal('0');
    rerender(<HeaderCell>Amount</HeaderCell>);
    expect(screen.getByRole('columnheader').getAttribute('tabindex')).to.equal(null);
    rerender(
      <HeaderCell sortable groupHeader>
        Amount
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').getAttribute('tabindex')).to.equal(null);
    rerender(
      <HeaderCell sortable tabIndex={-1}>
        Amount
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').getAttribute('tabindex')).to.equal('-1');
  });

  for (const key of ['Enter', ' ']) {
    it(`sorts once and cancels the default action for ${JSON.stringify(key)}`, () => {
      const onSortColumn = sinon.spy();
      render(
        <HeaderCell sortable dataKey="amount" onSortColumn={onSortColumn}>
          Amount
        </HeaderCell>
      );
      const accepted = fireEvent.keyDown(screen.getByRole('columnheader'), { key });
      expect(onSortColumn).to.have.been.calledOnceWith('amount');
      expect(accepted).to.equal(false);
    });
  }

  it('preserves caller key handlers and their cancellation', () => {
    const onSortColumn = sinon.spy();
    const onKeyDown = sinon.spy((event: React.KeyboardEvent) => event.preventDefault());
    render(
      <HeaderCell sortable dataKey="amount" onSortColumn={onSortColumn} onKeyDown={onKeyDown}>
        Amount
      </HeaderCell>
    );
    fireEvent.keyDown(screen.getByRole('columnheader'), { key: 'Enter' });
    expect(onKeyDown).to.have.been.calledOnce;
    expect(onSortColumn).not.to.have.been.called;
  });

  it('does not add a sort from descendant key events and preserves descendant clicks', () => {
    const onSortColumn = sinon.spy();
    const onKeyDown = sinon.spy();
    render(
      <HeaderCell sortable dataKey="amount" onSortColumn={onSortColumn} onKeyDown={onKeyDown}>
        <button>Action</button>
      </HeaderCell>
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onKeyDown).to.have.been.calledOnce;
    expect(onSortColumn).not.to.have.been.called;
    fireEvent.click(screen.getByRole('button'));
    expect(onSortColumn).to.have.been.calledOnceWith('amount');
  });

  it('leaves other keys and modified shortcuts to callers', () => {
    const onSortColumn = sinon.spy();
    const onKeyDown = sinon.spy();
    render(
      <HeaderCell sortable dataKey="amount" onSortColumn={onSortColumn} onKeyDown={onKeyDown}>
        Amount
      </HeaderCell>
    );
    const header = screen.getByRole('columnheader');
    for (const event of [
      { key: 'ArrowRight' },
      { key: 'Enter', ctrlKey: true },
      { key: ' ', metaKey: true },
      { key: 'Enter', altKey: true }
    ]) {
      expect(fireEvent.keyDown(header, event)).to.equal(true);
    }
    expect(onKeyDown).to.have.callCount(4);
    expect(onSortColumn).not.to.have.been.called;
  });

  it('does not sort non-sortable or group headers from the keyboard', () => {
    const onSortColumn = sinon.spy();
    const { rerender } = render(<HeaderCell onSortColumn={onSortColumn}>Amount</HeaderCell>);
    fireEvent.keyDown(screen.getByRole('columnheader'), { key: 'Enter' });
    rerender(
      <HeaderCell sortable groupHeader onSortColumn={onSortColumn}>
        Amount
      </HeaderCell>
    );
    fireEvent.keyDown(screen.getByRole('columnheader'), { key: ' ' });
    expect(onSortColumn).not.to.have.been.called;
  });

  it('exposes sort state only on sortable leaf headers while preserving explicit ARIA', () => {
    const { rerender } = render(<HeaderCell dataKey="amount">Amount</HeaderCell>);
    expect(screen.getByRole('columnheader').getAttribute('aria-sort')).to.equal(null);
    rerender(
      <HeaderCell sortable dataKey="amount">
        Amount
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').getAttribute('aria-sort')).to.equal('none');
    rerender(
      <HeaderCell sortable dataKey="amount" sortColumn="amount" sortType="asc">
        Amount
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').getAttribute('aria-sort')).to.equal('ascending');
    rerender(
      <HeaderCell sortable dataKey="amount" sortColumn="amount" sortType="desc">
        Amount
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').getAttribute('aria-sort')).to.equal('descending');
    rerender(
      <HeaderCell sortable groupHeader dataKey="amount" sortColumn="amount">
        Amount
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').getAttribute('aria-sort')).to.equal(null);
    rerender(
      <HeaderCell sortable aria-sort="other">
        Amount
      </HeaderCell>
    );
    expect(screen.getByRole('columnheader').getAttribute('aria-sort')).to.equal('other');
  });
});
