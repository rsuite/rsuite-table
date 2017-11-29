
### 树形表格

<!--start-code-->
```js


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
          <h5>只操作部分节点 (2系)</h5>
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

ReactDOM.render(<TreeTable />);

```
<!--end-code-->


> 树型表格，主要为了展示有结构关系的数据，需要在 `Table` 组件上设置一个 `isTree` 属性，同时 `data` 中的数据需要通过 `children` 来定义关系结构。

```html
 <Table  height={400} data={data} isTree expand>
 ...
 ```
这里 `expand` 是设置默认站所有节点

`data` 中的数据结构：

```js
[{
    labelName: '汽车',
    status: 'ENABLED',
    children: [
        {
            labelName: '梅赛德斯-奔驰',
            status: 'ENABLED',
            count: 460
        }
        ...
    ]
    ...
}]
```



