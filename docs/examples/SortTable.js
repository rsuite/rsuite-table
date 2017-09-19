import React from 'react';
import { Table, Column, Cell, HeaderCell } from '../../src';
import fakeData from '../data/users';

class SortTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addColumn: false,
      data: fakeData
    };
    this.handleSortColumn = this.handleSortColumn.bind(this);
  }

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
  }

  handleSortColumn(sortColumn, sortType) {
    this.setState({
      loading: true
    });

    setTimeout(() => {
      console.log(sortColumn);
      this.setState({
        sortColumn,
        sortType,
        loading: false
      });
    }, 500);
  }
  renderColumns() {
    return [
      <Column width={130} sortable key="words">
        <HeaderCell>Words</HeaderCell>
        <Cell dataKey="words" />
      </Column>,
      <Column width={130} sortable key="zipCode">
        <HeaderCell>ZipCode</HeaderCell>
        <Cell dataKey="zipCode" />
      </Column>
    ];
  }
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

          {this.state.addColumn ? this.renderColumns() : null}

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
        <button
          onClick={() => {
            this.setState({
              addColumn: true
            });
          }}
        >
          Add Column
        </button>
      </div>
    );
  }

}

export default SortTable;
