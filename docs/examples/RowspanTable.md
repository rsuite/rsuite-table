### Rowspan Cell

<!--start-code-->

```js
const App = () => {
  return (
    <Table
      bordered
      cellBordered
      height={400}
      autoHeight
      data={fakeDataForRowSpan}
      onRowClick={data => {
        console.log(data);
      }}
    >
      <Column width={60} fixed>
        <HeaderCell>id</HeaderCell>
        <Cell dataKey="id" />
      </Column>
      <Column
        width={200}
        verticalAlign="middle"
        rowSpan={rowData => {
          return rowData.cityRowSpan;
        }}
      >
        <HeaderCell>City</HeaderCell>
        <Cell dataKey="city" />
      </Column>

      <Column
        width={200}
        verticalAlign="middle"
        rowSpan={rowData => {
          return rowData.streetRowSpan;
        }}
      >
        <HeaderCell>Street</HeaderCell>
        <Cell dataKey="street" />
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
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>
      <Column width={200}>
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>
      <Column width={200}>
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>
      <Column width={60} fixed="right">
        <HeaderCell>id</HeaderCell>
        <Cell dataKey="id" />
      </Column>
    </Table>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->

```js
const data = [
  {
    city: 'New Gust',
    name: 'Janis',
    rowspan: 2
  },
  {
    city: 'New Gust',
    name: 'Ernest Schuppe Anderson'
  },
  {
    city: 'Maria Junctions',
    name: 'Alessandra',
    rowspan: 3
  },
  {
    city: 'Maria Junctions',
    name: 'Margret'
  },
  {
    city: 'Maria Junctions',
    name: 'Emiliano'
  }
];

<Table data={data}>
  <Column
    width={100}
    verticalAlign="middle"
    rowSpan={rowData => {
      return rowData.rowspan;
    }}
  >
    <HeaderCell>Name</HeaderCell>
    <Cell dataKey="city" />
  </Column>
  <Column width={100}>
    <HeaderCell />
    <Cell dataKey="name" />
  </Column>
</Table>;
```
