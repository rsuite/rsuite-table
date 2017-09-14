import React from 'react';
import { Toggle } from 'rsuite';
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

class TreeTable extends React.Component {
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
        <div className="btn-toolbar">
          <h5>全部节点</h5>
          <Toggle
            defaultChecked
            checkedChildren="展开"
            unCheckedChildren="收起"
            onChange={(open) => {
              this.table.treeToggle(open);
            }}
          />
          <h5>只操作部分节点</h5>
          <Toggle
            defaultChecked
            checkedChildren="展开"
            unCheckedChildren="收起"
            onChange={(open) => {
              this.table.treeToggleBy(open, rowData => rowData.labelName === '2系');
            }}
          />

        </div>
        <Table
          height={400}
          data={data}
          isTree
          expand
          ref={(ref) => {
            this.table = ref;
          }}
          onTreeToggle={(isOpen, rowData) => {
            console.log(isOpen, rowData);
          }}
          renderTreeToggle={(icon, rowData) => {
            if (rowData.labelName === '手机') {
              return (<i className="icon icon-spin icon-spinner" />);
            }
            return icon;
          }}
        >
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
}

export default TreeTable;
