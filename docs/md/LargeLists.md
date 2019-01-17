### 长表格

<!--start-code-->

```js
class LargeListsTable extends React.Component {
  render() {
    return (
      <div>
        <Table
          vitrualized
          height={400}
          data={fakeLargeData}
          onRowClick={data => {
            console.log(data);
          }}
        >
          <Column width={70} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={130}>
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={130}>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column width={200}>
            <HeaderCell>City</HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column width={200}>
            <HeaderCell>Street</HeaderCell>
            <Cell dataKey="street" />
          </Column>

          <Column minWidth={200} flexGrow={1}>
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>
        </Table>
      </div>
    );
  }
}
ReactDOM.render(<LargeListsTable />);
```

<!--end-code-->

> Table 支持大数据显示， 只需在 <Table> 上设置 `vitrualized` 属性。
