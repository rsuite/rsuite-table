import React, { useEffect, useState, useMemo } from 'react';
import { render, act } from '@testing-library/react';
import useCellDescriptor from '../src/utils/useCellDescriptor';
import Column from '../src/Column';
import HeaderCell from '../src/HeaderCell';
import Cell from '../src/Cell';

describe('useCellDescriptor', () => {
  let cellDescriptor;
  let setWidthOfFirstColumn;

  // test component that wraps useCellDescriptor and stores ref to
  // output vars in the `cellDescriptor` var declared above
  const TestComponent = () => {
    const [width, setWidth] = useState(100);
    setWidthOfFirstColumn = setWidth;

    const columns = useMemo(
      () => [
        <Column width={width} key="col1" resizable>
          <HeaderCell></HeaderCell>
          <Cell dataKey="key1"></Cell>
        </Column>,
        <Column width={200} key="col2">
          <HeaderCell></HeaderCell>
          <Cell dataKey="key2"></Cell>
        </Column>
      ],
      [width]
    );

    const descriptor = useCellDescriptor({
      children: columns,
      showHeader: true,
      headerHeight: 100,
      tableRef: {},
      tableWidth: {},
      scrollX: {},
      minScrollX: {},
      mouseAreaRef: {}
    });

    useEffect(() => {
      cellDescriptor = descriptor;
    }, [descriptor]);

    return null;
  };

  it('Should output expected vars', () => {
    render(<TestComponent />);

    assert.containsAllKeys(cellDescriptor, [
      'columns',
      'headerCells',
      'bodyCells',
      'allColumnsWidth',
      'hasCustomTreeCol'
    ]);
  });

  it('Should set widths on cells', () => {
    render(<TestComponent />);

    const { headerCells, bodyCells } = cellDescriptor;

    assert.equal(headerCells[0].props.width, 100);
    assert.equal(bodyCells[0].props.width, 100);
    assert.equal(headerCells[1].props.width, 200);
    assert.equal(headerCells[1].props.width, 200);
  });

  it('Should update cell width on column resize', () => {
    render(<TestComponent />);

    const { headerCells } = cellDescriptor;
    const { onColumnResizeEnd } = headerCells[0].props;

    // (columnWidth: number, _cursorDelta: number, dataKey: any, index: number)
    act(() => onColumnResizeEnd(500, 5, 'key1', 0));

    assert.equal(cellDescriptor.bodyCells[0].props.width, 500);
  });

  it('Should set proper cell width on column resize followed by column width change', () => {
    render(<TestComponent />);

    const { headerCells } = cellDescriptor;
    const { onColumnResizeEnd } = headerCells[0].props;

    // (columnWidth: number, _cursorDelta: number, dataKey: any, index: number)
    act(() => onColumnResizeEnd(500, 5, 'key1', 0));
    assert.equal(cellDescriptor.bodyCells[0].props.width, 500);

    act(() => setWidthOfFirstColumn(420));
    assert.equal(cellDescriptor.bodyCells[0].props.width, 420);
  });
});
