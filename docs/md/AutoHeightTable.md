### Automatic height

<!--start-code-->

```js
const App = () => {
  const [size, setSize] = React.useState(fakeData.length);
  const [autoHeight, setAutoHeight] = React.useState(false);

  const data = fakeData.filter((item, index) => index < size);
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
        data={data}
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
          <HeaderCell>Company Name</HeaderCell>
          <Cell dataKey="companyName" />
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
