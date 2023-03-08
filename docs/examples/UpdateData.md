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
  const [dataNum, setDataNum] = React.useState(1000);
  const data = React.useMemo(() => mockData(dataNum, 0), [dataNum]);
  console.log('currentDataLen', data.length, dataNum);

  return (
    <div>
      <Table width={500} height={400} data={data} virtualized bordered shouldUpdateScroll={false}>
        <Column width={100} align="center" fixed>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="index" />
        </Column>
        <Column width={200} align="center">
          <HeaderCell>Time</HeaderCell>
          <Cell dataKey="time" />
        </Column>
        <Column width={200} align="center">
          <HeaderCell>Time</HeaderCell>
          <Cell dataKey="time" />
        </Column>
        <Column width={200} align="center">
          <HeaderCell>Time</HeaderCell>
          <Cell dataKey="time" />
        </Column>
        <Column width={200} align="center">
          <HeaderCell>Time</HeaderCell>
          <Cell dataKey="time" />
        </Column>
        <Column width={200} align="center">
          <HeaderCell>Time</HeaderCell>
          <Cell dataKey="time" />
        </Column>
      </Table>

      <hr />
      <Stack spacing={10}>
        <Button
          appearance="primary"
          onClick={() => {
            setDataNum(dataNum + 100);
          }}
        >
          Add
        </Button>

        <Button
          appearance="primary"
          onClick={() => {
            setDataNum(Math.round(dataNum / 2));
          }}
        >
          Remove
        </Button>
      </Stack>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
