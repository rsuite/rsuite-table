### Column Group

<!--start-code-->

```js
const App = () => {
  const [sortColumn, setSortColumn] = React.useState('id');
  const [sortType, setSortType] = React.useState('asc');

  return (
    <Table
      classPrefix="rs-table"
      bordered
      cellBordered
      height={400}
      headerHeight={100}
      data={fakeDataForColSpan}
      sortColumn={sortColumn}
      sortType={sortType}
      onSortColumn={(sortColumn, sortType) => {
        console.log(sortColumn, sortType);
        setSortType(sortType);
        setSortColumn(sortColumn);
      }}
      onRowClick={data => {
        console.log(data);
      }}
    >
      <Column width={70} fixed align="center" verticalAlign="middle" sortable>
        <HeaderCell>Id</HeaderCell>
        <Cell dataKey="id" />
      </Column>

      <ColumnGroup
        header={'Basic Info'}
        fixed
        align="center"
        verticalAlign="middle"
        groupHeaderHeight={40}
      >
        <Column width={120} resizable sortable>
          <HeaderCell>firstName</HeaderCell>
          <Cell dataKey="firstName" />
        </Column>

        <Column width={120} resizable sortable>
          <HeaderCell>lastName</HeaderCell>
          <Cell dataKey="lastName" />
        </Column>

        <Column width={200} resizable sortable>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>
      </ColumnGroup>
      <Column width={200} verticalAlign="middle" sortable>
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>

      <Column width={200} verticalAlign="middle" sortable>
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>
      <Column width={200} verticalAlign="middle" sortable>
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>

      <Column width={100} resizable colSpan={2} verticalAlign="middle" sortable>
        <HeaderCell>City</HeaderCell>
        <Cell dataKey="city" />
      </Column>

      <Column width={100} resizable sortable>
        <HeaderCell>Street</HeaderCell>
        <Cell dataKey="street" />
      </Column>
    </Table>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
