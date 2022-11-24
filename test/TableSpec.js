import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react';
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

  it('Should be virtualized. Check: Maximum update depth exceeded', () => {
    getDOMNode(
      <Table virtualized data={[{ id: 1, name: 'name' }]}>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
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

  it('Should be wordWrap when isTree', async () => {
    const data = [{ id: 1, country: 'South Georgia and the South Sandwich Islands' }];
    const ref = React.createRef();

    render(
      <Table ref={ref} wordWrap isTree data={data} rowKey="id">
        <Column width={20}>
          <HeaderCell>Country</HeaderCell>
          <Cell dataKey="country" />
        </Column>
      </Table>
    );

    const table = ref.current.root;
    const cell = table.querySelectorAll('.rs-table-cell')[1];

    expect(cell).to.text('South Georgia and the South Sandwich Islands');

    await waitFor(() => {
      expect(getHeight(cell)).to.be.gt(46);
    });
  });

  it('Should be wordWrap when node is expanded', async () => {
    const data = [
      {
        id: 1,
        country: 'Test',
        children: [{ id: 2, country: 'South Georgia and the South Sandwich Islands' }]
      }
    ];
    const ref = React.createRef();

    act(() => {
      render(
        <Table ref={ref} wordWrap isTree data={data} rowKey="id">
          <Column width={20}>
            <HeaderCell>Country</HeaderCell>
            <Cell dataKey="country" />
          </Column>
        </Table>
      );
    });

    const table = ref.current.root;
    const button = table.querySelector('.rs-table-cell-expand-wrapper');

    expect(table.querySelectorAll('.rs-table-cell')[2]).to.be.not.exist;

    fireEvent.click(button);

    const cell = table.querySelectorAll('.rs-table-cell')[2];

    expect(cell).to.text('South Georgia and the South Sandwich Islands');

    await waitFor(() => {
      expect(getHeight(cell)).to.be.gt(46);
    });
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

  it('Should render custom tree columns', () => {
    const instance = getDOMNode(
      <Table
        isTree
        defaultExpandAllRows
        rowKey="id"
        data={[
          {
            id: 1,
            name: 'a',
            children: [
              {
                id: 2,
                name: 'b'
              }
            ]
          }
        ]}
      >
        <Column>
          <HeaderCell>a</HeaderCell>
          <Cell>a</Cell>
        </Column>
        <Column treeCol>
          <HeaderCell>b</HeaderCell>
          <Cell>b</Cell>
        </Column>
      </Table>
    );

    expect(
      instance.querySelector('.rs-table-body-row-wrapper .rs-table-cell-expand-wrapper').parentNode
    ).to.be.text('b');
  });

  it('Should render custom tree toggle', () => {
    const ref = React.createRef();
    act(() => {
      render(
        <Table
          isTree
          ref={ref}
          expandedRowKeys={[1]}
          rowKey="id"
          renderTreeToggle={(expandButton, rowData, expanded) => {
            if (expanded) {
              return <div className="toggle-open">{rowData.name}</div>;
            }
            return <div className="toggle-close">{rowData.name}</div>;
          }}
          data={[
            {
              id: 1,
              name: 'a',
              children: [
                {
                  id: 2,
                  name: 'b',
                  children: [
                    {
                      id: 3,
                      name: 'c'
                    }
                  ]
                }
              ]
            }
          ]}
        >
          <Column>
            <HeaderCell>a</HeaderCell>
            <Cell>a</Cell>
          </Column>
          <Column treeCol>
            <HeaderCell>b</HeaderCell>
            <Cell>b</Cell>
          </Column>
        </Table>
      );
    });

    const table = ref.current.root;
    const openRows = table.querySelectorAll('.toggle-open');

    expect(openRows).to.be.length(1);
    expect(openRows[0]).to.be.text('a');
    expect(table.querySelector('.toggle-close')).to.be.text('b');
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

  it('Should call `onExpandChange` callback', () => {
    const onExpandChangeSpy = sinon.spy();
    const instance = getDOMNode(
      <Table
        onExpandChange={onExpandChangeSpy}
        isTree
        rowKey="id"
        data={[
          {
            id: 1,
            name: 'a',
            hasChildren: true,
            children: [
              {
                id: 2,
                name: 'b'
              }
            ]
          }
        ]}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );

    fireEvent.click(instance.querySelector('.rs-table-cell-expand-icon'));
    expect(onExpandChangeSpy).to.have.been.calledOnce;
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
    const instance = getDOMNode(
      <Table
        rowClassName={rowData => {
          if (rowData && rowData.id === 1) {
            return 'custom-row';
          }
          return 'default-row';
        }}
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
    assert.equal(instance.querySelectorAll('.rs-table-row.custom-row').length, 1);
    assert.equal(instance.querySelectorAll('.rs-table-row.default-row').length, 2);
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

  //  https://github.com/rsuite/rsuite/issues/1257
  it('Should change data, after the isTree property is changed', () => {
    const data = [
      {
        rowKey: 'a',
        name: 'tets',
        num: 1999,
        children: [
          {
            name: 'test-1',
            num: 1000
          },
          {
            name: 'test-2',
            num: 999
          }
        ]
      }
    ];
    const App = React.forwardRef((props, ref) => {
      const [tree, setTree] = React.useState(true);
      const tableRef = React.useRef();
      React.useImperativeHandle(ref, () => ({
        get table() {
          return tableRef.current.root;
        },
        setTree
      }));
      return (
        <div>
          <Table
            ref={tableRef}
            isTree={tree}
            data={data}
            showHeader={false}
            rowKey="rowKey"
            defaultExpandAllRows
          >
            <Column>
              <HeaderCell>name</HeaderCell>
              <Cell dataKey="name" />
            </Column>
            <Column>
              <HeaderCell>num</HeaderCell>
              <Cell dataKey="num" />
            </Column>
          </Table>
        </div>
      );
    });
    App.displayName = 'App';
    const ref = React.createRef();
    act(() => {
      render(<App ref={ref} />);
    });

    const table = ref.current.table;

    assert.equal(table.querySelectorAll('.rs-table-row').length, 3);

    act(() => {
      ref.current.setTree(false);
    });

    assert.equal(table.querySelectorAll('.rs-table-row').length, 1);
    assert.equal(getHeight(table.querySelector('.rs-table-row')), 46);
  });

  it('Should show a vertical scroll bar when the tree is expanded', () => {
    const data = [
      {
        name: '1',
        children: [
          {
            name: '1-1'
          },
          {
            name: '1-2'
          },
          {
            name: '1-3'
          },
          {
            name: '1-4'
          },
          {
            name: '1-5'
          },
          {
            name: '1-6'
          },
          {
            name: '1-7'
          },
          {
            name: '1-8'
          },
          {
            name: '1-9'
          }
        ]
      }
    ];

    const ref = React.createRef();

    render(
      <Table ref={ref} isTree data={data} showHeader={false} rowKey="name" height={100}>
        <Column>
          <HeaderCell>name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    const table = ref.current.root;
    const expand = table.querySelector('.rs-table-cell-expand-icon');

    // Before the Tree expands, it displays 1 row without vertical scroll bar.
    assert.equal(table.querySelectorAll('.rs-table-row').length, 1);
    assert.isNull(table.querySelector('.rs-table-scrollbar-vertical'));

    fireEvent.click(expand);

    // After the Tree is expanded, 10 rows are displayed and a vertical scroll bar is displayed at the same time.
    assert.equal(table.querySelectorAll('.rs-table-row').length, 10);
    assert.isNotNull(table.querySelector('.rs-table-scrollbar-vertical'));
  });

  it('Should render 2 ColumnGroup', () => {
    const ref = React.createRef();
    const columnData = [
      {
        name: 'test 1',
        id: 1
      },
      {
        name: 'test 2',
        id: 2
      }
    ];
    act(() => {
      render(
        <div style={{ width: 300 }}>
          <Table data={[]} ref={ref}>
            {columnData.map((item, index) => {
              return (
                <ColumnGroup key={index} header={item.name} fixed>
                  <Column width={130} sortable>
                    <HeaderCell>First Name</HeaderCell>
                    <Cell dataKey="firstName" />
                  </Column>

                  <Column width={130} sortable>
                    <HeaderCell>Last Name</HeaderCell>
                    <Cell dataKey="lastName" />
                  </Column>
                </ColumnGroup>
              );
            })}
          </Table>
        </div>
      );
    });

    const table = ref.current.root;
    assert.equal(table.querySelectorAll('.rs-table-column-group').length, 2);
    assert.equal(
      table.querySelectorAll(
        '.rs-table-column-group .rs-table-cell-header .rs-table-cell-header-icon-sort'
      ).length,
      4
    );
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

  it('Should be aligned in ColumnGroup', () => {
    const ref = React.createRef();
    const data = [
      {
        name: 'test name',
        id: 1
      }
    ];
    act(() => {
      render(
        <Table data={data} ref={ref}>
          <ColumnGroup header={'Info'} align="right" verticalAlign="top">
            <Column width={150} resizable sortable align="left" verticalAlign="bottom">
              <HeaderCell>firstName</HeaderCell>
              <Cell dataKey="name" />
            </Column>

            <Column width={150} resizable sortable>
              <HeaderCell>lastName</HeaderCell>
              <Cell dataKey="name" />
            </Column>

            <Column width={200} resizable sortable align="center" verticalAlign="middle">
              <HeaderCell>Email</HeaderCell>
              <Cell dataKey="name" />
            </Column>
          </ColumnGroup>
        </Table>
      );
    });

    const table = ref.current.root;

    const groupHeader = table.querySelector('.rs-table-column-group-header-content');
    const groupChildren = table.querySelectorAll(
      '.rs-table-column-group .rs-table-column-group-cell .rs-table-cell-content'
    );

    assert.equal(groupHeader.style.textAlign, 'right');
    assert.equal(groupHeader.style.verticalAlign, 'top');

    assert.equal(groupChildren.length, 3);
    assert.equal(groupChildren[0].textContent, 'firstName');
    assert.equal(groupChildren[1].textContent, 'lastName');
    assert.equal(groupChildren[2].textContent, 'Email');

    assert.equal(groupChildren[0].style.textAlign, 'left');
    assert.equal(groupChildren[0].style.verticalAlign, 'bottom');
    assert.equal(groupChildren[1].style.textAlign, 'right');
    assert.equal(groupChildren[1].style.verticalAlign, 'top');
    assert.equal(groupChildren[2].style.textAlign, 'center');
    assert.equal(groupChildren[2].style.verticalAlign, 'middle');

    const groupBodyChildren = table.querySelectorAll(
      '.rs-table-body-row-wrapper .rs-table-cell-content'
    );

    assert.equal(groupBodyChildren[0].style.textAlign, 'left');
    assert.equal(groupBodyChildren[0].style.verticalAlign, 'bottom');
    assert.equal(groupBodyChildren[1].style.textAlign, 'right');
    assert.equal(groupBodyChildren[1].style.verticalAlign, 'top');
    assert.equal(groupBodyChildren[2].style.textAlign, 'center');
    assert.equal(groupBodyChildren[2].style.verticalAlign, 'middle');
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

  it('Should be to avoid nested classPrefix', () => {
    const data = [{ id: 1, name: 'foobar' }];
    const innerTable = React.createRef();

    getDOMNode(
      <Table
        data={data}
        rowKey="id"
        expandedRowKeys={[1]}
        renderRowExpanded={() => {
          return (
            <Table data={data} ref={innerTable}>
              <Column width={130}>
                <HeaderCell>inner name</HeaderCell>
                <Cell dataKey="name" />
              </Column>
            </Table>
          );
        }}
      >
        <Column width={130}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    expect(innerTable.current.root).to.have.class('rs-table');
    expect(innerTable.current.root).to.have.class('rs-table-hover');
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
});
