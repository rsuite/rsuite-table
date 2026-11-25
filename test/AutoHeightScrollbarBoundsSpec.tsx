import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import '../src/less/index.less';

const data = [{ id: 1 }];

describe('Horizontal scrollbar height', () => {
  const cases = [
    {
      name: 'adds space for auto height below the limit',
      autoHeight: true,
      maxHeight: 150,
      expected: '96px'
    },
    {
      name: 'respects maxHeight after adding the scrollbar',
      autoHeight: true,
      maxHeight: 90,
      expected: '90px'
    },
    {
      name: 'preserves an explicit table height',
      autoHeight: false,
      maxHeight: 300,
      expected: '200px'
    }
  ];

  for (const { name, autoHeight, maxHeight, expected } of cases) {
    it(name, async () => {
      const { container } = render(
        <Table
          aria-label="Ledger"
          autoHeight={autoHeight}
          data={data}
          width={200}
          height={200}
          maxHeight={maxHeight}
          rowHeight={46}
          headerHeight={40}
          rowKey="id"
        >
          <Column width={400}>
            <HeaderCell>Record</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </Table>
      );
      const table = within(container).getByRole('grid', { name: 'Ledger' });
      await waitFor(() => {
        expect(table.querySelector('.rs-table-scrollbar-horizontal')).to.exist;
        expect(table.style.height).to.equal(expected);
      });
    });
  }
});
