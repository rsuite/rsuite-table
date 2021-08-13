import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { getDOMNode } from './utils';
import Cell from '../src/Cell';
import TableContext from '../src/TableContext';
import { LAYER_WIDTH } from '../src/constants';

describe('Cell', () => {
  it('Should output a cell', () => {
    const Title = 'Title';
    const instance = getDOMNode(<Cell>Title</Cell>);

    assert.equal(instance.className, 'rs-cell');
    assert.equal(instance.style.height, '36px');
    assert.equal(instance.innerText, Title);
  });

  it('Should The text be `right` aligned', () => {
    const instance = getDOMNode(<Cell align="right" />).querySelector('.rs-cell-content');
    assert.equal(instance.style.textAlign, 'right');
  });

  it('Should The text be `middle` aligned', () => {
    const instance = getDOMNode(<Cell verticalAlign="middle" />).querySelector('.rs-cell-content');

    assert.equal(instance.style.display, 'table-cell');
    assert.equal(instance.style.verticalAlign, 'middle');
  });

  it('Should have a children is `abc`', () => {
    const instance = getDOMNode(<Cell rowData={{ name: 'abc' }} dataKey="name" />);

    assert.equal(instance.innerText, 'abc');
  });

  it('Should be 100 the width', () => {
    const instance = getDOMNode(<Cell width={100} />).querySelector('.rs-cell-content');
    assert.equal(instance.style.width, '100px');
  });

  it('Should be 100 the height', () => {
    const instance = getDOMNode(<Cell height={100} />);

    assert.equal(instance.style.height, '100px');
  });

  it('Should be 100 the left', () => {
    const instance = getDOMNode(<Cell left={100} />);

    assert.equal(instance.style.left, '100px');
  });

  it('Should be 100 the height when set isHeaderCell', () => {
    const instance = getDOMNode(<Cell headerHeight={100} height={20} isHeaderCell />);

    assert.equal(instance.style.height, '100px');
  });

  it('Should hava a `first` className ', () => {
    const instance = getDOMNode(<Cell firstColumn />);

    assert.ok(instance.className.match(/\bfirst\b/));
  });

  it('Should hava a `last` className ', () => {
    const instance = getDOMNode(<Cell lastColumn />);

    assert.ok(instance.className.match(/\blast\b/));
  });

  it('Should call `renderCell`', () => {
    const instance = getDOMNode(
      <Cell
        renderCell={cell => {
          return <div className="abc">{cell}</div>;
        }}
      >
        ABC
      </Cell>
    );

    assert.equal(instance.querySelector('.abc').innerText, 'ABC');
  });

  it('Should have a expand icon', () => {
    const instance = getDOMNode(
      <div>
        <TableContext.Provider value={{ isTree: true }}>
          <Cell hasChildren firstColumn />
        </TableContext.Provider>
      </div>
    );
    assert.ok(instance.querySelector('.rs-cell-expand-icon'));
  });

  it('Should have a expanded icon', () => {
    const instance = getDOMNode(
      <div>
        <TableContext.Provider value={{ isTree: true }}>
          <Cell hasChildren firstColumn expanded />
        </TableContext.Provider>
      </div>
    );
    assert.ok(instance.querySelector('[aria-label="arrow down"]'));
  });

  it('Should be 60 the left', () => {
    const layer = 2;
    const instance = getDOMNode(<Cell layer={layer} firstColumn />);

    assert.ok(instance.style.left, LAYER_WIDTH * layer);
  });

  it('Should call onTreeToggle callback', done => {
    const doneOp = (rowKey, rowIndex, rowData, event) => {
      if (rowData[rowKey] === 'a' && rowIndex === 1 && event) {
        done();
      }
    };

    const instance = getDOMNode(
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

    ReactTestUtils.Simulate.click(instance.querySelector('.rs-cell-expand-icon'));
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<Cell className="custom" />);
    assert.ok(instance.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const instance = getDOMNode(<Cell style={{ fontSize: 14, padding: 20 }} />);
    assert.equal(instance.querySelector('.rs-cell-content').style.fontSize, '14px');
    assert.equal(instance.querySelector('.rs-cell-content').style.padding, '20px');
  });

  it('Should render custom children', () => {
    const instance1 = getDOMNode(<Cell rowData={{ id: 1 }}>{rowData => rowData.id}</Cell>);
    const instance2 = getDOMNode(<Cell>1</Cell>);
    assert.ok(instance1.innerText, 1);
    assert.ok(instance2.innerText, 1);
  });
});
