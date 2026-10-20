import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import Table from '../src/Table';
import type { TableInstance } from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import '../src/less/index.less';

interface FocusRow {
  id: number;
}

const data: FocusRow[] = Array.from({ length: 200 }, (_, id) => ({ id }));
const variableHeight = (row?: FocusRow) => (row ? (row.id % 2 ? 40 : 60) : 40);

describe('Virtualized focus', () => {
  for (const variable of [false, true]) {
    for (const virtualized of [false, true]) {
      it(`Retains the focused input after scrolling away: ${
        variable ? 'variable' : 'fixed'
      } rows, ${virtualized ? 'virtual' : 'nonvirtual control'}`, async () => {
        const table = React.createRef<TableInstance<FocusRow, 'id'>>();
        let scrollY = 0;
        render(
          <Table
            ref={table}
            virtualized={virtualized}
            data={data}
            rowKey="id"
            height={240}
            width={240}
            headerHeight={40}
            rowHeight={variable ? variableHeight : 40}
            onScroll={(_, y) => (scrollY = y)}
          >
            <Column width={200}>
              <HeaderCell>Select</HeaderCell>
              <Cell>{row => <input type="checkbox" aria-label={'Select ' + row.id} />}</Cell>
            </Column>
          </Table>
        );
        await new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
        const input = screen.getByRole('checkbox', { name: 'Select 1' });
        const ownerDocument = table.current!.root.ownerDocument;
        expect(getComputedStyle(table.current!.root).position).to.equal('relative');
        expect(getComputedStyle(input.closest('[role="row"]')!).position).to.equal('absolute');
        act(() => input.focus());
        expect(ownerDocument.activeElement).to.equal(input);

        act(() => table.current!.scrollTop(1600));
        await waitFor(() => expect(scrollY).to.equal(1600));
        await waitFor(() => {
          const visibleInput = screen.getByRole('checkbox', {
            name: 'Select ' + (variable ? 33 : 41)
          });
          const bounds = visibleInput.getBoundingClientRect();
          const viewport = table.current!.root.getBoundingClientRect();
          expect(bounds.top).to.be.greaterThan(viewport.top + 40);
          expect(bounds.bottom).to.be.lessThan(viewport.bottom);
        });

        expect(ownerDocument.activeElement).to.equal(input);
        expect(ownerDocument.documentElement.contains(input)).to.equal(true);
        if (virtualized) {
          expect(
            table.current!.root.querySelectorAll('input[type="checkbox"]').length
          ).to.be.lessThan(30);
        }
      });
    }
  }
});
