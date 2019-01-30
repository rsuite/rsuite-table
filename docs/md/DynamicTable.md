### Dynamic

<!--start-code-->

```js
const CheckBoxCell = ({
  rowData,
  dataKey,
  className,
  getCheckBoxProps,
  onChange,
  checked,
  disabled,
  ...props
}) => {
  const data = get(rowData, dataKey) || null;
  checked = isFunction(checked) ? checked(data, rowData) : checked;
  disabled = isFunction(disabled) ? disabled(data, rowData) : disabled;
  const checkBoxProps = isFunction(getCheckBoxProps) ? getCheckBoxProps(rowData) : {};

  return (
    <Cell {...props}>
      <Checkbox
        value={data}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        {...checkBoxProps}
      />
    </Cell>
  );
};

class DynamicTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columns: [],
      checkValues: [],
      paddingLeft: 0,
      tableWidth: 'auto'
    };
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleColumnClick = this.handleColumnClick.bind(this);
    this.handleScrollTop = this.handleScrollTop.bind(this);
    this.handleScrollLeft = this.handleScrollLeft.bind(this);
    this.handleCheckCellChange = this.handleCheckCellChange.bind(this);
    this.handleResizeWidth = this.handleResizeWidth.bind(this);
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

  handleCheckCellChange(value) {
    value = +value;
    let checkValues = [...this.state.checkValues];

    if (checkValues.includes(value)) {
      checkValues = without(checkValues, value);
    } else {
      checkValues.push(value);
    }
    this.setState({
      checkValues
    });
  }

  handleResizeWidth() {
    this.setState({
      tableWidth: this.state.tableWidth === 1000 ? 'auto' : 1000
    });
  }

  render() {
    const { checkValues, tableWidth, paddingLeft } = this.state;

    return (
      <div style={{ paddingLeft, width: tableWidth, transition: 'padding .1s linear' }}>
        <ButtonGroup>
          <Button onClick={this.handleRowClick}>Add Row</Button>
          <Button onClick={this.handleColumnClick}>Add Column</Button>
          <Button onClick={this.handleScrollTop}>Scroll Top</Button>
          <Button onClick={this.handleScrollLeft}>Scroll Left</Button>
          <Button onClick={this.handleResizeWidth}>Update Width</Button>
        </ButtonGroup>
        <hr />
        <Table
          height={400}
          data={this.state.data}
          ref={ref => {
            this.table = ref;
          }}
        >
          <Column key="checkColumn" width={56} fixed>
            <HeaderCell className="checkbox-cell">#</HeaderCell>
            <CheckBoxCell
              dataKey="id"
              checked={value => checkValues.includes(value)}
              onChange={this.handleCheckCellChange}
            />
          </Column>
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
          {this.state.columns}
        </Table>
      </div>
    );
  }
}
ReactDOM.render(<DynamicTable />);
```

<!--end-code-->
