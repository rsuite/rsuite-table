import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';

import { getDOMNode, getInstance } from './TestWrapper';
import HeaderCell from '../src/HeaderCell';

describe('Table', () => {
  it('Should output a table', () => {
    const instanceDom = getDOMNode(<Table />);
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

  it('Should call `setRowHeight` callback', done => {
    const doneOp = () => {
      done();
    };
    getDOMNode(
      <Table
        setRowHeight={doneOp}
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

  it('Should be fixed `Column`', () => {
    const instanceDom = getDOMNode(
      <Table>
        <Column fixed>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell>12</Cell>
        </Column>
      </Table>
    );

    assert.equal(
      instanceDom.querySelectorAll('.rs-table-cell-group.rs-table-cell-group-fixed').length,
      1
    );
  });

  it('Should call `onTouchMove` callback', done => {
    const instance = getInstance(
      <Table
        isTree
        onTouchMove={() => {
          done();
        }}
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
    ReactTestUtils.Simulate.touchMove(instance.tableBody);
  });

  it('Should call `onTouchStart` callback', done => {
    const instance = getInstance(
      <Table
        isTree
        onTouchStart={() => {
          done();
        }}
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
    ReactTestUtils.Simulate.touchStart(instance.tableBody);
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
});
