### Automatic height

The height of the table will be automatically expanded according to the number of data rows, and no vertical scroll bar will appear.

<!--start-code-->

```js
const data = mockUsers(20);
const App = () => {
  const [size, setSize] = React.useState(data.length);
  const [autoHeight, setAutoHeight] = React.useState(true);

  const filterData = data.filter((item, index) => index < size);
  return (
    <div>
      <Stack spacing={10} divider={<Divider vertical />}>
        <span>
          <Checkbox
            checked={autoHeight}
            onChange={(_v, checked) => {
              setAutoHeight(checked);
            }}
          >
            autoHeight
          </Checkbox>
        </span>

        <span>
          Size:{' '}
          <Input
            type="text"
            style={{ width: 100, display: 'inline-block' }}
            onChange={setSize}
            value={size}
          />{' '}
          rem
        </span>
      </Stack>
      <hr />

      <Table
        height={400}
        autoHeight={autoHeight}
        cellBordered
        data={filterData}
        onRowClick={data => {
          console.log(data);
        }}
      >
        <Column width={70} align="center" fixed>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
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

        <Column width={200} fixed="right">
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
