<!--start-code-->

```js
const fakeData = (length, start) => {
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
  const [dataNum, setDataNum] = React.useState(9000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => fakeData(dataNum, 0), [dataNum]);
  console.log('currentDataLen', data.length, dataNum);

  return (
    <div>
      <Table
        width={300}
        height={400}
        data={data}
        // 这个是bug复现的必要条件
        virtualized={true}
        // 这个是bug复现的必要条件
        shouldUpdateScroll={false}
        showHeader={false}
        bordered
      >
        <Column width={200} align="center" flexGrow={1}>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="index" />
        </Column>
        <Column width={200} align="center" flexGrow={1}>
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
        改变数据源
      </Button>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
