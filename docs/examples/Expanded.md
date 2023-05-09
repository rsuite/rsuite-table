### Expandable

<!--start-code-->

```js
const rowKey = 'id';
const ExpandCell = ({ rowData, dataKey, expandedRowKeys, onChange, ...props }) => (
  <Cell {...props}>
    <Button
      size="xs"
      onClick={() => {
        onChange(rowData);
      }}
    >
      {expandedRowKeys.some(key => key === rowData[rowKey]) ? '-' : '+'}
    </Button>
  </Cell>
);

const data = mockUsers(20);

const ExpandedTable = () => {
  const [expandedRowKeys, setExpandedRowKeys] = React.useState([0]);

  const handleExpanded = (rowData, dataKey) => {
    let open = false;
    const nextExpandedRowKeys = [];

    expandedRowKeys.forEach(key => {
      if (key === rowData[rowKey]) {
        open = true;
      } else {
        nextExpandedRowKeys.push(key);
      }
    });

    if (!open) {
      nextExpandedRowKeys.push(rowData[rowKey]);
    }

    setExpandedRowKeys(nextExpandedRowKeys);
  };

  return (
    <Table
      shouldUpdateScroll={false}
      height={400}
      data={data}
      rowKey={rowKey}
      expandedRowKeys={expandedRowKeys}
      onRowClick={data => {
        console.log(data);
      }}
      renderRowExpanded={rowData => {
        return (
          <div>
            <div
              style={{
                width: 60,
                height: 60,
                float: 'left',
                marginRight: 10,
                background: '#eee'
              }}
            >
              <img src={rowData.avatar} style={{ width: 60 }} />
            </div>
            <p>{rowData.email}</p>
            <p>{rowData.date}</p>
          </div>
        );
      }}
    >
      <Column width={70} align="center">
        <HeaderCell>#</HeaderCell>
        <ExpandCell dataKey="id" expandedRowKeys={expandedRowKeys} onChange={handleExpanded} />
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
        <HeaderCell>City</HeaderCell>
        <Cell dataKey="city" />
      </Column>

      <Column width={200}>
        <HeaderCell>Street</HeaderCell>
        <Cell dataKey="street" />
      </Column>

      <Column width={300} verticalAlign="middle">
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>
    </Table>
  );
};

ReactDOM.render(<ExpandedTable />);
```

<!--end-code-->
