### Virtualized

Virtualize Long Lists

<!--start-code-->

```js
const data = mockUsers(10000);

const ImageCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props} style={{ padding: 0 }}>
    <div
      style={{
        width: 40,
        height: 40,
        background: '#f5f5f5',
        borderRadius: 6,
        marginTop: 2,
        overflow: 'hidden',
        display: 'inline-block'
      }}
    >
      <img src={rowData.avatar} width="40" />
    </div>
  </Cell>
);

const LargeListsTable = () => {
  const tableRef = React.useRef();
  return (
    <div>
      <Table
        virtualized
        height={600}
        data={data}
        ref={tableRef}
        onRowClick={data => {
          console.log(data);
        }}
      >
        {({ Column, HeaderCell, Cell }) => (
          <>
            <Column width={70} align="center" fixed>
              <HeaderCell>Id</HeaderCell>
              <Cell dataKey="id" />
            </Column>

            <Column width={80} align="center">
              <HeaderCell>Avartar</HeaderCell>
              <ImageCell dataKey="avartar" />
            </Column>

            <Column width={130} fullText>
              <HeaderCell>First Name</HeaderCell>
              <Cell dataKey="firstName" />
            </Column>

            <Column width={130} fullText>
              <HeaderCell>Last Name</HeaderCell>
              <Cell dataKey="lastName" />
            </Column>

            <Column width={200} fullText>
              <HeaderCell>City</HeaderCell>
              <Cell dataKey="city" />
            </Column>

            <Column width={200} fullText>
              <HeaderCell>Street</HeaderCell>
              <Cell dataKey="street" />
            </Column>

            <Column width={200} fullText>
              <HeaderCell>Company</HeaderCell>
              <Cell dataKey="company" />
            </Column>

            <Column width={200} fullText>
              <HeaderCell>phone</HeaderCell>
              <Cell dataKey="phone" />
            </Column>

            <Column width={200} fullText>
              <HeaderCell>amount</HeaderCell>
              <Cell dataKey="amount" />
            </Column>

            <Column width={200} fullText>
              <HeaderCell>age</HeaderCell>
              <Cell dataKey="age" />
            </Column>
          </>
        )}
      </Table>
      <button
        onClick={() => {
          tableRef.current.scrollTop(10000);
        }}
      >
        Scroll top
      </button>
    </div>
  );
};

ReactDOM.render(<LargeListsTable />);
```

<!--end-code-->
