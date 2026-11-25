import React, { useImperativeHandle, useState, useRef, forwardRef } from 'react';
import sinon from 'sinon';
import getHeight from 'dom-lib/getHeight';
import getWidth from 'dom-lib/getWidth';
import Table from '../src/Table';
import Column from '../src/Column';
import ColumnGroup from '../src/ColumnGroup';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import { render, waitFor, fireEvent, screen, act } from '@testing-library/react';
import type { TableInstance } from '../src/Table';
import '../src/less/index.less';
import observeWheel from './utils/observeWheel';

describe('Table', () => {
  it('Should output a table', () => {
    render(<Table>test</Table>);
    expect(screen.getByRole('grid')).to.have.class('rs-table');
  });

  describe('Row highlight', () => {
    const data = [
      { id: 0, name: 'First row' },
      { id: 'second', name: 'Second row' }
    ];

    const columns = (
      <Column>
        <HeaderCell>Name</HeaderCell>
        <Cell dataKey="name" />
      </Column>
    );

    it('leaves existing row appearance and selection semantics untouched by default', () => {
      render(
        <Table data={data} rowKey="id" rowClassName="custom-row">
          {columns}
        </Table>
      );
      const row = screen.getByRole('row', { name: 'First row' });
      fireEvent.click(row);
      expect(row).to.have.class('custom-row');
      expect(row).not.to.have.class('rs-table-row-highlighted');
      expect(row).not.to.have.attr('aria-selected');
    });

    it('toggles a highlighted row without replacing its custom class', () => {
      const onRowClick = sinon.spy();
      const onHighlightedRowChange = sinon.spy();
      render(
        <Table
          data={data}
          rowKey="id"
          rowClassName={row => (row ? `custom-${row.id}` : '')}
          enabledRowHighlight
          onRowClick={onRowClick}
          onHighlightedRowChange={onHighlightedRowChange}
        >
          {columns}
        </Table>
      );

      const first = screen.getByRole('row', { name: 'First row' });
      const second = screen.getByRole('row', { name: 'Second row' });
      fireEvent.click(first);
      expect(first).to.have.class('custom-0');
      expect(first.classList.contains('rs-table-row-highlighted')).to.equal(true);
      expect(first).to.have.attr('aria-selected', 'true');
      expect(second).to.have.attr('aria-selected', 'false');
      expect(onHighlightedRowChange.firstCall.args.slice(0, 2)).to.deep.equal([0, data[0]]);
      expect(onRowClick.firstCall.args[0]).to.equal(data[0]);

      fireEvent.click(second);
      expect(first).to.have.attr('aria-selected', 'false');
      expect(second).to.have.attr('aria-selected', 'true');
      fireEvent.click(second);
      expect(second).to.have.attr('aria-selected', 'false');
      expect(onHighlightedRowChange.lastCall.args.slice(0, 2)).to.deep.equal([null, data[1]]);
      expect(onRowClick.callCount).to.equal(3);
    });

    it('keeps controlled highlighting attached to the row key after reorder', () => {
      const onHighlightedRowChange = sinon.spy();
      const table = (rows, key, showHeader = true) => (
        <Table
          data={rows}
          rowKey="id"
          enabledRowHighlight
          highlightedRowKey={key}
          showHeader={showHeader}
          virtualized
          height={145}
          onHighlightedRowChange={onHighlightedRowChange}
        >
          {columns}
        </Table>
      );
      const { rerender } = render(table(data, 0));
      fireEvent.click(screen.getByRole('row', { name: 'Second row' }));
      expect(onHighlightedRowChange.callCount).to.equal(1);
      expect(onHighlightedRowChange.firstCall.args[0]).to.equal('second');
      expect(screen.getByRole('row', { name: 'First row' })).to.have.attr('aria-selected', 'true');

      rerender(table([data[1], data[0]], 0));
      expect(screen.getByRole('row', { name: 'First row' })).to.have.attr('aria-selected', 'true');
      expect(screen.getByRole('row', { name: 'Second row' })).to.have.attr(
        'aria-selected',
        'false'
      );

      rerender(table([data[1], data[0]], 0, false));
      const selected = screen.getByRole('row', { name: 'First row' });
      expect(screen.getByRole('grid')).to.have.attr('aria-rowcount', '2');
      expect(screen.getByRole('row', { name: 'Second row' })).to.have.attr('aria-rowindex', '1');
      expect(selected).to.have.attr('aria-rowindex', '2');
      expect(selected).to.have.attr('aria-selected', 'true');

      rerender(table([data[1], data[0]], null, false));
      expect(screen.getByRole('row', { name: 'First row' })).to.have.attr('aria-selected', 'false');
    });

    it('keeps the selected row and color scoped to its own table', () => {
      const onOuterHighlight = sinon.spy();
      const onInnerHighlight = sinon.spy();
      render(
        <Table
          aria-label="Outer results"
          data={[data[0]]}
          rowKey="id"
          showHeader={false}
          enabledRowHighlight
          onHighlightedRowChange={onOuterHighlight}
          width={300}
          height={150}
          rowHeight={120}
        >
          <Column width={280}>
            <HeaderCell>Nested</HeaderCell>
            <Cell>
              {() => (
                <Table
                  aria-label="Inner results"
                  data={[data[1]]}
                  rowKey="id"
                  showHeader={false}
                  enabledRowHighlight
                  onHighlightedRowChange={onInnerHighlight}
                  width={240}
                  height={80}
                >
                  {columns}
                </Table>
              )}
            </Cell>
          </Column>
        </Table>
      );

      const outer = screen.getByRole('grid', { name: 'Outer results' });
      const inner = screen.getByRole('grid', { name: 'Inner results' });
      const outerRow = outer.querySelector<HTMLElement>('[role="row"]')!;
      const innerRow = inner.querySelector<HTMLElement>('[role="row"]')!;
      const outerCell = outerRow.querySelector<HTMLElement>('[role="gridcell"]')!;
      const innerCell = innerRow.querySelector<HTMLElement>('[role="gridcell"]')!;
      const originalInnerColor = getComputedStyle(innerCell).backgroundColor;

      fireEvent.click(innerCell);
      expect(innerRow).to.have.attr('aria-selected', 'true');
      expect(outerRow).to.have.attr('aria-selected', 'false');
      expect(onInnerHighlight).to.have.been.calledOnce;
      expect(onOuterHighlight).not.to.have.been.called;

      fireEvent.click(innerCell);
      fireEvent.click(outerCell);
      expect(outerRow).to.have.attr('aria-selected', 'true');
      expect(innerRow).to.have.attr('aria-selected', 'false');
      expect(getComputedStyle(outerCell).backgroundColor).not.to.equal(originalInnerColor);
      expect(getComputedStyle(innerCell).backgroundColor).to.equal(originalInnerColor);
    });

    it('highlights with Shift+Space from a cell while leaving nested controls operable', () => {
      const onHighlightedRowChange = sinon.spy();
      const onAction = sinon.spy();
      render(
        <Table
          data={data.slice(0, 1)}
          rowKey="id"
          enabledRowHighlight
          onHighlightedRowChange={onHighlightedRowChange}
        >
          <Column>
            <HeaderCell>Name</HeaderCell>
            <Cell>
              {row => (
                <>
                  <span tabIndex={0}>{row.name}</span>
                  <button type="button" onClick={onAction}>
                    Edit
                  </button>
                </>
              )}
            </Cell>
          </Column>
        </Table>
      );

      const row = screen.getAllByRole('row')[1];
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(onAction.callCount).to.equal(1);
      expect(onHighlightedRowChange.callCount).to.equal(0);
      const focusTarget = screen.getByText('First row');
      focusTarget.focus();
      fireEvent.keyDown(focusTarget, { key: ' ', shiftKey: true });
      expect(row.getAttribute('aria-selected')).to.equal('true');
      expect(focusTarget).to.have.focus;
      expect(onHighlightedRowChange.firstCall.args[0]).to.equal(0);
    });
  });

  it('Should render 2 columns', () => {
    render(
      <Table>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.queryAllByRole('columnheader')).to.have.length(2);
  });

  it('Should accept render prop', () => {
    render(
      <Table>
        {({ Column, HeaderCell, Cell, ColumnGroup }) => (
          <>
            <Column>
              <HeaderCell>11</HeaderCell>
              <Cell>12</Cell>
            </Column>
            <Column>
              <HeaderCell>11</HeaderCell>
              <Cell>12</Cell>
            </Column>
            <ColumnGroup>
              <Column>
                <HeaderCell>11</HeaderCell>
                <Cell>12</Cell>
              </Column>
              <Column>
                <HeaderCell>11</HeaderCell>
                <Cell>12</Cell>
              </Column>
            </ColumnGroup>
          </>
        )}
      </Table>
    );
    expect(screen.queryAllByRole('columnheader')).to.be.length(5);
  });

  it('Should be disabled scroll', () => {
    render(
      <Table disabledScroll>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.getByRole('grid').querySelectorAll('.rs-table-scrollbar-handle')).to.be.length(0);
  });

  it('Should be loading', () => {
    render(
      <Table loading>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.getByRole('grid')).to.have.class('rs-table-loading');
    expect(screen.getByRole('grid').querySelectorAll('.rs-table-loader')).to.be.length(1);
    expect(screen.getByRole('grid').getAttribute('aria-busy')).to.equal('true');
  });

  it('Should render custom loader', () => {
    render(
      <Table
        loading
        renderLoading={() => {
          return <p className="my-loading">loading</p>;
        }}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.getByRole('grid').querySelector('.my-loading')).to.text('loading');
  });

  it('Should not render custom loader', () => {
    render(
      <Table
        loading={false}
        renderLoading={() => {
          return <p className="my-loading">loading</p>;
        }}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.getByRole('grid').querySelector('.my-loading')).to.not.exist;
  });

  it('Should render custom empty info', () => {
    render(
      <Table
        data={[]}
        renderEmpty={() => {
          return <p className="my-info">empty</p>;
        }}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.getByRole('grid').querySelector('.my-info')).to.text('empty');
  });

  it('Should be bordered', () => {
    render(
      <Table bordered>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.getByRole('grid')).to.have.class('rs-table-bordered');
  });

  it('Should be bordered for cell', () => {
    render(
      <Table cellBordered>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.getByRole('grid')).to.have.class('rs-table-cell-bordered');
  });

  it('Should render loader dom element when set `loadAnimation`', () => {
    render(
      <Table loadAnimation>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.getByRole('grid').querySelectorAll('.rs-table-loader')).to.be.exist;
  });

  it('Should be wordWrap', async () => {
    const data = [{ id: 1, country: 'South Georgia and the South Sandwich Islands' }];
    const ref = React.createRef<TableInstance<any, string>>();

    render(
      <Table ref={ref} wordWrap data={data}>
        <Column width={20}>
          <HeaderCell>Country</HeaderCell>
          <Cell dataKey="country" />
        </Column>
      </Table>
    );

    const table = ref.current?.root;
    const cell = table?.querySelectorAll('.rs-table-cell')[1] as HTMLElement;
    const cellContent = table?.querySelectorAll('.rs-table-cell-content')[1] as HTMLElement;

    expect(cellContent?.style.wordBreak).to.equal('break-all');
    expect(ref.current?.root).to.have.class('rs-table-word-wrap');
    expect(cell?.textContent).to.equal('South Georgia and the South Sandwich Islands');

    await waitFor(() => {
      expect(getHeight(cell)).to.be.greaterThan(46);
    });
  });

  it('Should be wordWrap=break-all', () => {
    const ref = React.createRef<any>();
    render(
      <Table
        wordWrap="break-all"
        data={[{ id: 1, country: 'South Georgia and the South Sandwich Islands' }]}
      >
        <Column width={20}>
          <HeaderCell>Country</HeaderCell>
          <Cell dataKey="country" ref={ref} />
        </Column>
      </Table>
    );

    const cellContent = ref.current?.querySelector('.rs-table-cell-content');

    expect(cellContent.style.wordBreak).to.equal('break-all');
  });

  it('Should be wordWrap=break-word', () => {
    const ref = React.createRef<any>();
    render(
      <Table
        wordWrap="break-word"
        data={[{ id: 1, country: 'South Georgia and the South Sandwich Islands' }]}
      >
        <Column width={20}>
          <HeaderCell>Country</HeaderCell>
          <Cell dataKey="country" ref={ref} />
        </Column>
      </Table>
    );

    const cellContent = ref.current.querySelector('.rs-table-cell-content');

    expect(cellContent.style.wordBreak).to.equal('break-word');
  });

  it('Should be wordWrap=keep-all', () => {
    const ref = React.createRef<any>();
    render(
      <Table
        wordWrap="keep-all"
        data={[{ id: 1, country: 'South Georgia and the South Sandwich Islands' }]}
      >
        <Column width={20}>
          <HeaderCell>Country</HeaderCell>
          <Cell dataKey="country" ref={ref} />
        </Column>
      </Table>
    );

    const cellContent = ref.current.querySelector('.rs-table-cell-content');

    expect(cellContent.style.wordBreak).to.equal('keep-all');
  });

  // https://github.com/rsuite/rsuite-table/issues/300
  it('Should be a full horizontal scrolling range', () => {
    render(
      <Table
        autoHeight
        style={{ width: 200 }}
        data={[
          {
            id: 1,
            name: 'a'
          },
          {
            id: 2,
            name: 'b'
          }
        ]}
      >
        <Column width={50} fixed>
          <HeaderCell>id</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column width={100}>
          <HeaderCell>name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={100}>
          <HeaderCell>name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={100}>
          <HeaderCell>name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={50} fixed="right">
          <HeaderCell>name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    const tableWidth = 200;
    const contextWidth = 400;
    const width = Math.floor((tableWidth / contextWidth) * tableWidth);

    const scrollbarHandleWidth = Math.floor(
      getWidth(screen.getByRole('grid').querySelector('.rs-table-scrollbar-handle') as HTMLElement)
    );

    expect(width).to.equal(scrollbarHandleWidth);
  });

  it('Should call `rowHeight` callback', done => {
    const doneOp = () => {
      done();
      return 20;
    };
    render(
      <Table
        rowHeight={doneOp}
        data={[
          {
            id: 1,
            name: 'a'
          }
        ]}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
  });

  it('Should call `onWheel` callback', () => {
    const onWheel = sinon.spy();
    render(
      <Table onWheel={onWheel} data={[{ id: 1, name: 'a' }]} height={10}>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );

    fireEvent.wheel(
      screen.getByRole('grid').querySelector('.rs-table-body-row-wrapper') as HTMLElement
    );

    expect(onWheel).to.have.been.calledOnce;
  });

  it('Should get the body DOM', () => {
    const data = [{ id: 1, name: 'a' }];
    const ref = React.createRef<any>();

    render(
      <Table data={data} ref={ref}>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );

    expect(ref.current?.body?.style?.height).to.be.equal('46px');
  });

  it('Should not be displayed header', () => {
    render(
      <Table showHeader={false}>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(screen.queryAllByRole('columnheader')).to.have.length(0);
  });

  for (const showHeader of [false, true]) {
    it(`Counts and indexes the data rows with the header ${
      showHeader ? 'shown' : 'hidden'
    }`, () => {
      render(
        <Table data={[{ id: 1 }, { id: 2 }]} showHeader={showHeader}>
          <Column>
            <HeaderCell>ID</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </Table>
      );

      const grid = screen.getByRole('grid');
      expect(grid.getAttribute('aria-rowcount')).to.equal(showHeader ? '3' : '2');
      expect(
        screen.getAllByRole('row').map(row => row.getAttribute('aria-rowindex'))
      ).to.deep.equal(showHeader ? ['1', '2', '3'] : ['1', '2']);
    });
  }

  it('Should hava row className', () => {
    render(
      <Table
        rowClassName="custom-row"
        minHeight={500}
        data={[
          {
            id: 1,
            name: 'a'
          },
          {
            id: 2,
            name: 'b'
          }
        ]}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );
    expect(screen.getByRole('grid').querySelectorAll('.rs-table-row.custom-row')).to.have.length(3);
  });

  it('Should hava row className by rowClassName()', () => {
    const rowClassName = sinon.spy((rowData, rowIndex) => {
      if (rowIndex === 0) {
        return 'custom-row';
      } else if (rowIndex === -1) {
        return 'header-row';
      }
      return 'default-row';
    });

    render(
      <Table
        rowClassName={rowClassName}
        minHeight={500}
        data={[
          {
            id: 1,
            name: 'a'
          },
          {
            id: 2,
            name: 'b'
          }
        ]}
      >
        <Column>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    expect(rowClassName).to.have.been.called;
    expect(screen.getByRole('grid').querySelector('.rs-table-row.header-row')).to.have.text(
      'IDName'
    );
    expect(screen.getByRole('grid').querySelector('.rs-table-row.custom-row')).to.have.text('1a');
    expect(screen.getByRole('grid').querySelector('.rs-table-row.default-row')).to.have.text('2b');
  });

  it('Should be fixed column', () => {
    const ref = React.createRef<any>();

    render(
      <div style={{ width: 300 }}>
        <Table
          ref={ref}
          showHeader={false}
          data={[
            {
              id: 1,
              name: 'a'
            }
          ]}
        >
          <Column width={200} fixed>
            <HeaderCell>11</HeaderCell>
            <Cell>12</Cell>
          </Column>
          <Column width={200}>
            <HeaderCell>11</HeaderCell>
            <Cell>12</Cell>
          </Column>
        </Table>
      </div>
    );

    const table = ref.current.root;

    expect(table.querySelectorAll('.rs-table-cell-group')).to.have.length(2);
    expect(table.querySelectorAll('.rs-table-cell-group-fixed-left')).to.have.length(1);
  });

  // https://github.com/rsuite/rsuite/issues/1307
  it('Should be fixed column for array column', () => {
    const columns = [
      <Column width={200} fixed key={1}>
        <HeaderCell>11</HeaderCell>
        <Cell>12</Cell>
      </Column>,
      <Column width={200} key={2}>
        <HeaderCell>11</HeaderCell>
        <Cell>12</Cell>
      </Column>
    ];

    const ref = React.createRef<any>();

    render(
      <div style={{ width: 300 }}>
        <Table
          showHeader={false}
          ref={ref}
          data={[
            {
              id: 1,
              name: 'a'
            }
          ]}
        >
          {columns}
        </Table>
      </div>
    );

    const table = ref.current.root;

    expect(table.querySelectorAll('.rs-table-cell-group')).to.have.length(2);
    expect(table.querySelectorAll('.rs-table-cell-group-fixed-left')).to.have.length(1);
  });

  it('Should replace all classPrefix', () => {
    const ref = React.createRef<any>();

    render(
      <div style={{ width: 300 }}>
        <Table
          ref={ref}
          classPrefix="my-list"
          data={[
            {
              id: 1,
              name: 'a'
            }
          ]}
        >
          <Column width={200} fixed>
            <HeaderCell>11</HeaderCell>
            <Cell>12</Cell>
          </Column>
          <Column width={200}>
            <HeaderCell>11</HeaderCell>
            <Cell>12</Cell>
          </Column>
        </Table>
      </div>
    );

    const table = ref.current.root;

    expect(table.querySelectorAll('.my-list-cell-group')).to.have.length(4);
    expect(table.querySelectorAll('.my-list-cell')).to.have.length(4);
    expect(table.querySelectorAll('.my-list-cell-header')).to.have.length(2);
    expect(table.querySelectorAll('.my-list-row')).to.have.length(2);
  });

  it('Should call `onScroll` callback', async () => {
    const onScroll = sinon.spy();
    const diagnostic = observeWheel();
    let body: HTMLElement | null = null;
    try {
      render(
        <Table onScroll={onScroll} data={[{ id: 1, name: 'a' }]} height={60} width={100}>
          <Column width={200}>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </Table>
      );

      body = screen.getByRole('grid').querySelector<HTMLElement>('.rs-table-body-row-wrapper')!;
      expect(body.clientHeight).to.equal(20);
      expect(body.scrollHeight).to.be.greaterThan(body.clientHeight);

      act(() => {
        body?.dispatchEvent(new WheelEvent('wheel', { deltaY: 10, deltaX: 2 }));
      });

      await waitFor(() => {
        expect(onScroll).to.have.been.calledOnce;
        expect(onScroll).to.have.been.calledWith(2, 10);
      });
    } catch (error) {
      diagnostic.log(body, onScroll.callCount);
      throw error;
    } finally {
      diagnostic.restore();
    }
  });

  it('Should get scroll position via `ref`', async () => {
    const onScroll = sinon.spy();
    const diagnostic = observeWheel();
    let body: HTMLElement | null = null;
    try {
      const table = React.createRef<any>();
      render(
        <Table
          onScroll={onScroll}
          ref={table}
          data={[{ id: 1, name: 'a' }]}
          height={60}
          width={100}
        >
          <Column width={200}>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </Table>
      );
      body = screen.getByRole('grid').querySelector<HTMLElement>('.rs-table-body-row-wrapper')!;
      expect(body.clientHeight).to.equal(20);
      expect(body.scrollHeight).to.be.greaterThan(body.clientHeight);
      body?.dispatchEvent(new WheelEvent('wheel', { deltaY: 10, deltaX: 2 }));

      await waitFor(() => {
        expect(table.current?.scrollPosition.top).to.equal(10);
        expect(table.current?.scrollPosition.left).to.equal(2);
      });
    } catch (error) {
      diagnostic.log(body, onScroll.callCount);
      throw error;
    } finally {
      diagnostic.restore();
    }
  });

  it('Should call `onScroll` callback by scrollTop', done => {
    const ref = React.createRef<any>();

    const App = () => {
      const data = [{ id: 1, name: 'a' }];

      const handleScroll = (x, y) => {
        if (y === 10) {
          done();
        }
      };

      return (
        <Table ref={ref} onScroll={handleScroll} data={data} height={10}>
          <Column>
            <HeaderCell>11</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </Table>
      );
    };

    render(<App />);

    ref.current?.scrollTop(10);
  });

  it('Should call `onScroll` callback by scrollLeft', done => {
    const ref = React.createRef<any>();
    const App = () => {
      const data = [{ id: 1, name: 'a' }];

      const handleScroll = x => {
        if (x === 10) {
          done();
        }
      };

      return (
        <Table ref={ref} onScroll={handleScroll} data={data} height={10} style={{ width: 100 }}>
          <Column>
            <HeaderCell>id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column>
            <HeaderCell>name</HeaderCell>
            <Cell dataKey="name" />
          </Column>
        </Table>
      );
    };

    render(<App />);

    ref.current.scrollLeft(10);
  });

  it('Should call `onScroll` callback by change column', () => {
    let xOffset = null;

    const defaultData = [{ id: 1, name: 'a', address: 'shanghai' }];
    const ref = React.createRef<any>();

    const App = () => {
      const tableRef = useRef<any>();
      const [showAddress, setShowAddress] = useState(false);
      const [, forceUpdate] = useState<any>();

      const handleScroll = x => {
        xOffset = x;
      };

      useImperativeHandle(
        ref,
        () => ({
          update() {
            forceUpdate({});
          },
          updateTable() {
            setShowAddress(true);
          },
          scrollLeft(y) {
            tableRef.current?.scrollLeft?.(y);
          }
        }),
        []
      );

      return (
        <Table ref={tableRef} onScroll={handleScroll} data={defaultData} height={10} width={100}>
          <Column width={80}>
            <HeaderCell>11</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column width={40}>
            <HeaderCell>name</HeaderCell>
            <Cell dataKey="name" />
          </Column>
          {showAddress && (
            <Column width={80}>
              <HeaderCell>Address</HeaderCell>
              <Cell dataKey="address" />
            </Column>
          )}
        </Table>
      );
    };

    render(<App />);

    act(() => {
      ref.current.scrollLeft(20);
    });

    expect(xOffset).to.equal(20);
    act(() => {
      ref.current.update();
    });

    expect(xOffset).to.equal(20);

    act(() => {
      ref.current.updateTable();
    });

    expect(xOffset).to.equal(0);
  });

  it('Should get the latest `data` in onScroll', done => {
    const App = forwardRef((props, ref: React.Ref<any>) => {
      const [data, setData] = useState<any>([]);

      const handleScroll = () => {
        if (data.length === 1) {
          done();
        }
      };
      React.useEffect(() => {
        setData([
          {
            id: 1,
            name: 'a'
          }
        ]);
      }, []);
      return (
        <Table ref={ref} onScroll={handleScroll} data={data} height={10}>
          <Column>
            <HeaderCell>11</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </Table>
      );
    });
    render(<App />);

    const body = screen.getByRole('grid').querySelector('.rs-table-body-row-wrapper');

    body?.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
  });

  it('Should be rowSpan', () => {
    const data = [
      {
        city: 'New Gust',
        name: 'Janis',
        rowspan: 2
      },
      {
        city: 'New Gust',
        name: 'Ernest Schuppe Anderson'
      },
      {
        city: 'Maria Junctions',
        name: 'Alessandra',
        rowspan: 3
      },
      {
        city: 'Maria Junctions',
        name: 'Margret'
      },
      {
        city: 'Maria Junctions',
        name: 'Emiliano'
      }
    ];
    render(
      <Table height={500} data={data} rowHeight={40}>
        <Column
          width={100}
          verticalAlign="middle"
          rowSpan={rowData => {
            return rowData.rowspan;
          }}
        >
          <HeaderCell>City</HeaderCell>
          <Cell dataKey="city" />
        </Column>
        <Column width={100}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    const rowspanCells = screen
      .getAllByRole('gridcell')
      .filter(cell => cell.getAttribute('aria-rowspan'));

    const rows = screen
      .getAllByRole('row')
      .filter(row => !row.classList.contains('rs-table-row-header'));

    const rowspan = screen
      .getAllByRole('row')
      .filter(row => row.classList.contains('rs-table-row-rowspan'));

    expect(rowspanCells[0]).to.style('height', `${40 * 2}px`);
    expect(rowspanCells[1]).to.style('height', `${40 * 3}px`);
    expect(rowspanCells).to.have.length(2);
    expect(rowspan).to.have.length(2);

    // Check if merged cells are removed.
    expect(rows[0].querySelectorAll('.rs-table-cell')).to.have.length(2);
    expect(rows[1].querySelectorAll('.rs-table-cell')).to.have.length(1);
    expect(rows[2].querySelectorAll('.rs-table-cell')).to.have.length(2);
    expect(rows[3].querySelectorAll('.rs-table-cell')).to.have.length(1);
    expect(rows[4].querySelectorAll('.rs-table-cell')).to.have.length(1);

    expect(screen.getByRole('grid')).to.have.class('rs-table-has-rowspan');
  });

  for (const fixed of [undefined, 'left', 'right'] as const) {
    it(`keeps the lower part of a spanning ${fixed ?? 'scrollable'} cell clickable`, async () => {
      const data = [{ id: 1, span: 3 }, { id: 2 }, { id: 3 }];
      const onRowClick = sinon.spy();
      const editor = (
        <Column width={140} fixed={fixed} verticalAlign="middle" rowSpan={row => row.span}>
          <HeaderCell>Editor</HeaderCell>
          <Cell>{row => <input aria-label={`Edit row ${row.id}`} />}</Cell>
        </Column>
      );
      const other = (
        <Column width={400}>
          <HeaderCell>Row</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      );

      render(
        <Table
          width={330}
          height={205}
          rowHeight={50}
          data={data}
          rowKey="id"
          onRowClick={onRowClick}
        >
          {fixed === 'right' ? other : editor}
          {fixed === 'right' ? editor : other}
        </Table>
      );

      const input = screen.getByRole('textbox', { name: 'Edit row 1' });
      const secondRow = screen.getAllByRole('row')[2];
      const secondRowCell = secondRow.querySelector('[role="gridcell"]')!;
      const pointAtCenter = (element: Element) => {
        const { left, top, width, height } = element.getBoundingClientRect();
        return document.elementFromPoint(left + width / 2, top + height / 2);
      };

      const inputBounds = input.getBoundingClientRect();
      expect(inputBounds.top + inputBounds.height / 2).to.be.greaterThan(
        secondRow.getBoundingClientRect().top
      );
      await waitFor(() => expect(pointAtCenter(input)).to.equal(input));

      const target = pointAtCenter(input);
      expect(target).to.equal(input);
      fireEvent.click(target!);
      expect(onRowClick.firstCall.args[0]).to.equal(data[0]);
      const neighbor = secondRowCell.getBoundingClientRect();
      expect(
        document
          .elementFromPoint(neighbor.left + 25, neighbor.top + neighbor.height / 2)
          ?.closest('[role="gridcell"]')
      ).to.equal(secondRowCell);
    });
  }

  it('keeps the fixed cell above a scrolling span on the covered row', async () => {
    const data = [{ id: 1, span: 3 }, { id: 2 }, { id: 3 }];
    const table = React.createRef<TableInstance<(typeof data)[number], number>>();

    render(
      <Table ref={table} width={330} height={205} rowHeight={50} data={data} rowKey="id">
        <Column width={80} fixed>
          <HeaderCell>Fixed</HeaderCell>
          <Cell>{row => <button type="button">Row {row.id}</button>}</Cell>
        </Column>
        <Column width={150} rowSpan={row => row.span}>
          <HeaderCell>Spanning</HeaderCell>
          <Cell>{row => <span>Spanning row {row.id}</span>}</Cell>
        </Column>
        <Column width={320}>
          <HeaderCell>Other</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );

    act(() => table.current?.scrollLeft(100));
    await waitFor(() => expect(table.current?.scrollPosition.left).to.equal(100));

    const pinned = screen.getByRole('button', { name: 'Row 2' });
    const spanning = screen.getByText('Spanning row 1').closest('[role="gridcell"]');
    const { left, right, top, height } = pinned.getBoundingClientRect();
    const y = top + height / 2;
    expect(document.elementFromPoint((left + right) / 2, y)).to.equal(pinned);
    expect(document.elementFromPoint(right + 30, y)?.closest('[role="gridcell"]')).to.equal(
      spanning
    );
  });

  // fix https://github.com/rsuite/rsuite/issues/2051
  it('Should disable scroll events when loading', done => {
    const appRef = React.createRef<any>();
    const data = [{ id: 1, name: 'a' }];

    const App = forwardRef((props, ref) => {
      const [loading, setLoading] = useState(true);

      useImperativeHandle(ref, () => ({
        setLoading: v => {
          setLoading(v);
        }
      }));

      return (
        <Table
          {...props}
          onScroll={(x, y) => {
            assert.equal(y, 20);
            done();
          }}
          loading={loading}
          data={data}
          height={20}
          width={100}
        >
          <Column width={100}>
            <HeaderCell>ID</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column width={100}>
            <HeaderCell>Name</HeaderCell>
            <Cell dataKey="name" />
          </Column>
        </Table>
      );
    });

    const { container } = render(<App ref={appRef} />);

    const body = container.querySelector('.rs-table-body-row-wrapper') as HTMLElement;

    act(() => {
      body.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
    });

    act(() => {
      appRef.current.setLoading(false);
    });

    body.dispatchEvent(new WheelEvent('wheel', { deltaY: 20 }));
  });

  it('Should update the scroll after the size changes', () => {
    const onScroll = sinon.spy();
    const App = forwardRef((props, ref) => {
      const data = [{ id: 1, name: 'a' }];

      const [width, setWidth] = useState(100);
      useImperativeHandle(ref, () => ({
        updateWidth: () => {
          setWidth(50);
        }
      }));

      return (
        <Table shouldUpdateScroll={onScroll} data={data} height={10} style={{ width }}>
          <Column>
            <HeaderCell>id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column>
            <HeaderCell>name</HeaderCell>
            <Cell dataKey="name" />
          </Column>
        </Table>
      );
    });

    const ref = React.createRef<any>();

    render(<App ref={ref} />);

    expect(onScroll).to.be.calledOnce;
    expect(onScroll).to.be.calledWith('bodyHeightChanged');

    act(() => {
      ref.current.updateWidth();
    });

    expect(onScroll).to.be.calledTwice;
    expect(onScroll).to.be.calledWith('widthChanged');
  });

  it('Should update the scrollbar when resize', async () => {
    const data = [{ id: 1, name: 'a' }];
    const ref = React.createRef<any>();
    const shouldUpdateScrolSpy = sinon.spy();

    render(
      <div ref={ref} style={{ width: 200 }}>
        <Table data={data} height={10} shouldUpdateScroll={shouldUpdateScrolSpy}>
          <Column width={100}>
            <HeaderCell>id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column width={100}>
            <HeaderCell>id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column width={100}>
            <HeaderCell>id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </Table>
      </div>
    );

    const scrollbar = ref.current.querySelector('.rs-table-scrollbar-horizontal');

    expect(scrollbar.style.width).to.equal('200px');

    ref.current.style.width = '100px';

    await waitFor(() => {
      expect(shouldUpdateScrolSpy).to.be.callCount(2);
      expect(shouldUpdateScrolSpy).to.be.calledWith('widthChanged');
      expect(scrollbar.style.width).to.equal('100px');
    });
  });

  it('Should support React.Fragment', () => {
    const data = [
      { id: 1, firstName: 'firstName', lastName: 'lastName', companyName: 'companyName' }
    ];
    render(
      <Table classPrefix="rs-table" height={400} data={data}>
        <Column width={70} align="center" verticalAlign="middle" sortable>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <ColumnGroup
          header={'Basic Info'}
          align="center"
          verticalAlign="middle"
          groupHeaderHeight={40}
        >
          <React.Fragment>
            <Column width={120} resizable sortable>
              <HeaderCell>firstName</HeaderCell>
              <Cell dataKey="firstName" />
            </Column>

            <Column width={120} resizable sortable>
              <HeaderCell>lastName</HeaderCell>
              <Cell dataKey="lastName" />
            </Column>
          </React.Fragment>
        </ColumnGroup>

        <React.Fragment>
          <ColumnGroup
            header={'Basic Info'}
            align="center"
            verticalAlign="middle"
            groupHeaderHeight={40}
          >
            <Column width={200} verticalAlign="middle" sortable>
              <HeaderCell>Company Name</HeaderCell>
              <Cell dataKey="companyName" />
            </Column>

            <Column width={200} verticalAlign="middle" sortable>
              <HeaderCell>Company Name</HeaderCell>
              <Cell dataKey="companyName" />
            </Column>
          </ColumnGroup>

          <Column width={200} verticalAlign="middle" sortable>
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>
        </React.Fragment>
        {[
          <Column key="array-0" width={200} verticalAlign="middle" sortable>
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>,
          [
            <React.Fragment key="array-0">
              <Column width={200} verticalAlign="middle" sortable>
                <HeaderCell>Company Name</HeaderCell>
                <Cell dataKey="companyName" />
              </Column>
            </React.Fragment>
          ]
        ]}
        <Column width={200} verticalAlign="middle" sortable>
          <HeaderCell>Company Name</HeaderCell>
          <Cell dataKey="companyName" />
        </Column>
      </Table>
    );

    expect(
      screen.getByRole('grid').querySelectorAll('.rs-table-body-row-wrapper .rs-table-cell-content')
    ).to.length(9);
  });

  it('Should render a custom row', () => {
    render(
      <Table
        minHeight={500}
        data={[
          {
            id: 1,
            name: 'a'
          },
          {
            id: 2,
            name: 'b'
          }
        ]}
        renderRow={(children, rowData) =>
          rowData && rowData.id === 1 ? <div className="custom-row">{children}</div> : children
        }
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );
    expect(screen.getByRole('grid').querySelectorAll('.rs-table-row .custom-row')).to.have.length(
      1
    );
  });

  it('Should call shouldUpdateScroll after the height of the table container is changed', async () => {
    const onScroll = sinon.spy();
    const data = [{ id: 1, name: 'a' }];

    const App = forwardRef((_, ref) => {
      const [height, setHeight] = useState(300);
      const tableRef = useRef<any>();

      useImperativeHandle(ref, () => ({
        get table() {
          return tableRef.current?.root as HTMLElement;
        },
        updateTableHeight: () => {
          setHeight(400);
        }
      }));

      return (
        <div style={{ height }}>
          <Table ref={tableRef} fillHeight height={200} data={data} shouldUpdateScroll={onScroll}>
            <Column>
              <HeaderCell>11</HeaderCell>
              <Cell>12</Cell>
            </Column>
            <Column>
              <HeaderCell>11</HeaderCell>
              <Cell>12</Cell>
            </Column>
          </Table>
        </div>
      );
    });

    const ref = React.createRef<any>();

    render(<App ref={ref} />);

    expect(ref.current.table).to.have.style('height', '300px');

    act(() => {
      ref.current.updateTableHeight();
    });

    await waitFor(() => {
      expect(onScroll).to.be.callCount(3);
      expect(onScroll).to.be.calledWith('heightChanged');
      expect(ref.current.table).to.have.style('height', '400px');
    });
  });

  it('Should not render scrollbars', () => {
    render(
      <Table data={[{ name: 'name' }]} rowKey="name" height={100}>
        <Column>
          <HeaderCell>name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );
    expect(screen.getByRole('grid').querySelector('.rs-table-scrollbar-vertical')).to.not.exist;
  });

  it('Should throw error for rowData check', () => {
    expect(() => {
      const TreeCell = ({ rowData, ...rest }: any) => {
        return <Cell rowData={rowData} {...rest} />;
      };

      render(
        <Table isTree rowKey="id" data={[{ id: 1, name: 'a' }]}>
          <Column>
            <HeaderCell>b</HeaderCell>
            <TreeCell />
          </Column>
        </Table>
      );
    }).to.not.throw();
  });

  it('Should render custom column', () => {
    const CustomColumn = forwardRef((props: any, ref: any) => {
      return <Column ref={ref} sortable align="center" flexGrow={1} fullText {...props} />;
    });

    render(
      <Table
        data={[
          {
            id: 1,
            name: 'a'
          }
        ]}
      >
        <CustomColumn fullText={false}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </CustomColumn>
      </Table>
    );

    expect(screen.getByRole('grid').querySelector('.rs-table-cell-header-sortable')).to.exist;
    expect(screen.getByRole('grid').querySelector('.rs-table-cell-full-text')).to.not.exist;
  });

  it('Should align cell content using Flexbox layout', () => {
    const data = [{ id: 1, name: 'a' }];

    render(
      <Table data={data}>
        <Column>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" data-testid="test-1" />
        </Column>

        <Column align="center">
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" data-testid="test-2" />
        </Column>

        <Column align="left">
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" data-testid="test-3" />
        </Column>

        <Column align="start">
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" data-testid="test-4" />
        </Column>

        <Column verticalAlign="center">
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" data-testid="test-5" />
        </Column>

        <Column verticalAlign="bottom">
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" data-testid="test-6" />
        </Column>

        <Column verticalAlign="end">
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" data-testid="test-7" />
        </Column>
      </Table>
    );

    expect(screen.getByTestId('test-2').firstChild).to.have.style('display', 'flex');
    expect(screen.getByTestId('test-2').firstChild).to.have.style('justify-content', 'center');

    expect(screen.getByTestId('test-3').firstChild).to.have.style('display', 'flex');
    expect(screen.getByTestId('test-3').firstChild).to.have.style('justify-content', 'flex-start');

    expect(screen.getByTestId('test-4').firstChild).to.have.style('display', 'flex');
    expect(screen.getByTestId('test-4').firstChild).to.have.style('justify-content', 'start');

    expect(screen.getByTestId('test-5').firstChild).to.have.style('display', 'flex');
    expect(screen.getByTestId('test-5').firstChild).to.have.style('align-items', 'center');

    expect(screen.getByTestId('test-6').firstChild).to.have.style('display', 'flex');
    expect(screen.getByTestId('test-6').firstChild).to.have.style('align-items', 'flex-end');

    expect(screen.getByTestId('test-7').firstChild).to.have.style('display', 'flex');
    expect(screen.getByTestId('test-7').firstChild).to.have.style('align-items', 'end');
  });

  it('Should render ColumnResizer & fill rest space', () => {
    render(
      <Table data={[{ id: 1, name: 'a' }]}>
        <Column width={100} flexGrow={1} resizable>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    const headerCell = screen.getByRole('grid').querySelector('.rs-table-cell-header');
    expect(headerCell).to.exist;
    expect(screen.getByRole('grid').querySelector('.rs-table-column-resize-spanner')).to.exist;

    const width = headerCell?.getBoundingClientRect().width;
    expect(width).not.equal(100);
    expect(width).to.equal(screen.getByRole('grid').getBoundingClientRect().width);
  });

  it('Should call `onScroll` callback when trigger keyboard event', () => {
    const onScroll = sinon.spy();
    render(
      <Table onScroll={onScroll} data={[{ id: 1, name: 'a' }]} height={10} width={100}>
        <Column width={100}>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column width={100}>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowDown' });

    expect(onScroll).to.have.been.calledOnce;
    expect(onScroll).to.be.calledWith(0, 40);

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowUp' });
    expect(onScroll).to.have.been.calledTwice;
    expect(onScroll).to.be.calledWith(0, 0);

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });
    expect(onScroll).to.have.been.calledThrice;
    expect(onScroll).to.be.calledWith(40, 0);

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowLeft' });
    expect(onScroll).to.have.callCount(4);
    expect(onScroll).to.be.calledWith(0, 0);
  });
});
