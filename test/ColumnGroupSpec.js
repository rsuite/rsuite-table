import React from 'react';

import { getDOMNode } from './TestWrapper';
import ColumnGroup from '../src/ColumnGroup';

const Item = ({ className, style, children }) => (
  <div className={className} style={style}>
    {children}
  </div>
);

describe('ColumnGroup', () => {
  it('Should output a ColumnGroup', () => {
    const instance = getDOMNode(<ColumnGroup />);

    assert.equal(instance.className, 'rs-table-column-group');
  });

  it('Should output a header', () => {
    const instance = getDOMNode(<ColumnGroup header={'header'} />);
    assert.equal(instance.innerText, 'header');
  });

  it('Should render 2 cells', () => {
    const instance = getDOMNode(
      <ColumnGroup>
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.querySelectorAll('.rs-table-column-group-cell-content').length, 2);
  });

  it('Should set height 10 for header', () => {
    const instance = getDOMNode(
      <ColumnGroup headerHeight={20} header={'header'}>
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.querySelector('.rs-table-column-group-header').style.height, '10px');
    assert.equal(instance.querySelector('.rs-table-column-group-cell').style.height, '10px');
  });

  it('Should be centered vertically', () => {
    const instance = getDOMNode(
      <ColumnGroup header={'header'} verticalAlign="middle">
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(
      instance.querySelector('.rs-table-column-group-header-content').style.verticalAlign,
      'middle'
    );
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(
      <ColumnGroup classPrefix="my">
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.className, 'my');
    assert.ok(instance.querySelector('.my-header'));
  });
});
