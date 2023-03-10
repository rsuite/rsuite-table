### Update data

Demonstrates updating the scrollbar position after the data is updated.

<!--start-code-->

```js
const mockData = (length, start) => {
  const result = [];
  for (let i = 1; i <= length; i++) {
    result.push({
      time: Date.now(),
      index: start + i
    });
  }
  return result;
};

const App = () => {
  const [dataNum, setDataNum] = React.useState(10);
  const [autoHeight, setAutoHeight] = React.useState(true);
  const [startIndex, setStartIndex] = React.useState(0);
  const [columnWidth, setColumnWidth] = React.useState(200);

  const data = React.useMemo(() => mockData(dataNum, startIndex), [dataNum, startIndex]);

  return (
    <div>
      <Table height={400} data={data} autoHeight={autoHeight} bordered shouldUpdateScroll={false}>
        <Column width={100} align="center" fixed>
          <HeaderCell>Index</HeaderCell>
          <Cell dataKey="index" />
        </Column>
        <Column width={columnWidth} align="center" resizable onResize={setColumnWidth}>
          <HeaderCell>Resizable Column</HeaderCell>
          <Cell dataKey="time" />
        </Column>
        <Column width={200} align="center">
          <HeaderCell>Time 1</HeaderCell>
          <Cell dataKey="time" />
        </Column>
        <Column width={200} align="center">
          <HeaderCell>Time 2</HeaderCell>
          <Cell dataKey="time" />
        </Column>
        <Column width={200} align="center">
          <HeaderCell>Time 3</HeaderCell>
          <Cell dataKey="time" />
        </Column>
        <Column minWidth={200} fixed="right" flexGrow={1}>
          <HeaderCell>Time 4</HeaderCell>
          <Cell dataKey="time" />
        </Column>
      </Table>
      <hr />
      autoHeight: <Toggle checked={autoHeight} onChange={setAutoHeight} />
      <hr />
      <p>Simulate data update actions:</p>
      <Stack spacing={10}>
        <Button
          appearance="primary"
          onClick={() => {
            setDataNum(dataNum + 1);
          }}
        >
          Add
        </Button>

        <Button
          appearance="primary"
          onClick={() => {
            setDataNum(dataNum - 1);
          }}
        >
          Remove
        </Button>

        <Button
          appearance="primary"
          onClick={() => {
            setStartIndex(startIndex + dataNum);
          }}
        >
          Next Page
        </Button>

        <Button
          appearance="primary"
          onClick={() => {
            setDataNum(dataNum * 0.8);
            setStartIndex(startIndex + dataNum);
          }}
        >
          Last Page
        </Button>
      </Stack>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->

### Update data with fixed columns

<!--start-code-->

```js
const data = mockUsers(18).map((item, index) => ({
  ...item,
  index: index + 1
}));

const App = () => {
  const [page, setPage] = React.useState(1);

  const curPageData = React.useMemo(() => {
    const start = (page - 1) * 5;
    return data.slice(start, start + 5);
  }, [page]);

  console.log(curPageData);

  return (
    <div>
      <Table
        data={curPageData}
        rowKey="id"
        autoHeight
        bordered
        width={700}
        rowClassName={rowData => {
          if (!rowData?.index) return '';
          return rowData?.index % 2 === 0 ? 'even' : 'odd';
        }}
        shouldUpdateScroll={false}
      >
        <Column width={80} align="center" fixed>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={150} fixed resizable>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="firstName" />
        </Column>

        <Column width={150}>
          <HeaderCell>Last Name</HeaderCell>
          <Cell dataKey="lastName" />
        </Column>

        <Column width={200}>
          <HeaderCell>City</HeaderCell>
          <Cell dataKey="city" />
        </Column>
        <Column width={300}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>
      </Table>
      <hr />
      <Stack spacing={10}>
        <Button
          appearance="primary"
          onClick={() => {
            setPage(page + 1);
          }}
        >
          Next Page
        </Button>
      </Stack>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
