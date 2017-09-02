import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import CellGroup from '../src/CellGroup';


describe('CellGroup', () => {

  it('Should output a cell group', () => {
    const Title = 'Title';
    const instance = ReactTestUtils.renderIntoDocument(
      <CellGroup>
        Title
      </CellGroup>
    );

    const instanceDom = findDOMNode(instance);

    assert.ok(instanceDom.className.match(/\brsuite-table-cell-group scroll\b/));
    assert.equal(instanceDom.style.transform, 'translate3d(0px, 0px, 0px)');
    assert.equal(instanceDom.innerText, Title);
  });

  it('Should be 100 the width', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <CellGroup width={100} />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.width, '100px');
  });

  it('Should be 100 the height', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <CellGroup height={100} />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should be 100 the left', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <CellGroup left={100} />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.transform, 'translate3d(100px, 0px, 0px)');
  });

  it('Should be fixed', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <CellGroup fixed />
    );
    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.className.match(/\bfixed\b/));
  });


  it('Should have a custom className', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <CellGroup className="custom" />
    );
    assert.ok(findDOMNode(instance).className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = ReactTestUtils.renderIntoDocument(
      <CellGroup style={{ fontSize }} />
    );
    assert.equal(findDOMNode(instance).style.fontSize, fontSize);
  });

});
