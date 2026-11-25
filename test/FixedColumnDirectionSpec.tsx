import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import Table, { TableInstance } from '../src/Table';
import Column from '../src/Column';
import HeaderCell from '../src/HeaderCell';
import Cell from '../src/Cell';
import '../src/less/index.less';

type Record = { id: number };

const data = [{ id: 1 }, { id: 2 }, { id: 3 }];

const columns = [
  <Column key="start" width={100} fixed>
    <HeaderCell>Start</HeaderCell>
    <Cell>{() => <button type="button">Start control</button>}</Cell>
  </Column>,
  <Column key="middle" width={370}>
    <HeaderCell>Middle</HeaderCell>
    <Cell>Scrollable cell</Cell>
  </Column>,
  <Column key="end" width={88} fixed="right">
    <HeaderCell>End</HeaderCell>
    <Cell>{() => <button type="button">End control</button>}</Cell>
  </Column>
];

function firstRowBounds() {
  const row = screen.getAllByRole('row')[1];
  const start = row.querySelector('[aria-colindex="1"]')!;
  const end = row.querySelector('[aria-colindex="3"]')!;
  const middle = row.querySelector('[aria-colindex="2"]')!;
  return {
    start: start.getBoundingClientRect(),
    end: end.getBoundingClientRect(),
    middle: middle.getBoundingClientRect(),
    grid: screen.getByRole('grid').getBoundingClientRect(),
    cells: [start, end]
  };
}

describe('Fixed columns in RTL', () => {
  for (const [label, direction] of [
    ['explicit RTL setting', { rtl: true }],
    ['local right-to-left direction', { dir: 'rtl' }]
  ] as const) {
    it(`keeps the fixed columns anchored with ${label}`, async () => {
      const table = React.createRef<TableInstance<Record, number>>();
      render(
        <Table {...direction} ref={table} width={340} height={230} data={data} rowKey="id">
          {columns}
        </Table>
      );

      const checkAnchors = () => {
        const { start, end, grid, cells } = firstRowBounds();
        expect(start.right).to.be.closeTo(grid.right, 1);
        expect(end.left).to.be.closeTo(grid.left, 1);
        expect(
          screen.getByRole('columnheader', { name: 'Start' }).getBoundingClientRect().right
        ).to.be.closeTo(start.right, 1);
        expect(
          screen.getByRole('columnheader', { name: 'End' }).getBoundingClientRect().left
        ).to.be.closeTo(end.left, 1);

        for (const cell of cells) {
          const button = cell.querySelector('button')!;
          const { left, top, width, height } = button.getBoundingClientRect();
          expect(document.elementFromPoint(left + width / 2, top + height / 2)).to.equal(button);
        }
      };

      await waitFor(checkAnchors);
      const initialPosition = firstRowBounds().middle.left;
      act(() => table.current?.scrollLeft(90));
      await waitFor(() => expect(firstRowBounds().middle.left).to.be.greaterThan(initialPosition));
      checkAnchors();
    });
  }

  it('starts without a horizontal offset when the RTL columns fit', async () => {
    const table = React.createRef<TableInstance<Record, number>>();
    render(
      <Table rtl ref={table} width={630} height={230} data={data} rowKey="id">
        {columns}
      </Table>
    );

    const { start, grid, end } = firstRowBounds();
    expect(table.current?.scrollPosition.left).to.equal(0);
    expect(start.right).to.be.closeTo(grid.right, 1);
    await act(async () => table.current?.scrollLeft(90));
    expect(table.current?.scrollPosition.left).to.equal(0);
    expect(firstRowBounds().end.left).to.be.closeTo(end.left, 1);
  });
});
