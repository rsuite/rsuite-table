### 动态数据

<!--start-code-->

```js
class DynamicTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleScrollTop = this.handleScrollTop.bind(this);
    this.handleScrollLeft = this.handleScrollLeft.bind(this);
  }
  handleClick() {
    const { data } = this.state;
    const rowData = createFakeRowObjectData(data.length + 1);
    data.push(rowData);

    this.setState({
      data
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
          <Button onClick={this.handleClick}>添加数据</Button>
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
          Î
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
          <Column width={200} fixed="right">
            <HeaderCell>Action</HeaderCell>

            <Cell>
              {rowData => {
                function handleAction() {
                  alert(`id:${rowData.id}`);
                }
                return (
                  <span>
                    <a onClick={handleAction}> Edit </a> | <a onClick={handleAction}> Remove </a>
                  </span>
                );
              }}
            </Cell>
          </Column>
        </Table>
      </div>
    );
  }
}
ReactDOM.render(<DynamicTable />);
```

<!--end-code-->
