import React from 'react';
import { act, render, waitFor, within } from '@testing-library/react';
import Table from '../../src/Table';
import type { TableInstance, TableProps } from '../../src/Table';
import Column from '../../src/Column';
import Cell from '../../src/Cell';
import HeaderCell from '../../src/HeaderCell';
import '../../src/less/index.less';

export interface FocusRow {
  id: string | number;
}

export const data: FocusRow[] = Array.from({ length: 200 }, (_, id) => ({ id }));
export const frames = () =>
  new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

export function renderFocusTable(
  initial: Partial<TableProps<FocusRow, 'id'>> = {},
  container?: HTMLElement
) {
  const table = React.createRef<TableInstance<FocusRow, 'id'>>();
  let props = initial;
  let lastScroll = 0;
  const view = () => (
    <Table
      virtualized
      data={data}
      rowKey="id"
      height={240}
      width={240}
      headerHeight={40}
      rowHeight={40}
      {...props}
      ref={table}
      onScroll={(x, y) => {
        lastScroll = y;
        props.onScroll?.(x, y);
      }}
    >
      {props.children ?? (
        <Column width={200}>
          <HeaderCell>Select</HeaderCell>
          <Cell>{row => <input type="checkbox" aria-label={'Select ' + row.id} />}</Cell>
        </Column>
      )}
    </Table>
  );
  const result = render(view(), container ? { container, baseElement: container } : undefined);
  const root = () => table.current!.root;
  const checkbox = (id: string | number) =>
    within(root()).getByRole('checkbox', { name: ('Select ' + id).trim() });
  const focus = async (id: string | number) => {
    await frames();
    const input = checkbox(id);
    act(() => input.focus());
    expect(root().ownerDocument.activeElement).to.equal(input);
    return input;
  };
  const scroll = async (value: number, visibleId: string | number) => {
    act(() => table.current!.scrollTop(value));
    await waitFor(() => {
      expect(lastScroll).to.equal(value);
      const bounds = checkbox(visibleId).getBoundingClientRect();
      const viewport = root().getBoundingClientRect();
      expect(bounds.top).to.be.greaterThan(viewport.top + 40);
      expect(bounds.bottom).to.be.lessThan(viewport.bottom);
    });
    await frames();
    expect(lastScroll).to.equal(value);
    expect(root().querySelectorAll('input[type="checkbox"]').length).to.be.lessThan(30);
  };
  const update = (next: Partial<TableProps<FocusRow, 'id'>>) => {
    props = { ...props, ...next };
    result.rerender(view());
  };
  const measuredHeight = () =>
    Array.from(root().querySelectorAll('.rs-table-row')).reduce(
      (height, row) => height + row.getBoundingClientRect().height,
      0
    );
  return { ...result, root, checkbox, focus, scroll, update, measuredHeight };
}
