import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import { getDOMNode } from './utils';
import Cell from '../src/Cell';
import TableContext from '../src/TableContext';
import { LAYER_WIDTH } from '../src/constants';

describe('Cell', () => {
  it('Should output a cell', () => {
    const Title = 'Title';
    const instance = getDOMNode(<Cell>Title</Cell>);

    assert.equal(instance.className, 'rs-cell');
    assert.equal(instance.style.height, '46px');
    assert.equal(instance.innerText, Title);
  });

  it('Should The text be `right` aligned', () => {
    const instance = getDOMNode(<Cell align="right" />).querySelector('.rs-cell-content');

    expect(instance).to.have.style('justify-content', 'flex-end');
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
          <Cell hasChildren firstColumn rowData={{}} />
        </TableContext.Provider>
      </div>
    );
    assert.ok(instance.querySelector('.rs-cell-expand-icon'));
  });

  it('Should have a expanded icon', () => {
    render(
      <div>
        <TableContext.Provider value={{ isTree: true }}>
          <Cell hasChildren firstColumn expanded rowData={{}} />
        </TableContext.Provider>
      </div>
    );

    expect(screen.getByRole('gridcell').querySelector('.rs-cell-expand-icon')).to.have.attribute(
      'data-expanded',
      'true'
    );
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

  it('Should render nested values', () => {
    const instance = getDOMNode(
      <Cell rowData={{ user: { name: 'foobar' } }} dataKey="user.name" />
    );

    const instance2 = getDOMNode(
      <Cell rowData={{ user: { name: ['foo', 'bar'] } }} dataKey="user.name.1" />
    );

    assert.equal(instance.innerText, 'foobar');
    assert.equal(instance2.innerText, 'bar');
  });

  it('Should show full text', () => {
    const instance = getDOMNode(
      <Cell rowData={{ name: 'foobar' }} dataKey="name" fullText width={100} />
    );

    expect(instance).to.have.class('rs-cell-full-text');
    expect(instance).to.style('min-width', '100px');
    expect(instance.style.width).to.equal('');
    expect(instance.querySelector('.rs-cell-content')).to.style('width', '99px');
  });

  it('Should align vertically using verticalAlign', () => {
    render(
      <>
        <Cell verticalAlign="middle" data-testid="middle" />
        <Cell verticalAlign="top" data-testid="top" />
        <Cell verticalAlign="bottom" data-testid="bottom" />
      </>
    );

    expect(screen.getByTestId('middle').childNodes[0]).to.have.style('align-items', 'center');
    expect(screen.getByTestId('middle').childNodes[0]).to.have.style('display', 'flex');

    expect(screen.getByTestId('top').childNodes[0]).to.have.style('align-items', 'flex-start');
    expect(screen.getByTestId('top').childNodes[0]).to.have.style('display', 'flex');

    expect(screen.getByTestId('bottom').childNodes[0]).to.have.style('align-items', 'flex-end');
    expect(screen.getByTestId('bottom').childNodes[0]).to.have.style('display', 'flex');
  });
});
