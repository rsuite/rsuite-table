### Fluid column

<!--start-code-->

```js
const data = mockUsers(20);

const CustomTable = ({ flexGrow }) => {
  return (
    <>
      <Table
        height={400}
        data={data}
        onSortColumn={(sortColumn, sortType) => {
          console.log(sortColumn, sortType);
        }}
      >
        <Column width={50} align="center" fixed>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={100} fixed>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="firstName" />
        </Column>

        <Column width={100} resizable sortable>
          <HeaderCell>Last Name</HeaderCell>
          <Cell dataKey="lastName" />
        </Column>

        <Column flexGrow={flexGrow ? 1 : undefined} width={200} sortable>
          <HeaderCell>City {flexGrow ? <code>(flexGrow={1})</code> : null}</HeaderCell>
          <Cell dataKey="city" />
        </Column>

        <Column flexGrow={flexGrow ? 2 : undefined} width={200} sortable>
          <HeaderCell>Company {flexGrow ? <code>(flexGrow={2})</code> : null}</HeaderCell>
          <Cell dataKey="company" />
        </Column>
      </Table>
    </>
  );
};

const App = () => {
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.Tab eventKey="1" title="flexGrow">
        <CustomTable flexGrow />
      </Tabs.Tab>
      <Tabs.Tab eventKey="2" title="no flexGrow">
        <CustomTable />
      </Tabs.Tab>
    </Tabs>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->

If you need to set a column to automatic width, you need to configure the `flexGrow` property. `flexGrow` is a `number` type. Will fill the `Table` remaining width according to the sum of all `flexGrow`.

Note: After setting `flexGrow`, you cannot set the `width` and `resizable` properties. You can set a minimum width by `minwidth`.

```html
<Column flexGrow="{1}">
  <HeaderCell>City <code>flexGrow={1}</code></HeaderCell>
  <Cell dataKey="city" />
</Column>

<Column flexGrow="{2}">
  <HeaderCell>Company <code>flexGrow={2}</code></HeaderCell>
  <Cell dataKey="company" />
</Column>

...
```
