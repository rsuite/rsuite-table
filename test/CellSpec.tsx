import React from 'react';
import Cell from '../src/Cell';
import TableProvider from '../src/TableProvider';
import { render, screen, fireEvent } from '@testing-library/react';
import { testStandardProps } from './utils';

describe('Cell', () => {
  testStandardProps(<Cell />, {
    getStyleElement: view => view.container.firstChild.querySelector('.rs-cell-content')
  });
  it('Should output a cell', () => {
    render(<Cell>Cell</Cell>);

    expect(screen.getByRole('gridcell')).to.have.class('rs-cell');
    expect(screen.getByRole('gridcell')).to.style('height', '46px');
    expect(screen.getByRole('gridcell')).to.text('Cell');
  });

  it('Should The text be `right` aligned', () => {
    render(<Cell align="right" />);

    expect(screen.getByRole('gridcell').querySelector('.rs-cell-content')).to.have.style(
      'justify-content',
      'flex-end'
    );
  });

  it('Should have a children is `abc`', () => {
    render(<Cell rowData={{ name: 'abc' }} dataKey="name" />);

    expect(screen.getByRole('gridcell')).to.text('abc');
  });

  it('Should be 100 the width', () => {
    render(<Cell width={100} />);

    expect(screen.getByRole('gridcell').querySelector('.rs-cell-content')).to.style(
      'width',
      '100px'
    );
  });

  it('Should be 100 the height', () => {
    render(<Cell height={100} />);

    expect(screen.getByRole('gridcell')).to.style('height', '100px');
  });

  it('Should be 100 the left', () => {
    render(<Cell left={100} />);

    expect(screen.getByRole('gridcell')).to.style('left', '100px');
  });

  it('Should be 100 the height when set isHeaderCell', () => {
    render(<Cell headerHeight={100} height={20} isHeaderCell />);

    expect(screen.getByRole('columnheader')).to.style('height', '100px');
  });

  it('Should hava a `first` className ', () => {
    render(<Cell firstColumn />);

    expect(screen.getByRole('gridcell')).to.have.class('rs-cell-first');
  });

  it('Should hava a `last` className ', () => {
    render(<Cell lastColumn />);

    expect(screen.getByRole('gridcell')).to.have.class('rs-cell-last');
  });

  it('Should call `renderCell`', () => {
    render(
      <Cell
        renderCell={cell => {
          return <div className="abc">{cell}</div>;
        }}
      >
        ABC
      </Cell>
    );

    expect(screen.getByRole('gridcell').querySelector('.abc')).to.text('ABC');
  });

  it('Should have a expand icon', () => {
    render(
      <div>
        <TableProvider isTree>
          <Cell hasChildren firstColumn rowData={{}} />
        </TableProvider>
      </div>
    );

    expect(screen.getByRole('gridcell').querySelector('.rs-cell-expand-icon')).to.be.exist;
  });

  it('Should have a expanded icon', () => {
    render(
      <div>
        <TableProvider isTree>
          <Cell hasChildren firstColumn expanded rowData={{}} />
        </TableProvider>
      </div>
    );

    expect(screen.getByRole('gridcell').querySelector('.rs-cell-expand-icon')).to.have.attribute(
      'data-expanded',
      'true'
    );
  });

  it('Should call onTreeToggle callback', done => {
    const doneOp = (rowKey, rowIndex, rowData, event) => {
      if (rowData[rowKey] === 'a' && rowIndex === 1 && event) {
        done();
      }
    };

    render(
      <div>
        <TableProvider isTree>
          <Cell
            hasChildren
            firstColumn
            onTreeToggle={doneOp}
            rowData={{ name: 'a' }}
            rowIndex={1}
            rowKey="name"
          />
        </TableProvider>
      </div>
    );

    fireEvent.click(
      screen.getByRole('gridcell').querySelector('.rs-cell-expand-icon') as HTMLButtonElement
    );
  });

  it('Should render custom children', () => {
    const { rerender } = render(<Cell rowData={{ id: 1 }}>{rowData => rowData.id}</Cell>);

    expect(screen.getByRole('gridcell')).to.text('1');

    rerender(<Cell>2</Cell>);

    expect(screen.getByRole('gridcell')).to.text('2');
  });

  it('Should render nested values', () => {
    const { rerender } = render(
      <Cell rowData={{ user: { name: 'foobar' } }} dataKey="user.name" />
    );

    expect(screen.getByRole('gridcell')).to.text('foobar');

    rerender(<Cell rowData={{ user: { name: ['foo', 'bar'] } }} dataKey="user.name.1" />);

    expect(screen.getByRole('gridcell')).to.text('bar');
  });

  it('Should show full text', () => {
    render(<Cell rowData={{ name: 'foobar' }} dataKey="name" fullText width={100} />);

    expect(screen.getByRole('gridcell')).to.have.class('rs-cell-full-text');
    expect(screen.getByRole('gridcell')).to.style('min-width', '100px');
    expect(screen.getByRole('gridcell').style.width).to.equal('');
    expect(screen.getByRole('gridcell').querySelector('.rs-cell-content')).to.style(
      'width',
      '99px'
    );
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
