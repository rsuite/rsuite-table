import React from 'react';

import { getDOMNode } from './utils';
import ColumnGroup from '../src/ColumnGroup';

const Item = ({ className, style, children, headerHeight }) => (
  <div className={className} style={{ height: headerHeight, ...style }}>
    {children}
  </div>
);

describe('ColumnGroup', () => {
  it('Should output a ColumnGroup', () => {
    const instance = getDOMNode(<ColumnGroup />);

    assert.equal(instance.className, 'rs-column-group');
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

    assert.equal(instance.querySelectorAll('.rs-column-group-cell-content').length, 2);
  });

  it('Should set height 10 for header', () => {
    const instance = getDOMNode(
      <ColumnGroup headerHeight={20} header={'header'}>
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.querySelector('.rs-column-group-header').style.height, '10px');
    assert.equal(instance.querySelector('.rs-column-group-header-content').style.height, '10px');
    assert.equal(instance.querySelector('.rs-column-group-cell').style.height, '10px');
  });

  it('Should render height via groupHeaderHeight', () => {
    const instance = getDOMNode(
      <ColumnGroup headerHeight={20} groupHeaderHeight={5} header={'header'}>
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.querySelector('.rs-column-group-header').style.height, '5px');
    assert.equal(instance.querySelector('.rs-column-group-header-content').style.height, '5px');
    assert.equal(instance.querySelector('.rs-column-group-cell').style.height, '15px');
  });

  it('Should be centered vertically', () => {
    const instance = getDOMNode(
      <ColumnGroup header={'header'} verticalAlign="middle">
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(
      instance.querySelector('.rs-column-group-header-content').style.verticalAlign,
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

    assert.equal(instance.className, 'rs-my');
    assert.ok(instance.querySelector('.rs-my-header'));
  });
});
