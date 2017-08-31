import React from 'react';
import { Table, Column, Cell, HeaderCell } from '../../src';
import fakeData from '../data/users';
import { Popover, Whisper } from 'rsuite';


const DateCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    {rowData[dataKey].toLocaleString()}
  </Cell>
);

const NameCell = ({ rowData, dataKey, ...props }) => {
  const speaker = (
    <Popover title="Description">
      <p><b>Name:</b> {`${rowData.firstName} ${rowData.lastName}`} </p>
      <p><b>Email:</b> {rowData.email} </p>
      <p><b>Company:</b> {rowData.companyName} </p>
      <p><b>Sentence:</b> {rowData.sentence} </p>

    </Popover>
  );

  return (
    <Cell {...props}>
      <Whisper placement="top" speaker={speaker}>
        <a>{rowData[dataKey].toLocaleString()}</a>
      </Whisper>
    </Cell>
  );
};

const ImageCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    <img src={rowData[dataKey]} width="50" />
  </Cell>
);

const EmailCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    <a href={`mailto:${rowData[dataKey]}`}>{rowData[dataKey]}</a>
  </Cell>
);

const ActionCell = ({ rowData, dataKey, ...props }) => {
  function handleAction() {
    alert(`id:${rowData[dataKey]}`);
    console.log(rowData, dataKey);
  }


  return (
    <Cell {...props}>
      <a onClick={handleAction} > Edit </a>
      |
      <a onClick={handleAction}> Remove </a>
    </Cell>
  );
};

const CustomColumnTable = React.createClass({
  getInitialState() {
    return {
      data: fakeData
    };
  },
  render() {
    const { data } = this.state;
    return (
      <div>
        <Table
          height={400}
          data={data}
          rowHeight={64}
          headerHeight={50}
          onRerenderRowHeight={(rowData) => {
            if (rowData.firstName === 'Janis') {
              return 30;
            }
          }}
        >

          <Column width={160} sortable>
            <HeaderCell>First Name</HeaderCell>
            <NameCell dataKey="firstName" />
          </Column>

          <Column width={160} sortable>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column width={300} >
            <HeaderCell>Email</HeaderCell>
            <EmailCell dataKey="email" />
          </Column>

          <Column width={200} >
            <HeaderCell>Action</HeaderCell>
            <DateCell dataKey="date" />
          </Column>

          <Column width={200} >
            <HeaderCell>Action</HeaderCell>
            <ActionCell dataKey="id" />
          </Column>

        </Table>
      </div>
    );
  }
});

export default CustomColumnTable;
