import React from 'react';
import { Table, Column, Cell, HeaderCell } from '../../src';
import fakeData from '../data/users';

const ResizableColumnTable = React.createClass({
  getInitialState() {
    return {
      data: fakeData
    };
  },
  render() {
    const { data } = this.state;
    return (
      <div>
        <Table height={400} data={data} >

          <Column width={50} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={100} fixed >
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={100} resizable>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>City <code>flexGrow={1}</code></HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column flexGrow={2}>
            <HeaderCell>Company Name <code>flexGrow={2}</code></HeaderCell>
            <Cell dataKey="companyName" />
          </Column>

        </Table>
      </div>
    );
  }
});

export default ResizableColumnTable;
