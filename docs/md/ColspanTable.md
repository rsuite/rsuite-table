### Colspan Cell

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
          data={this.state.data}
          onRowClick={data => {
            console.log(data);
          }}
        >
          <Column width={70} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={130} fixed colSpan={2} resizable>
            <HeaderCell>Name</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={130} fixed resizable>
            <HeaderCell />
            <Cell dataKey="lastName" />
          </Column>

          <Column width={200} resizable colSpan={2}>
            <HeaderCell>Address</HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column width={200} resizable>
            <HeaderCell />
            <Cell dataKey="street" />
          </Column>

          <Column width={200}>
            <HeaderCell>Company Name</HeaderCell>
            <Cell dataKey="companyName" />
          </Column>

          <Column width={200}>
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
