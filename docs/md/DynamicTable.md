### 动态数据

<!--start-code-->

```js
class DynamicTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columns: []
    };
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleColumnClick = this.handleColumnClick.bind(this);
    this.handleScrollTop = this.handleScrollTop.bind(this);
    this.handleScrollLeft = this.handleScrollLeft.bind(this);
  }
  handleRowClick() {
    const { data } = this.state;
    const rowData = createFakeRowObjectData(data.length + 1);
    data.push(rowData);

    this.setState({
      data
    });
  }
  handleColumnClick() {
    const { columns } = this.state;

    columns.push(
      <Column width={200} key={columns.length + 1}>
        <HeaderCell>Email</HeaderCell>
        <Cell dataKey="email" />
      </Column>
    );

    this.setState({
      columns
    });
  }
  handleScrollTop() {
    this.table.scrollTop(0);
  }
  handleScrollLeft() {
    this.table.scrollLeft(0);
  }
  render() {
    return (
      <div>
        <ButtonGroup>
          <Button onClick={this.handleRowClick}>添加行</Button>
          <Button onClick={this.handleColumnClick}>添加列</Button>
          <Button onClick={this.handleScrollTop}>scrollTop</Button>
          <Button onClick={this.handleScrollLeft}>scrollLeft</Button>
        </ButtonGroup>
        <hr />
        <Table
          height={400}
          data={this.state.data}
          ref={ref => {
            this.table = ref;
          }}
        >
          <Column width={70} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column width={130} fixed>
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
          {this.state.columns}
        </Table>
      </div>
    );
  }
}
ReactDOM.render(<DynamicTable />);
```

<!--end-code-->
