import React from 'react';
import { Table, Column, Cell, HeaderCell, TablePagination } from '../../src';
import fakeData from '../data/users';

const DateCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    {rowData[dataKey].toLocaleString()}
  </Cell>
);

function formatLengthMenu(lengthMenu) {
  return (
    <div className="table-length">
      <span> 每页 </span>
      {lengthMenu}
      <span> 条 </span>
    </div>
  );
}

function formatInfo(total, activePage) {
  return (
    <span>共 <i>{total}</i> 条数据</span>
  );
}

const PaginationTable = React.createClass({
  getInitialState() {
    return {
      displayLength: 100,
      data: fakeData
    };
  },
  handleChangePage(dataKey) {
    const { displayLength } = this.state;
    this.setState({
      data: fakeData
    });
  },
  handleChangeLength(dataKey) {
    this.setState({
      displayLength: dataKey,
      data: fakeData
    });
  },
  render() {
    const { data } = this.state;
    return (
      <div>
        <Table height={400} data={data} resizable>

          <Column width={50} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={100} fixed resizable >
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={100} resizable>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column width={200} resizable>
            <HeaderCell>City</HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column width={200} resizable>
            <HeaderCell>Street</HeaderCell>
            <Cell dataKey="street" />
          </Column>


          <Column width={200} resizable>
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>

          <Column width={200} resizable>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>

          <Column width={200} align="right" resizable>
            <HeaderCell>Date</HeaderCell>
            <DateCell dataKey="date" />
          </Column>

        </Table>

        <TablePagination
          formatLengthMenu={formatLengthMenu}
          formatInfo={formatInfo}
          displayLength={100}
          total={500}
          onChangePage={this.handleChangePage}
          onChangeLength={this.handleChangeLength}
        />
      </div>
    );
  }
});

export default PaginationTable;
