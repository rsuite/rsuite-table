import React from 'react';
import { render } from '@testing-library/react';
import Table from '../src/Table';
import Column from '../src/Column';
import HeaderCell from '../src/HeaderCell';
import Cell from '../src/Cell';
import '../src/less/index.less';

type Row = { id: number; span?: number };

const data = [0, 1, 2, 3, 4].map(id => ({ id }));

function visibleCells(container: HTMLElement) {
  return Array.from(container.querySelectorAll('.rs-table-body-row-wrapper [role="row"]'), row =>
    Array.from(row.querySelectorAll('[role="gridcell"]'), cell => cell.textContent)
  );
}

function groupedColumn(label: string, rowSpan: (row: Row) => number | undefined) {
  return (
    <Column<Row> width={100} rowSpan={rowSpan}>
      <HeaderCell>{label}</HeaderCell>
      <Cell dataKey="id">{row => label + row.id}</Cell>
    </Column>
  );
}

describe('Row span bookkeeping', () => {
  it('renders ordinary cells in a column that has no spans for this data', () => {
    const { container } = render(
      <Table data={data} width={400} height={300}>
        {groupedColumn('A', row => row.span)}
      </Table>
    );

    expect(visibleCells(container)).to.deep.equal([['A0'], ['A1'], ['A2'], ['A3'], ['A4']]);
  });

  it('keeps spans independent when columns read the same data key', () => {
    const { container } = render(
      <Table data={data} width={400} height={300}>
        {groupedColumn('A', row => (row.id === 0 ? 3 : undefined))}
        {groupedColumn('B', row => (row.id === 1 ? 2 : undefined))}
      </Table>
    );

    expect(visibleCells(container)).to.deep.equal([
      ['A0', 'B0'],
      ['B1'],
      [],
      ['A3', 'B3'],
      ['A4', 'B4']
    ]);
  });

  it('clears unfinished spans before rendering replacement data', () => {
    const renderRows = (rows: Row[]) => (
      <Table data={rows} rowKey="id" width={400} height={300}>
        {groupedColumn('A', row => row.span)}
      </Table>
    );
    const { container, rerender } = render(
      renderRows(data.map(row => (row.id === 3 ? { ...row, span: 12 } : row)))
    );

    rerender(renderRows(data.map(row => ({ id: row.id + 10 }))));

    expect(visibleCells(container)).to.deep.equal([['A10'], ['A11'], ['A12'], ['A13'], ['A14']]);
  });
});
