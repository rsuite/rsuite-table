### 锁定列: 固定表头,固定前两列

<!--start-code-->
```js

class FixedColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData
    };
  }
  render() {

    return (
      <div>
        <Table
          height={400}
          data={this.state.data}
          onRowClick={(data) => {
            console.log(data);
          }}
        >
          <Column width={70} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={130} fixed>
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={130} >
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column width={200} >
            <HeaderCell>City</HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column width={200} >
            <HeaderCell>Street</HeaderCell>
            <Cell dataKey="street" />
          </Column>


          <Column width={200} >
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>

          <Column width={200} >
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>

          <Column width={200} >
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>

          <Column width={200} >
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>

          <Column width={200} >
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>

        </Table>
      </div>
    );
  }
}
ReactDOM.render(<FixedColumnTable />);
```
<!--end-code-->


> 表头是默认固定的，只需要配置需要固定的列, 在需要估计的列添加 `fixed` 属性

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
