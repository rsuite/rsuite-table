import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';

import { getDOMNode, getInstance } from './TestWrapper';
import HeaderCell from '../src/HeaderCell';

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
});
