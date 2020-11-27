import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';

import { getDOMNode } from './TestWrapper';
import Cell from '../src/Cell';
import TableContext from '../src/TableContext';
import { LAYER_WIDTH } from '../src/constants';

describe('Cell', () => {
  it('Should output a cell', () => {
    const Title = 'Title';
    const instanceDom = getDOMNode(<Cell>Title</Cell>);

    assert.equal(instanceDom.className, 'rs-table-cell');
    assert.equal(instanceDom.style.height, '36px');
    assert.equal(instanceDom.innerText, Title);
  });

  it('Should The text be `right` aligned', () => {
    const instanceDom = getDOMNode(<Cell align="right" />).querySelector('.rs-table-cell-content');
    assert.equal(instanceDom.style.textAlign, 'right');
  });

  it('Should The text be `middle` aligned', () => {
    const instanceDom = getDOMNode(<Cell verticalAlign="middle" />).querySelector(
      '.rs-table-cell-content'
    );

    assert.equal(instanceDom.style.display, 'table-cell');
    assert.equal(instanceDom.style.verticalAlign, 'middle');
  });

  it('Should have a children is `abc`', () => {
    const instanceDom = getDOMNode(<Cell rowData={{ name: 'abc' }} dataKey="name" />);

    assert.equal(instanceDom.innerText, 'abc');
  });

  it('Should be 100 the width', () => {
    const instanceDom = getDOMNode(<Cell width={100} />).querySelector('.rs-table-cell-content');
    assert.equal(instanceDom.style.width, '100px');
  });

  it('Should be 100 the height', () => {
    const instanceDom = getDOMNode(<Cell height={100} />);

    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should be 100 the left', () => {
    const instanceDom = getDOMNode(<Cell left={100} />);

    assert.equal(instanceDom.style.left, '100px');
  });

  it('Should be 100 the height when set isHeaderCell', () => {
    const instanceDom = getDOMNode(<Cell headerHeight={100} height={20} isHeaderCell />);

    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should hava a `first` className ', () => {
    const instanceDom = getDOMNode(<Cell firstColumn />);

    assert.ok(instanceDom.className.match(/\bfirst\b/));
  });

  it('Should hava a `last` className ', () => {
    const instanceDom = getDOMNode(<Cell lastColumn />);

    assert.ok(instanceDom.className.match(/\blast\b/));
  });

  it('Should call `renderCell`', () => {
    const instanceDom = getDOMNode(
      <Cell
        renderCell={cell => {
          return <div className="abc">{cell}</div>;
        }}
      >
        ABC
      </Cell>
    );

    assert.equal(instanceDom.querySelector('.abc').innerText, 'ABC');
  });

  it('Should have a expand icon', () => {
    const instanceDom = getDOMNode(
      <div>
        <TableContext.Provider value={{ isTree: true }}>
          <Cell hasChildren firstColumn />
        </TableContext.Provider>
      </div>
    );

    console.log(instanceDom);
    assert.ok(instanceDom.querySelector('.rs-table-cell-expand-icon'));
  });

  it('Should be 60 the left', () => {
    const layer = 2;
    const instanceDom = getDOMNode(<Cell layer={layer} firstColumn />);

    assert.ok(instanceDom.style.left, LAYER_WIDTH * layer);
  });

  it('Should call onTreeToggle callback', done => {
    const doneOp = (rowKey, rowIndex, rowData, event) => {
      if (rowData[rowKey] === 'a' && rowIndex === 1 && event) {
        done();
      }
    };

    const instanceDom = getDOMNode(
      <div>
        <TableContext.Provider value={{ isTree: true }}>
          <Cell
            hasChildren
            firstColumn
            onTreeToggle={doneOp}
            rowData={{ name: 'a' }}
            rowIndex={1}
            rowKey="name"
          />
        </TableContext.Provider>
      </div>
    );

    ReactTestUtils.Simulate.click(instanceDom.querySelector('.rs-table-cell-expand-icon'));
  });

  it('Should have a custom className', () => {
    const instanceDom = getDOMNode(<Cell className="custom" />);
    assert.ok(instanceDom.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instanceDom = getDOMNode(<Cell style={{ fontSize }} />).querySelector(
      '.rs-table-cell-content'
    );
    assert.equal(instanceDom.style.fontSize, fontSize);
  });

  it('Should render custom children', () => {
    const instanceDom1 = getDOMNode(<Cell rowData={{ id: 1 }}>{rowData => rowData.id}</Cell>);
    const instanceDom2 = getDOMNode(<Cell>1</Cell>);
    assert.ok(instanceDom1.innerText, 1);
    assert.ok(instanceDom2.innerText, 1);
  });
});
