import React from 'react';
import sinon from 'sinon';
import { act, waitFor, within } from '@testing-library/react';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import Table from '../src/Table';
import { data, frames, renderFocusTable } from './utils/virtualizedFocus';

describe('Virtualized focus lifecycle', () => {
  it('Matches the owned outer row when the focused control is inside a nested table', async () => {
    const fixture = renderFocusTable({
      children: (
        <Column width={200}>
          <HeaderCell>Nested</HeaderCell>
          <Cell>
            {row =>
              row.id === 1 ? (
                <Table data={[{ id: 'nested' }]} height={40} width={180} showHeader={false}>
                  <Column width={180}>
                    <HeaderCell>Select</HeaderCell>
                    <Cell>
                      <input type="checkbox" aria-label="Select 1" />
                    </Cell>
                  </Column>
                </Table>
              ) : (
                <input type="checkbox" aria-label={'Select ' + row.id} />
              )
            }
          </Cell>
        </Column>
      )
    });
    const input = await fixture.focus(1);
    await fixture.scroll(1600, 41);
    expect(fixture.root().ownerDocument.activeElement).to.equal(input);
    expect(input.isConnected).to.equal(true);
  });

  it('Does not let the retained row hide cells in the visible merged-column range', async () => {
    const fixture = renderFocusTable({
      children: (
        <>
          <Column width={80}>
            <HeaderCell>Select</HeaderCell>
            <Cell>{row => <input type="checkbox" aria-label={'Select ' + row.id} />}</Cell>
          </Column>
          <Column width={120} rowSpan={row => (row.id === 1 ? 2 : 0)}>
            <HeaderCell>Group</HeaderCell>
            <Cell>{row => <span>Group {row.id}</span>}</Cell>
          </Column>
        </>
      )
    });
    const input = await fixture.focus(1);
    await fixture.scroll(1600, 41);
    expect(fixture.root().ownerDocument.activeElement).to.equal(input);
    expect(within(fixture.root()).getByText('Group 40').isConnected).to.equal(true);
    expect(within(fixture.root()).getByText('Group 41').isConnected).to.equal(true);
  });
  for (const variable of [false, true]) {
    it(`Preserves measured height and releases an offscreen row after blur: ${
      variable ? 'variable' : 'fixed'
    }`, async () => {
      const onBlurCapture = sinon.spy();
      const fixture = renderFocusTable({
        onBlurCapture,
        rowHeight: variable ? row => (Number(row?.id) % 2 ? 40 : 60) : 40
      });
      const input = await fixture.focus(1);
      const height = fixture.measuredHeight();
      await fixture.scroll(1600, variable ? 33 : 41);
      expect(fixture.root().ownerDocument.activeElement).to.equal(input);
      expect(fixture.measuredHeight()).to.equal(height);

      act(() => fixture.checkbox(variable ? 33 : 41).focus());
      await waitFor(() => expect(input.isConnected).to.equal(false));
      expect(onBlurCapture).to.have.been.calledOnce;
      expect(fixture.measuredHeight()).to.equal(height);
    });
  }

  it('Retains a row below the viewport without changing scroll extent', async () => {
    const fixture = renderFocusTable();
    await frames();
    const height = fixture.measuredHeight();
    await fixture.scroll(1600, 41);
    const input = await fixture.focus(41);
    await fixture.scroll(0, 1);
    expect(fixture.root().ownerDocument.activeElement).to.equal(input);
    expect(fixture.measuredHeight()).to.equal(height);
  });

  for (const key of [0, '']) {
    it(`Preserves the DOM input across stable-key reordering, including key ${JSON.stringify(
      key
    )}`, async () => {
      const rows = [{ id: 'first' }, { id: key }, ...data.slice(2)];
      const fixture = renderFocusTable({ data: rows, shouldUpdateScroll: false });
      const input = await fixture.focus(key);
      await fixture.scroll(1600, 41);
      fixture.update({ data: [...rows.slice(0, 1), ...rows.slice(2), rows[1]] });
      await waitFor(() => {
        expect(fixture.checkbox(key)).to.equal(input);
        expect(input.closest('[role="row"]')!.getAttribute('aria-rowindex')).to.equal('201');
        expect(fixture.root().ownerDocument.activeElement).to.equal(input);
      });
      expect(fixture.root().querySelectorAll('input').length).to.be.lessThan(30);
    });
  }

  it('Drops a retained row when its keyed data is removed', async () => {
    const fixture = renderFocusTable({ shouldUpdateScroll: false });
    const input = await fixture.focus(1);
    await fixture.scroll(1600, 41);
    fixture.update({ data: data.filter(row => row.id !== 1) });
    await waitFor(() => expect(input.isConnected).to.equal(false));
    expect(within(fixture.root()).queryByRole('checkbox', { name: 'Select 1' })).to.equal(null);
    expect(fixture.root().ownerDocument.activeElement).not.to.equal(input);
  });

  it('Uses the existing index identity when no row key is configured', async () => {
    const fixture = renderFocusTable({ rowKey: undefined });
    const input = await fixture.focus(1);
    await fixture.scroll(1600, 41);
    expect(fixture.root().ownerDocument.activeElement).to.equal(input);
    expect(input.isConnected).to.equal(true);
  });

  it('Keeps focus moving within a retained row, then removes it on external blur', async () => {
    const onBlurCapture = sinon.spy();
    const fixture = renderFocusTable({
      onBlurCapture,
      children: (
        <Column width={200}>
          <HeaderCell>Select</HeaderCell>
          <Cell>
            {row => (
              <>
                <input type="checkbox" aria-label={'Select ' + row.id} />
                <button>Details {row.id}</button>
              </>
            )}
          </Cell>
        </Column>
      )
    });
    const input = await fixture.focus(1);
    await fixture.scroll(1600, 41);
    const details = within(input.closest('[role="row"]')!).getByRole('button', {
      name: 'Details 1'
    });
    act(() => details.focus());
    await frames();
    expect(details.isConnected).to.equal(true);
    expect(fixture.root().ownerDocument.activeElement).to.equal(details);
    expect(onBlurCapture).to.have.been.calledOnce;
    act(() => fixture.root().focus());
    await waitFor(() => expect(details.isConnected).to.equal(false));
    expect(onBlurCapture).to.have.been.calledTwice;
  });

  it('Retains focus in fixed-column cells without widening the rendered range', async () => {
    const fixture = renderFocusTable({
      children: (
        <>
          <Column width={80} fixed>
            <HeaderCell>Select</HeaderCell>
            <Cell>{row => <input type="checkbox" aria-label={'Select ' + row.id} />}</Cell>
          </Column>
          <Column width={400}>
            <HeaderCell>ID</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </>
      )
    });
    const input = await fixture.focus(1);
    await fixture.scroll(1600, 41);
    expect(fixture.root().ownerDocument.activeElement).to.equal(input);
    expect(input.closest('.rs-table-cell-group-fixed-left')).not.to.equal(null);
  });

  it('Reads the active element from the table owner document', async () => {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'width:500px;height:360px';
    const loaded = new Promise<void>(resolve =>
      frame.addEventListener('load', () => resolve(), { once: true })
    );
    document.body.append(frame);
    await loaded;
    const owner = frame.contentDocument!;
    document.querySelectorAll('style').forEach(style => owner.head.append(style.cloneNode(true)));
    const container = owner.createElement('div');
    owner.body.append(container);
    const fixture = renderFocusTable({}, container);
    try {
      frame.contentWindow!.focus();
      const input = await fixture.focus(1);
      expect(document.activeElement).to.equal(frame);
      await fixture.scroll(1600, 41);
      expect(owner.activeElement).to.equal(input);
      expect(input.isConnected).to.equal(true);
    } finally {
      fixture.unmount();
      frame.remove();
    }
  });
});
