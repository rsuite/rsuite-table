import React from 'react';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import { render, screen } from '@testing-library/react';

describe('VirtualizedTable', () => {
  it('Should be virtualized, and check `maximum update depth exceeded`', () => {
    expect(() => {
      render(
        <Table virtualized data={[{ id: 1 }]}>
          <Column>
            <HeaderCell>ID</HeaderCell>
            <Cell dataKey="id" />
          </Column>
        </Table>
      );
    }).to.not.throw();
  });

  // issue: https://github.com/rsuite/rsuite/issues/3226
  it('Should render correct row height when virtualized', () => {
    render(
      <Table virtualized data={[{ id: 1 }]} rowHeight={50} headerHeight={60}>
        <Column>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="id" />
        </Column>
      </Table>
    );

    expect(screen.getAllByRole('row')[0]).to.have.style('height', '60px');
    expect(screen.getAllByRole('row')[1]).to.have.style('height', '50px');
    expect(screen.getByRole('columnheader')).to.have.style('height', '60px');
    expect(screen.getByRole('gridcell')).to.have.style('height', '50px');
  });
});
