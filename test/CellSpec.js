import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Cell from '../src/Cell';
import { LAYER_WIDTH } from '../src/constants';


describe('Cell', () => {

  it('Should output a cell', () => {
    const Title = 'Title';
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell>
        Title
      </Cell>
    );

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.className, 'rsuite-table-cell');
    assert.equal(instanceDom.style.height, '36px');
    assert.equal(instanceDom.innerText, Title);
  });

  it('Should The text be `right` aligned', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell align="right" />
    );

    const instanceDom = findDOMNode(instance).querySelector('.rsuite-table-cell-content');
    assert.equal(instanceDom.style.textAlign, 'right');
  });

  it('Should have a children is `abc`', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell rowData={{ name: 'abc' }} dataKey="name" />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.innerText, 'abc');
  });

  it('Should be 100 the width', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell width={100} />
    );
    const instanceDom = findDOMNode(instance).querySelector('.rsuite-table-cell-content');
    assert.equal(instanceDom.style.width, '100px');
  });

  it('Should be 100 the height', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell height={100} />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should be 100 the left', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell left={100} />
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.left, '100px');
  });

  it('Should be 100 the height when set isHeaderCell', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell headerHeight={100} height={20} isHeaderCell />
    );

    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should hava a `first` className ', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell firstColumn />
    );
    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.className.match(/\bfirst\b/));
  });

  it('Should hava a `last` className ', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell lastColumn />
    );
    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.className.match(/\blast\b/));
  });

  it('Should be sortable', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell sortable isHeaderCell />
    );
    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.className.match(/\bsortable\b/));
  });

  it('Should call `cellRenderer`', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell cellRenderer={(cell) => {
        return <div className="abc">{cell}</div>;
      }}
      >
        ABC
      </Cell>
    );
    const instanceDom = findDOMNode(instance);
    assert.equal(instanceDom.querySelector('.abc').innerText, 'ABC');
  });

  it('Should have a expand icon', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell hasChildren firstColumn />
    );
    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.querySelector('i.expand-icon'));
  });

  it('Should be 60 the left', () => {
    const layer = 2;
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell layer={layer} firstColumn />
    );
    const instanceDom = findDOMNode(instance);
    assert.ok(instanceDom.style.left, LAYER_WIDTH * layer);
  });

  it('Should call onTreeToggle callback', (done) => {
    const doneOp = (rowKey, rowIndex, rowData, event) => {
      if (rowData[rowKey] === 'a' && rowIndex === 1 && event) {
        done();
      }
    };

    const instance = ReactTestUtils.renderIntoDocument(
      <Cell
        hasChildren
        firstColumn
        onTreeToggle={doneOp}
        rowData={{ name: 'a' }}
        rowIndex={1}
        rowKey="name"
      />
    );
    const instanceDom = findDOMNode(instance);
    ReactTestUtils.Simulate.click(instanceDom.querySelector('.expand-icon'));
  });

  it('Should have a custom className', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell className="custom" />
    );
    assert.ok(findDOMNode(instance).className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = ReactTestUtils.renderIntoDocument(
      <Cell style={{ fontSize }} />
    );
    assert.equal(findDOMNode(instance).style.fontSize, fontSize);
  });

});
