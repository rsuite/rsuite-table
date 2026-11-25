import React from 'react';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react';
import Table from '../src/Table';
import type { TableInstance, TableProps } from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import { frames } from './utils/virtualizedFocus';

type Row = { id: number; details: string };

function fixture(shouldUpdateScroll: TableProps<Row>['shouldUpdateScroll'], virtualized = false) {
  const ref = React.createRef<TableInstance<Row, 'id'>>();
  const rows = new Map<string, Row[]>();
  const view = (width: number, detailsWidth: number, revision: string) => {
    if (!rows.has(revision)) {
      rows.set(
        revision,
        Array.from({ length: 20 }, (_, id) => ({ id, details: revision + id }))
      );
    }
    return (
      <Table
        ref={ref}
        width={width}
        height={200}
        virtualized={virtualized}
        rowKey="id"
        data={rows.get(revision)}
        shouldUpdateScroll={shouldUpdateScroll}
      >
        <Column width={200} fixed={virtualized}>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column width={detailsWidth}>
          <HeaderCell>Details</HeaderCell>
          <Cell dataKey="details" />
        </Column>
      </Table>
    );
  };

  const { rerender } = render(view(260, 400, 'before-'));
  const table = ref.current!;
  const controls = within(table.root);
  const relativeLeft = (element: Element) =>
    element.getBoundingClientRect().left - table.root.getBoundingClientRect().left;
  const bar = () => table.root.querySelector<HTMLElement>('[aria-orientation="horizontal"]');

  const expectPosition = async (left: number, width: number, content: number, value: string) => {
    await waitFor(() => {
      expect(table.root.getBoundingClientRect().width).to.be.closeTo(width, 1);
      expect(table.scrollPosition.left).to.equal(left);
      const header = controls.getByRole('columnheader', { name: 'Details' });
      const cell = controls.getByText(value).closest('[role=gridcell]')!;
      expect(relativeLeft(header)).to.be.closeTo(200 - left, 1);
      expect(relativeLeft(cell)).to.be.closeTo(relativeLeft(header), 1);

      const scrollbar = bar();
      if (content > width) {
        expect(scrollbar).to.exist;
        expect(scrollbar!.getBoundingClientRect().width).to.be.closeTo(width, 1);
        const thumb = scrollbar!.querySelector('[role=button]')!;
        const thumbLeft =
          thumb.getBoundingClientRect().left - scrollbar!.getBoundingClientRect().left;
        expect(thumbLeft).to.be.closeTo((left * width) / content, 1);
      } else {
        expect(scrollbar).to.equal(null);
      }
    });
  };

  return {
    table,
    expectPosition,
    update: (width: number, detailsWidth: number, revision: string) =>
      rerender(view(width, detailsWidth, revision))
  };
}

describe('Horizontal scroll after table size changes', () => {
  for (const virtualized of [false, true]) {
    it('preserves and clamps the offset with virtualized=' + virtualized, async () => {
      const table = fixture(false, virtualized);
      await frames();
      act(() => table.table.scrollLeft(120));
      await table.expectPosition(120, 260, 600, 'before-0');

      table.update(320, 400, 'next-');
      await table.expectPosition(120, 320, 600, 'next-0');

      fireEvent.keyDown(table.table.root, { key: 'ArrowRight' });
      await table.expectPosition(160, 320, 600, 'next-0');

      table.update(520, 400, 'next-');
      await table.expectPosition(80, 520, 600, 'next-0');

      table.update(320, 180, 'narrow-');
      await table.expectPosition(60, 320, 380, 'narrow-0');

      table.update(420, 180, 'fits-');
      await table.expectPosition(0, 420, 380, 'fits-0');
    });
  }

  const policies: {
    name: string;
    policy: TableProps<Row>['shouldUpdateScroll'];
    left: number;
  }[] = [
    { name: 'the default reset', policy: undefined, left: 0 },
    { name: 'an explicit horizontal position', policy: () => ({ x: 60 }), left: 60 },
    { name: 'a vertical-only position', policy: () => ({ y: 0 }), left: 120 }
  ];
  for (const { name, policy, left } of policies) {
    it('uses ' + name, async () => {
      const table = fixture(policy);
      await frames();
      act(() => table.table.scrollLeft(120));
      await table.expectPosition(120, 260, 600, 'before-0');

      table.update(320, 400, 'next-');
      await table.expectPosition(left, 320, 600, 'next-0');
    });
  }
});
