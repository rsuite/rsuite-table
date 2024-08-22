### Affix Header

Affix the table header to the specified position on the page

<!--start-code-->

```js
const App = () => {
  return (
    <div>
      <Table
        height={400}
        autoHeight
        affixHeader
        data={mockUsers(100)}
        onRowClick={data => {
          console.log(data);
        }}
      >
        <Column width={70} align="center" resizable>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={130} resizable>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="firstName" />
        </Column>

        <Column width={130} resizable>
          <HeaderCell>Last Name</HeaderCell>
          <Cell dataKey="lastName" />
        </Column>

        <Column width={200} resizable>
          <HeaderCell>City</HeaderCell>
          <Cell dataKey="city" />
        </Column>

        <Column width={200}>
          <HeaderCell>Street</HeaderCell>
          <Cell dataKey="street" />
        </Column>

        <Column width={200}>
          <HeaderCell>Company</HeaderCell>
          <Cell dataKey="company" />
        </Column>

        <Column width={200}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>

        <Column width={200}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>

        <Column width={200}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>

        <Column width={200}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>
      </Table>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
