import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Row from '../src/Row';


describe('Row', () => {

  it('Should output a row', () => {
    const Title = 'Title';
    const instance = ReactTestUtils.renderIntoDocument(
      <Row>
        Title
      </Row>
    );

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.className, 'rsuite-table-row');
    assert.equal(instanceDom.style.height, '36px');
    assert.equal(instanceDom.innerText, Title);
  });

  it('Should have a min width', () => {
    const Title = 'Title';
    const instance = ReactTestUtils.renderIntoDocument(
      <Row width={100}>
        Title
      </Row>
    );

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.minWidth, '100px');
  });

  it('Should have a height', () => {
    const Title = 'Title';
    const instance = ReactTestUtils.renderIntoDocument(
      <Row height={100} />
    );

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should have a height when set isHeaderRow', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Row headerHeight={100} isHeaderRow />
    );

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should have a top', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Row top={100}  />
    );

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.transform, 'translate3d(0px, 100px, 0px)');
  });


  it('Should have a custom className', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Row className="custom" />
    );
    assert.ok(findDOMNode(instance).className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = ReactTestUtils.renderIntoDocument(
      <Row style={{ fontSize }} />
    );
    assert.equal(findDOMNode(instance).style.fontSize, fontSize);
  });

});
