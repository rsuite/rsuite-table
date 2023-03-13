import React from 'react';
import { expectType } from 'ts-expect';
import Table from '../src/Table';

type Row = {
  id: number;
  name: string;
};

const data: Row[] = [
  {
    id: 1,
    name: 'First'
  },
  {
    id: 2,
    name: 'Second'
  }
];

<Table
  data={data}
  rowHeight={row => {
    expectType<Row | undefined>(row);

    return 44;
  }}
  rowClassName={row => {
    expectType<Row>(row);

    return '';
  }}
  renderTreeToggle={(button, row) => {
    expectType<Row | undefined>(row);

    return null;
  }}
  renderRowExpanded={row => {
    expectType<Row | undefined>(row);

    return null;
  }}
  renderRow={(node, row) => {
    expectType<Row | undefined>(row);

    return null;
  }}
  onRowClick={row => {
    expectType<Row>(row);
  }}
  onRowContextMenu={row => {
    expectType<Row>(row);
  }}
  onExpandChange={(expanded, row) => {
    expectType<Row>(row);
  }}
/>;
