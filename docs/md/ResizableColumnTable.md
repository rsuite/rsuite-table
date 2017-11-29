### 自定义调整列宽

<!--start-code-->
```js

class ResizableColumnTable extends React.Component {
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
          bordered
          height={400}
          data={data}
        >

          <Column width={50} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={100} fixed resizable>
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

        </Table>
      </div>
    );
  }
}

ReactDOM.render(<ResizableColumnTable />);

```
<!--end-code-->


> 把鼠标移动到列分割线的时候，会显示出一个蓝色的移动手柄，点击不松开并左右拖动就可以调整列的宽度，要支持该功能，需要在 `Column` 设置一个 `resizable` 属性。

```html
<Column width={50}  align="center"  fixed>
    <HeaderCell>Id</HeaderCell>
    <Cell dataKey="id" />
</Column>

<Column width={130} fixed  sortable>
    <HeaderCell>First Name</HeaderCell>
    <Cell dataKey="firstName" />
</Column>

...
```
