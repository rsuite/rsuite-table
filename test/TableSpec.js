import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';

import { getDOMNode, getInstance } from './TestWrapper';
import HeaderCell from '../src/HeaderCell';

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

describe('Table', () => {
  it('Should output a table', () => {
    const instanceDom = getDOMNode(<Table>test</Table>);
    assert.include(instanceDom.className, 'rs-table');
  });

  it('Should output 2 cell', () => {
    const instanceDom = getDOMNode(
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

    assert.equal(instanceDom.querySelectorAll('.rs-table-cell').length, 2);
  });

  it('Should be disabled scroll', () => {
    const instanceDom = getDOMNode(
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

    assert.equal(instanceDom.querySelectorAll('.scrollbar-handle').length, 0);
  });

  it('Should be loading', () => {
    const instanceDom = getDOMNode(
      <Table loading>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    assert.include(instanceDom.className, 'rs-table-loading');
    assert.ok(instanceDom.querySelectorAll('.rs-table-loader').length);
  });

  it('Should render custom loading', () => {
    const instanceDom = getDOMNode(
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
    assert.equal(instanceDom.querySelector('.my-loading').innerText, 'loading');
  });

  it('Should render custom empty info', () => {
    const instanceDom = getDOMNode(
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
    assert.equal(instanceDom.querySelector('.my-info').innerText, 'empty');
  });

  it('Should be bordered', () => {
    const instanceDom = getDOMNode(
      <Table bordered>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    assert.include(instanceDom.className, 'rs-table-bordered');
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
    const instanceDom = getDOMNode(
      <Table cellBordered>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    assert.include(instanceDom.className, 'rs-table-cell-bordered');
  });

  it('Should render loader dom element when set `loadAnimation`', () => {
    const instanceDom = getDOMNode(
      <Table loadAnimation>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );
    assert.ok(instanceDom.querySelectorAll('.rs-table-loader').length);
  });

  it('Should be wordWrap', () => {
    const instanceDom = getDOMNode(
      <Table wordWrap>
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
    assert.include(instanceDom.className, 'rs-table-word-wrap');
  });

  it('Should be automatic height', () => {
    const instanceDom = getDOMNode(
      <Table
        autoHeight
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
    // 2 rows + header row
    const height = 46 * 2 + 46;
    assert.equal(instanceDom.style.height, `${height}px`);
  });

  it('Should be min height', () => {
    const instanceDom = getDOMNode(
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
    assert.equal(instanceDom.style.height, `${500}px`);
  });

  it('Should render custom tree columns', () => {
    const instance = getDOMNode(
      <Table
        isTree
        defaultExpandAllRows
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

    assert.equal(
      instance.querySelector('.rs-table-body-row-wrapper .rs-table-cell-expand-wrapper').parentNode
        .innerText,
      'b'
    );
  });

  it('Should render custom tree toggle', () => {
    const instance = getDOMNode(
      <Table
        isTree
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

    assert.equal(instance.querySelector('.toggle-open').innerText, 'a');
    assert.equal(instance.querySelector('.toggle-close').innerText, 'b');
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

  it('Should call `onWheel` callback', done => {
    const doneOp = () => {
      done();
    };
    const instanceDom = getDOMNode(
      <Table
        onWheel={doneOp}
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
    ReactTestUtils.Simulate.wheel(instanceDom.querySelector('.rs-table-body-row-wrapper'));
  });

  it('Should call `onExpandChange` callback', done => {
    const doneOp = () => {
      done();
    };
    const instanceDom = getDOMNode(
      <Table
        onExpandChange={doneOp}
        isTree
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

    ReactTestUtils.Simulate.click(instanceDom.querySelector('.rs-table-cell-expand-icon'));
  });

  it('Should get the body DOM', () => {
    const data = [
      {
        id: 1,
        name: 'a'
      }
    ];
    let body;
    getInstance(
      <Table
        bodyRef={ref => {
          body = ref;
        }}
        data={data}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
    assert.equal(body.style.height, `${data.length * 46}px`);
  });

  it('Should not be displayed header', () => {
    const instanceDom = getDOMNode(
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
    assert.equal(instanceDom.querySelectorAll('.rs-table-header-row-wrapper').length, 0);
  });

  it('Should hava row className', () => {
    const instanceDom = getDOMNode(
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
    assert.equal(instanceDom.querySelectorAll('.rs-table-row.custom-row').length, 3);
  });

  it('Should hava row className by rowClassName()', () => {
    const instanceDom = getDOMNode(
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
    assert.equal(instanceDom.querySelectorAll('.rs-table-row.custom-row').length, 1);
    assert.equal(instanceDom.querySelectorAll('.rs-table-row.default-row').length, 2);
  });

  it('Should be fixed column', () => {
    ReactTestUtils.act(() => {
      ReactDOM.render(
        <div style={{ width: 300 }} id="my-table">
          <Table
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
        </div>,
        container
      );
    });

    const table = document.getElementById('my-table');

    assert.equal(table.querySelectorAll('.rs-table-cell-group').length, 2);
    assert.equal(table.querySelectorAll('.rs-table-cell-group-fixed-left').length, 1);
  });

  /**
   * https://github.com/rsuite/rsuite/issues/1307
   */
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
    ReactTestUtils.act(() => {
      ReactDOM.render(
        <div style={{ width: 300 }} id="my-table2">
          <Table
            showHeader={false}
            data={[
              {
                id: 1,
                name: 'a'
              }
            ]}
          >
            {columns}
          </Table>
        </div>,
        container
      );
    });

    const table = document.getElementById('my-table2');

    assert.equal(table.querySelectorAll('.rs-table-cell-group').length, 2);
    assert.equal(table.querySelectorAll('.rs-table-cell-group-fixed-left').length, 1);
  });

  /**
   * https://github.com/rsuite/rsuite/issues/1257
   */
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
      React.useImperativeHandle(ref, () => ({
        setTree
      }));
      return (
        <div>
          <Table
            id="my-table3"
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
    ReactTestUtils.act(() => {
      ReactDOM.render(<App ref={ref} />, container);
    });

    const table = document.getElementById('my-table3');
    assert.equal(table.querySelectorAll('.rs-table-row').length, 3);
    ReactTestUtils.act(() => {
      ref.current.setTree(false);
    });

    assert.equal(table.querySelectorAll('.rs-table-row').length, 1);
  });
});
