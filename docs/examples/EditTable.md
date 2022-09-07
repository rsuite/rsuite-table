### Editable

<!--start-code-->

```js
const EditCell = ({ rowData, dataKey, onChange, ...props }) => {
  return (
    <Cell {...props}>
      {rowData.status === 'EDIT' ? (
        <input
          className="input"
          defaultValue={rowData[dataKey]}
          onChange={event => {
            onChange && onChange(rowData.id, dataKey, event.target.value);
          }}
        />
      ) : (
        rowData[dataKey]
      )}
    </Cell>
  );
};

const ActionCell = ({ rowData, dataKey, onClick, ...props }) => {
  return (
    <Cell {...props}>
      <a
        onClick={() => {
          onClick && onClick(rowData.id);
        }}
      >
        {rowData.status === 'EDIT' ? 'Save' : 'Edit'}
      </a>
    </Cell>
  );
};

const App = () => {
  const [data, setData] = React.useState(fakeData.filter((item, index) => index < 20));
  const handleChange = (id, key, value) => {
    const nextData = clone(data);
    nextData.find(item => item.id === id)[key] = value;

    setData(nextData);
  };

  const handleEditState = id => {
    const nextData = clone(data);
    const activeItem = nextData.find(item => item.id === id);
    activeItem.status = activeItem.status ? null : 'EDIT';
    setData(nextData);
  };

  return (
    <Table height={400} data={data} shouldUpdateScroll={false}>
      <Column width={200}>
        <HeaderCell>First Name</HeaderCell>
        <EditCell dataKey="firstName" onChange={handleChange} />
      </Column>

      <Column width={200}>
        <HeaderCell>Last Name</HeaderCell>
        <EditCell dataKey="lastName" onChange={handleChange} />
      </Column>

      <Column width={300}>
        <HeaderCell>Email</HeaderCell>
        <EditCell dataKey="email" onChange={handleChange} />
      </Column>

      <Column flexGrow={1}>
        <HeaderCell>Action</HeaderCell>
        <ActionCell dataKey="id" onClick={handleEditState} />
      </Column>
    </Table>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
