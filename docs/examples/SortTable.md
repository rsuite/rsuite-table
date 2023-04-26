### Sort

<!--start-code-->

```js
const data = mockUsers(20);

const App = () => {
  const [sortColumn, setSortColumn] = React.useState('id');
  const [sortType, setSortType] = React.useState('asc');
  const [loading, setLoading] = React.useState(false);

  const sortData = () => {
    if (sortColumn && sortType) {
      return data.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === 'string') {
          x = x.charCodeAt();
        }
        if (typeof y === 'string') {
          y = y.charCodeAt();
        }
        if (sortType === 'asc') {
          return x - y;
        } else {
          return y - x;
        }
      });
    }
    return data;
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSortColumn(sortColumn);
      setSortType(sortType);
    }, 500);
  };

  const renderSortIcon = sortType => {
    console.log(sortType);
    const iconStyle = { fontSize: 18 };

    if (sortType === 'asc') {
      return <ArrowUpIcon style={iconStyle} />;
    } else if (sortType === 'desc') {
      return <ArrowDownIcon style={iconStyle} />;
    }

    return <SortIcon style={iconStyle} />;
  };

  return (
    <Table
      height={400}
      headerHeight={80}
      bordered
      cellBordered
      data={sortData()}
      sortColumn={sortColumn}
      sortType={sortType}
      onSortColumn={handleSortColumn}
      loading={loading}
      onRowClick={data => {
        console.log(data);
      }}
    >
      <Column width={70} align="center" fixed sortable verticalAlign="middle">
        <HeaderCell>Id</HeaderCell>
        <Cell dataKey="id" />
      </Column>

      <Column width={140} fixed sortable verticalAlign="middle">
        <HeaderCell renderSortIcon={renderSortIcon}>
          First Name
          <p style={{ color: 'blue' }}>Custom sort icon</p>
        </HeaderCell>
        <Cell dataKey="firstName" />
      </Column>
      <Column width={130} sortable verticalAlign="middle">
        <HeaderCell>Last Name</HeaderCell>
        <Cell dataKey="lastName" />
      </Column>
      <ColumnGroup
        header={'Address'}
        fixed
        align="center"
        verticalAlign="middle"
        groupHeaderHeight={30}
      >
        <Column width={200} sortable renderSortIcon={renderSortIcon}>
          <HeaderCell>
            City <span style={{ color: 'blue' }}>Custom sort icon</span>
          </HeaderCell>
          <Cell dataKey="city" />
        </Column>
        <Column width={200} sortable verticalAlign="middle">
          <HeaderCell>Street</HeaderCell>
          <Cell dataKey="street" />
        </Column>
      </ColumnGroup>

      <Column width={200} sortable verticalAlign="middle">
        <HeaderCell>Company</HeaderCell>
        <Cell dataKey="company" />
      </Column>

      <Column width={200} verticalAlign="middle">
        <HeaderCell>Email</HeaderCell>
        <Cell dataKey="email" />
      </Column>
    </Table>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
