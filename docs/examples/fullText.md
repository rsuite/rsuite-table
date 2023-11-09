### Show full text of cells

<!--start-code-->

```js
const data = mockUsers(20);

const App = () => {
  return (
    <div>
      <Table height={400} data={data} cellBordered rowHeight={34}>
        <Column width={130} fixed fullText>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>

        <Column width={300} fullText verticalAlign="middle">
          <HeaderCell>Avatar</HeaderCell>
          <Cell dataKey="avatar" />
        </Column>

        <Column width={130} fullText>
          <HeaderCell>City</HeaderCell>
          <Cell dataKey="city" />
        </Column>

        <Column width={130} fullText>
          <HeaderCell>Street</HeaderCell>
          <Cell dataKey="street" />
        </Column>

        <Column width={130} fullText>
          <HeaderCell>Company</HeaderCell>
          <Cell dataKey="company" />
        </Column>

        <Column width={130} fullText>
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
