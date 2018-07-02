### 树形表格

<!--start-code-->

```js
class TreeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeTreeData
    };
  }
  render() {
    const { data } = this.state;
    return (
      <div>
        <Table
          autoHeight
          isTree
          defaultExpandAllRows
          minHeight={260}
          height={400}
          data={data}
          onExpandChange={(isOpen, rowData) => {
            console.log(isOpen, rowData);
          }}
          renderTreeToggle={(icon, rowData) => {
            if (rowData.labelName === '手机') {
              return <i className="icon icon-spin icon-spinner" />;
            }
            return icon;
          }}
        >
          <Column flexGrow={1}>
            <HeaderCell>Label</HeaderCell>
            <Cell dataKey="labelName" />
          </Column>

          <Column width={100}>
            <HeaderCell>Status</HeaderCell>
            <Cell dataKey="status" />
          </Column>

          <Column width={100}>
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
