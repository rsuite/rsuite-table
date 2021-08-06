### Scroll loading data

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

const TableHeight = 400;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.onScroll = this.onScroll.bind(this);
    this.state = {
      data: []
    };
  }
  onScroll(x, y) {
    const { data } = this.state;
    let contextHeight = data.length * 46;
    let top = Math.abs(y);
    if (contextHeight - top - TableHeight < 200) {
      this.setState({ data: [...data, ...fakeData(100, data.length)] });
    }
  }

  componentDidMount() {
    this.setState({ data: fakeData(100, 0) });
  }

  render() {
    return (
      <div>
        <Table
          shouldUpdateScroll={false}
          virtualized={true}
          height={TableHeight}
          data={this.state.data}
          onScroll={this.onScroll}
          ref={this.tableRef}
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
      </div>
    );
  }
}

ReactDOM.render(<App />);
```

<!--end-code-->
