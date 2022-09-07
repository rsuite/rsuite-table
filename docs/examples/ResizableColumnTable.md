### Resizable column

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
        <Table bordered height={400} data={data}>
          <Column width={50} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column
            width={100}
            fixed
            resizable
            onResize={(columnWidth, dataKey) => {
              console.log(columnWidth, dataKey);
            }}
          >
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={100} minWidth={75} resizable>
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

          <Column width={200} resizable fixed="right">
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

Columns will resize down to `minWidth` (optional) or `20`, whichever is higher.