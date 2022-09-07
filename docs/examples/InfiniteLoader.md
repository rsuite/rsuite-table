### Infinite Loader

<!--start-code-->

```js
const InfiniteLoader = () => (
  <div
    style={{
      position: 'absolute',
      bottom: '0',
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      background: '#ddd'
    }}
  >
    <b>loading ...</b>
  </div>
);

const mockData = (length, start) => {
  const result = [];
  for (let i = 1; i <= length; i++) {
    result.push({
      time: Date.now(),
      index: start + i
    });
  }

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result);
    }, 1000);
  });
};

const tableHeight = 400;

const App = () => {
  const [data, setData] = React.useState([]);
  const [showLoader, setShowLoader] = React.useState(false);
  const loading = React.useRef(false);

  React.useEffect(() => {
    mockData(50, 0).then(data => {
      setData(data);
    });
  }, []);

  const handleScroll = (x, y) => {
    const contextHeight = data.length * 46;
    const top = Math.abs(y);

    if (!loading.current && contextHeight - top - tableHeight < 300) {
      loading.current = true;
      setShowLoader(true);

      mockData(50, data.length).then(data => {
        loading.current = false;
        setShowLoader(false);
        setData(prev => [...prev, ...data]);
      });
    }
    console.log(data.length, 'onScroll');
  };

  return (
    <div style={{ position: 'relative' }}>
      <Table
        virtualized
        shouldUpdateScroll={false}
        height={tableHeight}
        data={data}
        onScroll={handleScroll}
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
      {showLoader && <InfiniteLoader />}
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
