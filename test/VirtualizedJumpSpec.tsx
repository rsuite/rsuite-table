import React from 'react';
import { act, render, within } from '@testing-library/react';
import Table from '../src/Table';
import type { TableInstance } from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import { data, frames } from './utils/virtualizedFocus';
import type { FocusRow } from './utils/virtualizedFocus';

describe('Imperative virtual jump position', () => {
  for (const variableHeight of [false, true]) {
    it(
      'positions the committed target row with ' +
        (variableHeight ? 'variable' : 'fixed') +
        ' heights',
      async () => {
        const table = React.createRef<TableInstance<FocusRow, 'id'>>();
        render(
          <Table
            ref={table}
            virtualized
            data={data}
            rowKey="id"
            width={240}
            height={240}
            headerHeight={40}
            rowHeight={variableHeight ? row => (row && Number(row.id) % 2 === 0 ? 60 : 40) : 40}
          >
            <Column width={120} fixed={!variableHeight}>
              <HeaderCell>Name</HeaderCell>
              <Cell>{row => <button type="button">Record {row.id}</button>}</Cell>
            </Column>
            <Column width={360}>
              <HeaderCell>Details</HeaderCell>
              <Cell>{row => <span data-testid={'details-' + row.id}>Details</span>}</Cell>
            </Column>
          </Table>
        );
        await frames();

        const instance = table.current!;
        const controls = within(instance.root);
        const id = variableHeight ? 33 : 41;
        const initialDetailsCell = controls.getByTestId('details-0').closest('[role=gridcell]')!;
        const initialLeft = initialDetailsCell.getBoundingClientRect().left;
        const target = 'Record ' + id;
        expect(controls.queryByRole('button', { name: target })).to.equal(null);

        // Read the committed row while deferred browser tasks have not run yet.
        act(() => {
          instance.scrollTop(800);
          instance.scrollLeft(24);
          instance.scrollTop(1600);
        });

        expect(instance.scrollPosition).to.deep.equal({ top: 1600, left: 24 });
        const button = controls.getByRole('button', { name: target });
        const viewport = instance.root.getBoundingClientRect();
        const bounds = button.getBoundingClientRect();
        expect(bounds.top).to.be.greaterThan(viewport.top + 40);
        expect(bounds.bottom).to.be.lessThan(viewport.bottom);
        const detailsCell = controls.getByTestId('details-' + id).closest('[role=gridcell]')!;
        expect(detailsCell.getBoundingClientRect().left).to.be.closeTo(initialLeft - 24, 1);
        expect(getComputedStyle(button).pointerEvents).to.equal('auto');
      }
    );
  }
});
