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

const App = () => {
  const [data, setData] = React.useState(fakeObjectDataListStore(2));
  const [columns, setColumns] = React.useState([]);
  const [checkValues, setCheckValues] = React.useState([]);
  const [tableWidth, setTableWidth] = React.useState('auto');
  const [paddingLeft, setPaddingLeft] = React.useState(0);
  const tableRef = React.useRef();

  const handleResizeWidth = () => {
    setTableWidth(tableWidth === 1000 ? 'auto' : 1000);
  };

  const handleCheckCellChange = value => {
    value = +value;
    let nextCheckValues = [...checkValues];

    if (nextCheckValues.includes(value)) {
      nextCheckValues = without(nextCheckValues, value);
    } else {
      nextCheckValues.push(value);
    }

    setCheckValues(nextCheckValues);
  };

  const handleScrollTop = () => {
    tableRef.current.scrollTop(100);
  };
  const handleScrollLeft = () => {
    tableRef.current.scrollLeft(100);
  };

  const handleClearData = () => {
    setData([]);
  };
  const handleResetData = () => {
    setData(fakeObjectDataListStore(10));
  };

  const handleRowClick = () => {
    const rowData = createFakeRowObjectData(data.length + 1);

    setData([...data, rowData]);
  };

  const handleColumnClick = () => {
    const newColumn = (
      <Column width={200} key={columns.length + 2}>
        <HeaderCell>Email</HeaderCell>
        <Cell dataKey="email" />
      </Column>
    );

    setColumns([...columns, newColumn]);
  };

  return (
    <div style={{ paddingLeft, width: tableWidth, transition: 'padding .1s linear' }}>
      <ButtonGroup>
        <Button onClick={handleRowClick}>Add Row</Button>
        <Button onClick={handleColumnClick}>Add Column</Button>
        <Button onClick={handleScrollTop}>Scroll Top</Button>
        <Button onClick={handleScrollLeft}>Scroll Left</Button>
        <Button onClick={handleResizeWidth}>Update Width</Button>
        <Button onClick={handleResetData}>Reset Data</Button>
        <Button onClick={handleClearData}>Clear Data</Button>
      </ButtonGroup>
      <hr />
      <Table height={400} data={data} ref={tableRef} shouldUpdateScroll={false}>
        <Column key="checkColumn" width={56} fixed>
          <HeaderCell className="checkbox-cell">#</HeaderCell>
          <CheckBoxCell
            dataKey="id"
            checked={value => checkValues.includes(value)}
            onChange={handleCheckCellChange}
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
          <Cell dataKey="address.city" />
        </Column>
        {columns}
      </Table>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
