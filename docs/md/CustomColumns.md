### Custom Columns

<!--start-code-->

```js
const App = () => {
  const [showColumns, setShowColumns] = React.useState(false);

  console.log(showColumns, 'showColumns');

  return (
    <Table
      classPrefix="rs-table"
      bordered
      height={400}
      headerHeight={100}
      data={fakeDataForColSpan}
    >
      <Column width={70} align="center" verticalAlign="middle" sortable>
        <HeaderCell>Id</HeaderCell>
        <Cell dataKey="id" />
      </Column>

      <ColumnGroup
        header={'Basic Info'}
        align="center"
        verticalAlign="middle"
        groupHeaderHeight={40}
      >
        <React.Fragment>
          <Column width={120} resizable sortable>
            <HeaderCell>firstName</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={120} resizable sortable>
            <HeaderCell>lastName</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>
        </React.Fragment>

        {showColumns ? (
          <Column width={200} resizable sortable>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>
        ) : null}
      </ColumnGroup>

      <React.Fragment>
        <Column width={200} verticalAlign="middle" sortable>
          <HeaderCell>Company Name</HeaderCell>
          <Cell dataKey="companyName" />
        </Column>

        <Column width={200} verticalAlign="middle" sortable>
          <HeaderCell>Company Name</HeaderCell>
          <Cell dataKey="companyName" />
        </Column>
      </React.Fragment>

      <Column width={200} verticalAlign="middle" sortable>
        <HeaderCell>Company Name</HeaderCell>
        <Cell dataKey="companyName" />
      </Column>

      <Column width={100} resizable colSpan={2} verticalAlign="middle" sortable>
        <HeaderCell>City</HeaderCell>
        <Cell dataKey="city" />
      </Column>

      {showColumns ? (
        <Column width={100} resizable sortable>
          <HeaderCell>Street</HeaderCell>
          <Cell dataKey="street" />
        </Column>
      ) : null}
    </Table>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
