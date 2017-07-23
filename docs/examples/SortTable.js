import React from 'react';
import { Table, Column, Cell, HeaderCell } from '../../src';
import fakeData from '../data/users';


const FixedColumnTable = React.createClass({
  getInitialState() {
    return {
      data: fakeData
    };
  },
  handleSortColumn(sortColumn, sortType) {
    this.setState({
      loading: true
    });

    setTimeout(() => {
      this.setState({
        sortColumn,
        sortType,
        loading: false
      });
    }, 500);
  },
  getData() {
    const { data, sortColumn, sortType } = this.state;

    if (sortColumn && sortType) {
      return data.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === 'string') {
          x = x.charCodeAt();
        }
        if (typeof y === 'string') {
          y = y.charCodeAt();
        }
        if (sortType === 'asc') {
          return x - y;
        } else {
          return y - x;
        }
      });
    }
    return data;
  },
  render() {

    return (
      <div>
        <Table
          height={400}
          data={this.getData()}
          sortColumn={this.state.sortColumn}
          sortType={this.state.sortType}
          onSortColumn={this.handleSortColumn}
          loading={this.state.loading}
          onRowClick={(data) => {
            console.log(data);
          }}
        >

          <Column width={70} align="center" fixed sortable>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={130} fixed sortable>
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={130} sortable>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column width={200} sortable>
            <HeaderCell>City</HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column width={200} sortable>
            <HeaderCell>Street</HeaderCell>
            <Cell dataKey="street" />
          </Column>


          <Column width={200} sortable>
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>

          <Column width={200} >
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>


        </Table>
      </div>
    );
  }
});

export default FixedColumnTable;
