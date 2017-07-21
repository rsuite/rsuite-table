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

});
