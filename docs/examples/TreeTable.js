import React from 'react';
import { Table, Column, Cell, HeaderCell } from '../../src';
import fakeData from '../data/treeData';


export const StatesCell = ({ rowData, dataKey, ...props }) => {
  let clesses = 'icon icon-big ' + (rowData[dataKey] === 'ENABLED' ? 'icon-ok-circle green' : 'icon-info2 gray');
  return (
    <Cell {...props}>
      <i className={clesses}></i>
    </Cell>
  );
};

const TreeTable = React.createClass({
  getInitialState() {
    return {
      data: fakeData
    };
  },
  render() {
    const { data } = this.state;
    return (
      <div>
        <Table height={400} data={data} isTree expand>

          <Column width={300} >
            <HeaderCell>Label</HeaderCell>
            <Cell dataKey="labelName" />
          </Column>

          <Column width={100} >
            <HeaderCell>States</HeaderCell>
            <StatesCell dataKey="status" />
          </Column>

          <Column width={100} >
            <HeaderCell>Count</HeaderCell>
            <Cell dataKey="count" />
          </Column>

        </Table>
      </div>
    );
  }
});

export default TreeTable;
