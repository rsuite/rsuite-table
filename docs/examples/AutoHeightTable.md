### Automatic height

The height of the table will be automatically expanded according to the number of data rows, and no vertical scroll bar will appear.

<!--start-code-->

```js
const data = mockUsers(100);

const App = () => {
  const [size, setSize] = React.useState(100);
  const [autoHeight, setAutoHeight] = React.useState(true);
  const [height, setHeight] = React.useState(400);
  const [maxHeight, setMaxHeight] = React.useState(500);
  const [minHeight, setMinHeight] = React.useState(200);

  const filterData = data.filter((item, index) => index < size);
  return (
    <div>
      <VStack spacing={10}>
        <Checkbox
          checked={autoHeight}
          onChange={(_v, checked) => {
            setAutoHeight(checked);
          }}
        >
          autoHeight
        </Checkbox>

        <HStack>
          <Label>Data rows:</Label>
          <Input size="sm" onChange={setSize} value={size} />
        </HStack>

        <HStack>
          <Label>minHeight:</Label>
          <Input size="sm" onChange={setMinHeight} value={minHeight} />
        </HStack>

        <HStack>
          <Label>height:</Label>
          <Input size="sm" onChange={setHeight} value={height} />
        </HStack>

        <HStack>
          <Label>maxHeight:</Label>
          <Input size="sm" onChange={setMaxHeight} value={maxHeight} />
        </HStack>
      </VStack>
      <hr />

      <Table
        height={parseInt(height)}
        minHeight={parseInt(minHeight)}
        maxHeight={parseInt(maxHeight)}
        autoHeight={autoHeight}
        cellBordered
        data={filterData}
        affixHorizontalScrollbar
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

const Label = ({ children }) => <div style={{ width: 130 }}>{children}</div>;
```

<!--end-code-->
