### Column Group

<!--start-code-->

```js
class FixedColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeDataForColSpan
    };
  }
  render() {
    return (
      <div>
        <Table
          bordered
          height={400}
          headerHeight={80}
          data={this.state.data}
          onRowClick={data => {
            console.log(data);
          }}
        >
          <Column width={70} fixed align="center" verticalAlign="middle">
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <ColumnGroup header={'Basic Info'} fixed align="center" verticalAlign="middle">
            <Column width={120} resizable>
              <HeaderCell>firstName</HeaderCell>
              <Cell dataKey="firstName" />
            </Column>

            <Column width={120} resizable>
              <HeaderCell>lastName</HeaderCell>
              <Cell dataKey="lastName" />
            </Column>

            <Column width={200} resizable>
              <HeaderCell>Email</HeaderCell>
              <Cell dataKey="email" />
            </Column>
          </ColumnGroup>
          <Column width={200} verticalAlign="middle">
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>

          <Column width={200} verticalAlign="middle">
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>
          <Column width={200} verticalAlign="middle">
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>

          <Column width={100} resizable colSpan={2} verticalAlign="middle">
            <HeaderCell>City</HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column width={100} resizable>
            <HeaderCell>Street</HeaderCell>
            <Cell dataKey="street" />
          </Column>
        </Table>
      </div>
    );
  }
}

ReactDOM.render(<FixedColumnTable />);
```

<!--end-code-->

In some cases, you need to merge the relationships between columns to organize your data, and you can set a ColSpan attribute on the `<Column>` component, for example:

```html
<Column width="{130}" colSpan="{2}">
  <HeaderCell>Name</HeaderCell>
  <Cell dataKey="firstName" />
</Column>

<Column width="{130}">
  <HeaderCell />
  <Cell dataKey="lastName" />
</Column>
```
