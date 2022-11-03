### Big Tree

<!--start-code-->

```js
const data = mockTreeData({
  limits: [10, 20, 40],
  labels: layer => {
    if (layer === 0) {
      return faker.vehicle.manufacturer();
    } else if (layer === 1) {
      return faker.vehicle.fuel();
    }
    return faker.vehicle.vehicle();
  },
  getRowData: () => ({
    price: faker.commerce.price(10000, 1000000, 0, '$', true),
    rating: faker.finance.amount(2, 5)
  })
});

const App = () => {
  const [tree, setTree] = React.useState(true);
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={tree}
          onChange={() => {
            setTree(!tree);
          }}
        />
        isTree
      </label>
      <Table
        isTree
        virtualized
        minHeight={260}
        height={400}
        rowKey="id"
        data={data}
        shouldUpdateScroll={false}
        defaultExpandAllRows
      >
        <Column flexGrow={1}>
          <HeaderCell>Vehicle 🚗</HeaderCell>
          <Cell dataKey="label" />
        </Column>
        <Column width={180}>
          <HeaderCell>Rating ⭐️</HeaderCell>
          <Cell>
            {rowData =>
              Array.from({ length: rowData.rating }).map((_, i) => <span key={i}>⭐️</span>)
            }
          </Cell>
        </Column>
        <Column width={100}>
          <HeaderCell>Price 💰</HeaderCell>
          <Cell dataKey="price" />
        </Column>
      </Table>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
