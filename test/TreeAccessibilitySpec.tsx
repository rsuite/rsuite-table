import React from 'react';
import sinon from 'sinon';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import TableProvider from '../src/TableProvider';

describe('Tree disclosure accessibility', () => {
  it('names the focusable disclosure from its data-bound cell and exposes expansion', () => {
    const { rerender } = render(
      <TableProvider isTree>
        <Cell firstColumn hasChildren dataKey="user.name" rowData={{ user: { name: 'North' } }} />
      </TableProvider>
    );
    const button = screen.getByRole('button', { name: 'North' });
    expect(button.getAttribute('tabindex')).to.equal('0');
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    rerender(
      <TableProvider isTree>
        <Cell firstColumn hasChildren expanded dataKey="count" rowData={{ count: 0 }} />
      </TableProvider>
    );
    expect(screen.getByRole('button', { name: '0' }).getAttribute('aria-expanded')).to.equal(
      'true'
    );
  });

  for (const key of ['Enter', ' ']) {
    it(`activates once from ${JSON.stringify(key)} without manufacturing a mouse event`, () => {
      const onTreeToggle = sinon.spy(),
        row = { name: 'North' };
      render(
        <TableProvider isTree>
          <Cell
            firstColumn
            hasChildren
            rowData={row}
            dataKey="name"
            rowKey="north"
            rowIndex={2}
            onTreeToggle={onTreeToggle}
          />
        </TableProvider>
      );
      const accepted = fireEvent.keyDown(screen.getByRole('button'), { key });
      expect(accepted).to.equal(false);
      expect(onTreeToggle).to.have.been.calledOnceWithExactly('north', 2, row);
    });
  }

  it('honors the cell caller key handler and cancellation', () => {
    const onTreeToggle = sinon.spy(),
      onKeyDown = sinon.spy((event: React.KeyboardEvent) => event.preventDefault());
    render(
      <TableProvider isTree>
        <Cell
          firstColumn
          hasChildren
          rowData={{ name: 'North' }}
          dataKey="name"
          onTreeToggle={onTreeToggle}
          onKeyDown={onKeyDown}
        />
      </TableProvider>
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onKeyDown).to.have.been.calledOnce;
    expect(onTreeToggle).not.to.have.been.called;
  });

  it('preserves descendant clicks without adding an extra descendant key activation', () => {
    const onTreeToggle = sinon.spy();
    render(
      <TableProvider isTree>
        <Cell
          firstColumn
          hasChildren
          rowData={{ name: 'North' }}
          dataKey="name"
          onTreeToggle={onTreeToggle}
          renderTreeToggle={() => <button>Custom action</button>}
        />
      </TableProvider>
    );
    const custom = screen.getByText('Custom action', { selector: 'button' });
    fireEvent.keyDown(custom, { key: 'Enter' });
    expect(onTreeToggle).not.to.have.been.called;
    fireEvent.click(custom);
    expect(onTreeToggle).to.have.been.calledOnce;
    expect(onTreeToggle.firstCall.args[3].type).to.equal('click');
  });

  it('leaves unrelated keys and modified shortcuts available to callers', () => {
    const onTreeToggle = sinon.spy(),
      onKeyDown = sinon.spy();
    render(
      <TableProvider isTree>
        <Cell
          firstColumn
          hasChildren
          rowData={{ name: 'North' }}
          dataKey="name"
          onTreeToggle={onTreeToggle}
          onKeyDown={onKeyDown}
        />
      </TableProvider>
    );
    const button = screen.getByRole('button');
    for (const event of [
      { key: 'ArrowRight' },
      { key: 'Enter', ctrlKey: true },
      { key: ' ', metaKey: true },
      { key: 'Enter', altKey: true }
    ])
      expect(fireEvent.keyDown(button, event)).to.equal(true);
    expect(onKeyDown).to.have.callCount(4);
    expect(onTreeToggle).not.to.have.been.called;
  });

  it('supports primitive content labels when no data binding is supplied', () => {
    render(
      <TableProvider isTree>
        <Cell firstColumn hasChildren rowData={{ id: 'north' }}>
          North
        </Cell>
      </TableProvider>
    );
    expect(screen.getByRole('button', { name: 'North' }).getAttribute('aria-expanded')).to.equal(
      'false'
    );
  });
});

describe('Tree row hierarchy semantics', () => {
  it('keeps levels and expansion synchronized through keyboard collapse and reopening', async () => {
    const data = [
      {
        id: 'north',
        name: 'North',
        children: [
          { id: 'projects', name: 'Projects', children: [{ id: 'budget', name: 'Budget' }] }
        ]
      }
    ];
    render(
      <Table
        isTree
        data={data}
        rowKey="id"
        defaultExpandedRowKeys={['north', 'projects']}
        height={400}
      >
        <Column width={300}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );
    const row = (name: string) => screen.getByText(name).closest('[role="row"]');
    expect(row('North').getAttribute('aria-level')).to.equal('1');
    expect(row('Projects').getAttribute('aria-level')).to.equal('2');
    expect(row('Budget').getAttribute('aria-level')).to.equal('3');
    expect(row('North').getAttribute('aria-expanded')).to.equal('true');
    expect(row('Budget').getAttribute('aria-expanded')).to.equal(null);
    fireEvent.keyDown(screen.getByRole('button', { name: 'North' }), { key: 'Enter' });
    await waitFor(() => expect(screen.queryByText('Budget')).to.equal(null));
    expect(row('North').getAttribute('aria-expanded')).to.equal('false');
    fireEvent.keyDown(screen.getByRole('button', { name: 'North' }), { key: ' ' });
    await waitFor(() => expect(row('Budget').getAttribute('aria-level')).to.equal('3'));
  });

  it('treats empty child arrays as leaves and keeps flat rows free of tree attributes', () => {
    const data = [{ id: 'empty', name: 'Empty', children: [] }];
    const view = render(
      <Table isTree data={data} rowKey="id">
        <Column width={200}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );
    expect(screen.queryAllByRole('button').length).to.equal(0);
    expect(
      screen.getByText('Empty').closest('[role="row"]').getAttribute('aria-expanded')
    ).to.equal(null);
    view.rerender(
      <Table data={data} rowKey="id">
        <Column width={200}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );
    const row = screen.getByText('Empty').closest('[role="row"]');
    expect(row.getAttribute('aria-level')).to.equal(null);
    expect(row.getAttribute('aria-expanded')).to.equal(null);
  });
});
