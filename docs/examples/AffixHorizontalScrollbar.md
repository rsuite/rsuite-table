### Affix Horizontal Scrollbar

Affix the table horizontal scrollbar to the specified position on the page

<!--start-code-->

```js
const App = () => {
  return (
    <div>
      <div style={{ height: 500 }}>
        <hr />
        <p style={{ textAlign: 'center' }}>⬇️ Scroll down the page ⬇️</p>
        <hr />
      </div>
      <Table
        height={400}
        autoHeight
        affixHeader
        affixHorizontalScrollbar
        data={mockUsers(100)}
        onRowClick={data => {
          console.log(data);
        }}
      >
        <Column width={70} align="center" fixed resizable>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={130} fixed resizable>
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

        <Column width={200} resizable>
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
      <div style={{ height: 2000 }}>
        <hr />
      </div>
    </div>
  );
};
ReactDOM.render(<App />);
```

<!--end-code-->
