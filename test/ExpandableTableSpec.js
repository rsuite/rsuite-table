import React from 'react';
import { render, screen } from '@testing-library/react';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';

describe('ExpandableTable', () => {
  it('Should be to avoid nested classPrefix', () => {
    const data = [{ id: 1, name: 'foobar' }];
    const innerTable = React.createRef();

    render(
      <Table
        data={data}
        rowKey="id"
        expandedRowKeys={[1]}
        renderRowExpanded={() => {
          return (
            <Table data={data} ref={innerTable}>
              <Column width={130}>
                <HeaderCell>inner name</HeaderCell>
                <Cell dataKey="name" />
              </Column>
            </Table>
          );
        }}
      >
        <Column width={130}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    expect(innerTable.current.root).to.have.class('rs-table');
    expect(innerTable.current.root).to.have.class('rs-table-hover');
  });

  it('Should set the height of rows and cells separately', () => {
    const data = [{ id: 1, name: 'foobar' }];

    render(
      <Table
        data={data}
        rowKey="id"
        showHeader={false}
        expandedRowKeys={[1]}
        rowExpandedHeight={200}
        renderRowExpanded={() => {
          return <div>content</div>;
        }}
      >
        <Column width={130}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
      </Table>
    );

    expect(screen.getByRole('row')).to.have.style('height', '246px');
    expect(screen.getByRole('gridcell', { name: 'foobar' })).to.have.style('height', '46px');
    expect(screen.getByRole('gridcell', { name: 'foobar' }).childNodes[0]).to.have.style(
      'height',
      '46px'
    );
  });
});
