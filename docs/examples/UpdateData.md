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
      <Table width={300} height={400} data={data} virtualized shouldUpdateScroll={false} bordered>
        <Column width={100} align="center">
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
      </Table>
      <Button
        appearance="primary"
        onClick={() => {
          setDataNum(Math.round(dataNum / 2));
        }}
      >
        Change Data
      </Button>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
