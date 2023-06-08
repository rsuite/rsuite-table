import React from 'react';
import { render, waitFor, act, fireEvent, screen } from '@testing-library/react';
import getHeight from 'dom-lib/getHeight';
import getWidth from 'dom-lib/getWidth';
import Table from '../src/Table';
import Column from '../src/Column';
import ColumnGroup from '../src/ColumnGroup';
import Cell from '../src/Cell';
import { getDOMNode, getInstance } from './utils';
import HeaderCell from '../src/HeaderCell';
import '../src/less/index.less';

describe('Table', () => {
  it('Should output a table', () => {
    const instance = getDOMNode(<Table>test</Table>);
    expect(instance).to.have.class('rs-table');
  });

  it('Should output 2 cell', () => {
    const instance = getDOMNode(
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

    expect(instance.querySelectorAll('.rs-table-cell')).to.be.length(2);
  });

  it('Should be disabled scroll', () => {
    const instance = getDOMNode(
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

    expect(instance.querySelectorAll('.rs-table-scrollbar-handle')).to.be.length(0);
  });

  it('Should be loading', () => {
    const instance = getDOMNode(
      <Table loading>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(instance).to.have.class('rs-table-loading');
    expect(instance.querySelectorAll('.rs-table-loader')).to.be.length(1);
    expect(instance.getAttribute('aria-busy')).to.equal('true');
  });

  it('Should render custom loader', () => {
    const instance = getDOMNode(
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

    expect(instance.querySelector('.my-loading')).to.text('loading');
  });

  it('Should not render custom loader', () => {
    const instance = getDOMNode(
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

    expect(instance.querySelector('.my-loading')).to.not.exist;
  });

  it('Should render custom empty info', () => {
    const instance = getDOMNode(
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

    expect(instance.querySelector('.my-info')).to.text('empty');
  });

  it('Should be bordered', () => {
    const instance = getDOMNode(
      <Table bordered>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(instance).to.have.class('rs-table-bordered');
  });

  it('Should be bordered for cell', () => {
    const instance = getDOMNode(
      <Table cellBordered>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(instance).to.have.class('rs-table-cell-bordered');
  });

  it('Should render loader dom element when set `loadAnimation`', () => {
    const instance = getDOMNode(
      <Table loadAnimation>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    expect(instance.querySelectorAll('.rs-table-loader')).to.be.exist;
  });

  it('Should be wordWrap', async () => {
    const data = [{ id: 1, country: 'South Georgia and the South Sandwich Islands' }];
    const ref = React.createRef();

    render(
      <Table ref={ref} wordWrap data={data}>
        <Column width={20}>
          <HeaderCell>Country</HeaderCell>
          <Cell dataKey="country" />
        </Column>
      </Table>
    );

    const table = ref.current.root;
    const cell = table.querySelectorAll('.rs-table-cell')[1];
    const cellContent = table.querySelectorAll('.rs-table-cell-content')[1];

    expect(cellContent.style.wordBreak).to.equal('break-all');
    expect(ref.current.root).to.have.class('rs-table-word-wrap');
    expect(cell.innerText).to.equal('South Georgia and the South Sandwich Islands');

    await waitFor(() => {
      assert.isTrue(getHeight(cell) > 46);
    });
  });

  it('Should be wordWrap=break-all', () => {
    const ref = React.createRef();
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

    const cellContent = ref.current.querySelector('.rs-table-cell-content');

    expect(cellContent.style.wordBreak).to.equal('break-all');
  });

  it('Should be wordWrap=break-word', () => {
    const ref = React.createRef();
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
    const ref = React.createRef();
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

  it('Should be automatic height', () => {
    const instance = getDOMNode(
      <Table
        autoHeight
        data={[
          { id: 1, name: 'a' },
          { id: 2, name: 'b' }
        ]}
      >
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
    // 2 rows + header row
    const height = 46 * 2 + 40;
    expect(instance).to.style('height', height + 'px');
  });

  it('Should be automatic height when there is a horizontal scroll bar', () => {
    const instance = getDOMNode(
      <Table
        autoHeight
        width={100}
        data={[
          { id: 1, name: 'a' },
          { id: 2, name: 'b' }
        ]}
      >
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
    // 2 rows + header row + scrollbar
    const height = 46 * 2 + 40 + 10;
    expect(instance).to.style('height', height + 'px');
  });

  // https://github.com/rsuite/rsuite-table/issues/300
  it('Should be a full horizontal scrolling range', () => {
    const instance = getDOMNode(
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

    const SCROLLBAR_WIDTH = 10;
    const tableWidth = 200;
    const contextWidth = 400;
    const width = Math.floor((tableWidth / (contextWidth - SCROLLBAR_WIDTH)) * tableWidth);

    const scrollbarHandleWidth = Math.floor(
      getWidth(instance.querySelector('.rs-table-scrollbar-handle'))
    );

    expect(width).to.equal(scrollbarHandleWidth);
  });

  it('Should be min height', () => {
    const instance = getDOMNode(
      <Table
        autoHeight
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
    expect(instance).to.style('height', '500px');
  });

  it('Should call `rowHeight` callback', done => {
    const doneOp = () => {
      done();
      return 20;
    };
    getDOMNode(
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
    const onWheelSpy = sinon.spy();
    const instance = getDOMNode(
      <Table onWheel={onWheelSpy} data={[{ id: 1, name: 'a' }]} height={10}>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );

    fireEvent.wheel(instance.querySelector('.rs-table-body-row-wrapper'));

    expect(onWheelSpy).to.have.been.calledOnce;
  });

  it('Should get the body DOM', () => {
    const data = [
      {
        id: 1,
        name: 'a'
      }
    ];

    const instance = getInstance(
      <Table data={data}>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );

    expect(instance.body.style.height).to.be.equal(`${data.length * 46}px`);
  });

  it('Should not be displayed header', () => {
    const instance = getDOMNode(
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
    assert.equal(instance.querySelectorAll('.rs-table-header-row-wrapper').length, 0);
  });

  it('Should hava row className', () => {
    const instance = getDOMNode(
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
    assert.equal(instance.querySelectorAll('.rs-table-row.custom-row').length, 3);
  });

  it('Should hava row className by rowClassName()', () => {
    const rowClassNameSpy = sinon.spy((rowData, rowIndex) => {
      if (rowIndex === 0) {
        return 'custom-row';
      } else if (rowIndex === -1) {
        return 'header-row';
      }
      return 'default-row';
    });

    const instance = getDOMNode(
      <Table
        rowClassName={rowClassNameSpy}
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

    expect(rowClassNameSpy).to.have.been.called;
    expect(instance.querySelector('.rs-table-row.header-row')).to.have.text('IDName');
    expect(instance.querySelector('.rs-table-row.custom-row')).to.have.text('1a');
    expect(instance.querySelector('.rs-table-row.default-row')).to.have.text('2b');
  });

  it('Should be fixed column', () => {
    const ref = React.createRef();
    act(() => {
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
    });

    const table = ref.current.root;

    assert.equal(table.querySelectorAll('.rs-table-cell-group').length, 2);
    assert.equal(table.querySelectorAll('.rs-table-cell-group-fixed-left').length, 1);
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

    const ref = React.createRef();

    act(() => {
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
    });

    const table = ref.current.root;

    assert.equal(table.querySelectorAll('.rs-table-cell-group').length, 2);
    assert.equal(table.querySelectorAll('.rs-table-cell-group-fixed-left').length, 1);
  });

  it('Should replace all classPrefix', () => {
    const ref = React.createRef();

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

    assert.equal(table.querySelectorAll('.my-list-cell-group').length, 4);
    assert.equal(table.querySelectorAll('.my-list-cell').length, 4);
    assert.equal(table.querySelectorAll('.my-list-cell-header').length, 2);
    assert.equal(table.querySelectorAll('.my-list-row').length, 2);
  });

  it('Should call `onScroll` callback', done => {
    const instance = getDOMNode(
      <Table
        onScroll={() => done()}
        data={[
          {
            id: 1,
            name: 'a'
          }
        ]}
        height={10}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
    const body = instance.querySelector('.rs-table-body-row-wrapper');

    body.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
  });

  it('Should call `onScroll` callback by scrollTop', done => {
    const App = React.forwardRef((props, ref) => {
      const data = [
        {
          id: 1,
          name: 'a'
        }
      ];

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
    });

    const instance = getInstance(<App />);
    instance.scrollTop(10);
  });

  it('Should call `onScroll` callback by scrollLeft', done => {
    const App = React.forwardRef((props, ref) => {
      const data = [
        {
          id: 1,
          name: 'a'
        }
      ];

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
    });

    const instance = getInstance(<App />);
    instance.scrollLeft(10);
  });

  it('Should call `onScroll` callback by change column', () => {
    let xOffset = null;

    const defaultData = [
      {
        id: 1,
        name: 'a',
        address: 'shanghai'
      }
    ];
    const App = React.forwardRef((props, ref) => {
      const tableRef = React.useRef();
      const [showAddress, setShowAddress] = React.useState(false);
      const [, forceUpdate] = React.useState();

      const handleScroll = x => {
        xOffset = x;
      };

      React.useImperativeHandle(
        ref,
        () => ({
          update() {
            forceUpdate({});
          },
          updateTable() {
            setShowAddress(true);
          },
          scrollLeft(y) {
            tableRef.current.scrollLeft(y);
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
    });

    const instance = getInstance(<App />);

    act(() => {
      instance.scrollLeft(20);
    });

    expect(xOffset).to.equal(20);
    act(() => {
      instance.update();
    });
    expect(xOffset).to.equal(20);
    act(() => {
      instance.updateTable();
    });
    expect(xOffset).to.equal(0);
  });

  it('Should get the latest `data` in onScroll', done => {
    const App = React.forwardRef((props, ref) => {
      const [data, setData] = React.useState([]);

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
    const instance = getDOMNode(<App />);
    const body = instance.querySelector('.rs-table-body-row-wrapper');

    body.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
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
    const instance = getDOMNode(
      <Table height={500} data={data} rowHeight={40}>
        <Column
          width={100}
          verticalAlign="middle"
          rowSpan={rowData => {
            return rowData.rowspan;
          }}
        >
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="city" />
        </Column>
        <Column width={100}>
          <HeaderCell />
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    const rowspanCells = instance.querySelectorAll('.rs-table-cell-rowspan');
    const rows = instance.querySelectorAll('.rs-table-body-row-wrapper .rs-table-row');
    assert.equal(rowspanCells[0].style.height, `${40 * 2}px`);
    assert.equal(rowspanCells[1].style.height, `${40 * 3}px`);

    assert.equal(instance.querySelectorAll('.rs-table-cell-rowspan').length, 2);
    assert.equal(instance.querySelectorAll('.rs-table-row-rowspan').length, 2);

    // Check if merged cells are removed.
    assert.equal(rows[0].querySelectorAll('.rs-table-cell').length, 2);
    assert.equal(rows[1].querySelectorAll('.rs-table-cell').length, 1);
    assert.equal(rows[2].querySelectorAll('.rs-table-cell').length, 2);
    assert.equal(rows[3].querySelectorAll('.rs-table-cell').length, 1);
    assert.equal(rows[4].querySelectorAll('.rs-table-cell').length, 1);
  });

  // fix https://github.com/rsuite/rsuite/issues/2051
  it('Should disable scroll events when loading', done => {
    const appRef = React.createRef();
    const data = [{ id: 1, name: 'a' }];

    const App = React.forwardRef((props, ref) => {
      const [loading, setLoading] = React.useState(true);

      React.useImperativeHandle(ref, () => ({
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

    const body = container.querySelector('.rs-table-body-row-wrapper');

    act(() => {
      body.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
    });

    act(() => {
      appRef.current.setLoading(false);
    });

    body.dispatchEvent(new WheelEvent('wheel', { deltaY: 20 }));
  });

  it('Should update the scroll after the size changes', () => {
    const onScrollSpy = sinon.spy();
    const App = React.forwardRef((props, ref) => {
      const data = [
        {
          id: 1,
          name: 'a'
        }
      ];

      const [width, setWidth] = React.useState(100);
      React.useImperativeHandle(ref, () => ({
        updateWidth: () => {
          setWidth(50);
        }
      }));

      return (
        <Table shouldUpdateScroll={onScrollSpy} data={data} height={10} style={{ width }}>
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

    const instance = getInstance(<App />);

    expect(onScrollSpy.callCount).to.equal(1);
    expect(onScrollSpy.firstCall.firstArg).to.equal('bodyHeightChanged');

    act(() => {
      instance.updateWidth();
    });

    expect(onScrollSpy.callCount).to.equal(2);
    expect(onScrollSpy.secondCall.firstArg).to.equal('widthChanged');
  });

  it('Should update the scrollbar when resize', async () => {
    const data = [{ id: 1, name: 'a' }];
    const ref = React.createRef();
    const shouldUpdateScrolSpy = sinon.spy();

    act(() => {
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
    });

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
    const instance = getDOMNode(
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

    const body = instance.querySelector('.rs-table-body-row-wrapper');

    assert.equal(body.querySelectorAll('.rs-table-cell-content').length, 9);
  });

  it('Should render a custom row', () => {
    const instance = getDOMNode(
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
    assert.equal(instance.querySelectorAll('.rs-table-row .custom-row').length, 1);
  });

  it('Should be fill height', () => {
    const instance = getDOMNode(
      <div style={{ height: 300 }}>
        <Table fillHeight height={200} data={[]}>
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

    assert.equal(instance.querySelector('.rs-table').style.height, '300px');
  });

  it('Should call shouldUpdateScroll after the height of the table container is changed', async () => {
    const onScrollSpy = sinon.spy();
    const data = [
      {
        id: 1,
        name: 'a'
      }
    ];
    const App = React.forwardRef((props, ref) => {
      const [height, setHeight] = React.useState(300);
      const tableRef = React.useRef();
      React.useImperativeHandle(ref, () => ({
        get table() {
          return tableRef.current?.root;
        },
        updateTableHeight: () => {
          setHeight(400);
        }
      }));

      return (
        <div style={{ height }}>
          <Table
            ref={tableRef}
            fillHeight
            height={200}
            data={data}
            shouldUpdateScroll={onScrollSpy}
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
        </div>
      );
    });

    const instance = getInstance(<App />);

    expect(instance.table.style.height).to.equal('300px');

    act(() => {
      instance.updateTableHeight();
    });

    await waitFor(() => {
      expect(onScrollSpy).to.be.callCount(3);
      expect(onScrollSpy).to.be.calledWith('heightChanged');
      expect(instance.table.style.height).to.equal('400px');
    });
  });

  it('Should not render scrollbars', () => {
    const instance = getDOMNode(
      <Table data={[{ name: 'name' }]} rowKey="name" height={100}>
        <Column>
          <HeaderCell>name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );
    expect(instance.querySelector('.rs-table-scrollbar-vertical')).to.not.exist;
  });

  it('Should throw error for rowData check', () => {
    expect(() => {
      /**
       * TODO:
       * Should throw an error when rowData is not passed to Cell.
       * But chai cannot catch errors inside React.
       */
      const TreeCell = ({ rowData, ...rest }) => {
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
    const CustomColumn = React.forwardRef((props, ref) => {
      return <Column ref={ref} sortable align="center" flexGrow={1} fullText {...props} />;
    });

    const instance = getDOMNode(
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

    expect(instance.querySelector('.rs-table-cell-header-sortable')).to.exist;
    expect(instance.querySelector('.rs-table-cell-full-text')).to.not.exist;
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

    expect(screen.getByTestId('test-1').firstChild).not.to.have.style('display');
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
});
