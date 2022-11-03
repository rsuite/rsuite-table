### Virtualized

Virtualize Long Lists

<!--start-code-->

```js
const data = mockUsers(10000);

const LargeListsTable = () => {
  const tableRef = React.useRef();
  return (
    <div>
      <Table
        virtualized
        height={400}
        data={data}
        ref={tableRef}
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

        <Column width={200}>
          <HeaderCell>Company</HeaderCell>
          <Cell dataKey="company" />
        </Column>
      </Table>
      <button
        onClick={() => {
          tableRef.current.scrollTop(10000);
        }}
      >
        Scroll top
      </button>
    </div>
  );
};

ReactDOM.render(<LargeListsTable />);
```

<!--end-code-->
