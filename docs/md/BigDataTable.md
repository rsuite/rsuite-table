### Virtualized

<!--start-code-->

```js
const { sub_cmps: columns } = dataSource;
const data = [];
for (let i = 0; i < 3000000; i++) {
  let obj = {};
  columns.map(item => {
    obj[item.cmp_name] = '123';
    return item;
  });
  obj.id = i;

  data.push(obj);
}

class LargeListsTable extends React.Component {
  render() {
    return (
      <div>
        <Table height={500} data={data} virtualized rowKey="_id">
          {columns.map(item => {
            return (
              <Column key={item.cmp_name} width={120} resizable>
                <HeaderCell>{item.cmp_data.title}</HeaderCell>
                <Cell dataKey={item.cmp_id}>{item.cmp_data.title}</Cell>
              </Column>
            );
          })}
        </Table>
      </div>
    );
  }
}
ReactDOM.render(<LargeListsTable />);
```

<!--end-code-->
