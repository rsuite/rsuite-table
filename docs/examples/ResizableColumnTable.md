### Resizable column

<!--start-code-->

```js
const data = mockUsers(20);

const App = () => {
  return (
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

      <Column width={200} resizable flexGrow={1}>
        <HeaderCell>City</HeaderCell>
        <Cell dataKey="city" />
      </Column>

      <Column width={200} resizable>
        <HeaderCell>Street</HeaderCell>
        <Cell dataKey="street" />
      </Column>

      <Column width={200} resizable>
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>

      <Column width={200} resizable fixed="right">
        <HeaderCell>Email</HeaderCell>
        <Cell dataKey="email" />
      </Column>
    </Table>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->

Columns will resize down to `minWidth` (optional) or `20`, whichever is higher.
