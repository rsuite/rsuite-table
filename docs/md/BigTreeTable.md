### Big Tree

<!--start-code-->

```js
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
        isTree={tree}
        virtualized
        minHeight={260}
        height={400}
        rowKey="id"
        data={fakeBigTreeData}
        shouldUpdateScroll={false}
        defaultExpandAllRows
      >
        <Column width={100}>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column treeCol flexGrow={1}>
          <HeaderCell>firstName</HeaderCell>
          <Cell dataKey="firstName" />
        </Column>

        <Column width={100}>
          <HeaderCell>lastName</HeaderCell>
          <Cell dataKey="lastName" />
        </Column>

        <Column width={100}>
          <HeaderCell>employeeId</HeaderCell>
          <Cell dataKey="employeeId" />
        </Column>
      </Table>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
