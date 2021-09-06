### Tree

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
        data={fakeTreeData}
        shouldUpdateScroll={false}
        defaultExpandedRowKeys={[0]}
        onExpandChange={(expanded, rowData) => {
          console.log(expanded, rowData);
        }}
        renderTreeToggle={(icon, rowData, expanded) => {
          if (rowData.labelName === '手机') {
            return <i className="icon icon-spin icon-spinner" />;
          }
          return icon;
        }}
      >
        <Column width={100}>
          <HeaderCell>Key</HeaderCell>
          <Cell dataKey="key" />
        </Column>
        <Column flexGrow={1} treeCol>
          <HeaderCell>Label (Tree Col)</HeaderCell>
          <Cell dataKey="labelName" />
        </Column>

        <Column width={100}>
          <HeaderCell>Status</HeaderCell>
          <Cell dataKey="status" />
        </Column>

        <Column width={100}>
          <HeaderCell>Count</HeaderCell>
          <Cell dataKey="count" />
        </Column>
      </Table>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
