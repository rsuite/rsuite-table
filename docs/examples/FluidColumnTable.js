import React from 'react';
import { Table, Column, Cell, HeaderCell } from '../../src';
import fakeData from '../data/users';

class FluidColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData
    };
  }

  render() {
    const { data } = this.state;
    return (
      <div>
        <Table
          height={400}
          data={data}
          onSortColumn={(sortColumn, sortType) => {
            console.log(sortColumn, sortType);
          }}
        >

          <Column width={50} align="center" fixed >
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={100} fixed >
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={100} resizable sortable>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column flexGrow={1} sortable >
            <HeaderCell>City <code>flexGrow={1}</code></HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column flexGrow={2} sortable>
            <HeaderCell>Company Name <code>flexGrow={2}</code></HeaderCell>
            <Cell dataKey="companyName" />
          </Column>

        </Table>
      </div>
    );
  }

}

export default FluidColumnTable;
