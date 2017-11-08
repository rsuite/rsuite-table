import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';


describe('Table', () => {

  it('Should output a table', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Table />
    );
    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.className.match(/\brsuite-table\b/));
  });

  it('Should output 2 cell', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Table >
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

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.querySelectorAll('.rsuite-table-cell').length, 2);
  });

  it('Should be disabled scroll', () => {
    const instance = ReactTestUtils.renderIntoDocument(
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

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.querySelectorAll('.scrollbar-handle').length, 0);
  });

  it('Should be loading', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Table loading>
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

    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.querySelectorAll('.rsuite-table-loading').length);
  });

  it('Should call `onRerenderRowHeight` callback', (done) => {
    const doneOp = () => {
      done();
    };
    const instance = ReactTestUtils.renderIntoDocument(
      <Table
        onRerenderRowHeight={doneOp}
        data={[{
          id: 1,
          name: 'a'
        }]}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
  });

  it('Should call `onWheel` callback', (done) => {
    const doneOp = () => {
      done();
    };
    const instance = ReactTestUtils.renderIntoDocument(
      <Table
        onWheel={doneOp}
        data={[{
          id: 1,
          name: 'a'
        }]}
        height={10}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.wheel(instanceDom.querySelector('.rsuite-table-body-row-wrapper'));
  });

  it('Should call `onTreeToggle` callback', (done) => {
    const doneOp = () => {
      done();
    };
    const instance = ReactTestUtils.renderIntoDocument(
      <Table
        onTreeToggle={doneOp}
        isTree
        data={[{
          id: 1,
          name: 'a',
          hasChildren: true,
          children: [{
            id: 2,
            name: 'b'
          }]
        }]}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.click(instanceDom.querySelector('.expand-icon'));
  });

  it('Should be fixed `Column`', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Table >
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

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.querySelectorAll('.rsuite-table-cell-group.fixed').length, 1);
  });

  it('Should call `onTouchMove` callback', (done) => {

    const instance = ReactTestUtils.renderIntoDocument(
      <Table
        isTree
        onTouchMove={() => {
          done();
        }}
        data={[{
          id: 1,
          name: 'a'
        }]}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
    ReactTestUtils.Simulate.touchMove(instance.tableBody);
  });

  it('Should call `onTouchStart` callback', (done) => {

    const instance = ReactTestUtils.renderIntoDocument(
      <Table
        isTree
        onTouchStart={() => {
          done();
        }}
        data={[{
          id: 1,
          name: 'a'
        }]}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
    ReactTestUtils.Simulate.touchStart(instance.tableBody);
  });


  it('Should call `onTreeToggle` callback', () => {

    const instance = ReactTestUtils.renderIntoDocument(
      <Table
        isTree
        data={[{
          id: 1,
          name: 'a',
          children: [{
            id: 2,
            name: 'b',
            children: [{
              id: 3,
              name: 'c',
              children: [{
                id: 4,
                name: 'd',
                children: [{
                  id: 1,
                  name: 'e',
                }]
              }]
            }]
          }]
        }]}
      >
        <Column>
          <HeaderCell>11</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );
    const instanceDom = findDOMNode(instance);

    instance.treeToggleBy(true, (item) => {
      return item.name === 'd';
    });

    assert.ok(instanceDom.querySelector('.open'));

    instance.treeToggleBy(false, (item) => {
      return item.name === 'd';
    });

    assert.ok(!instanceDom.querySelector('.open'));

  });

});
