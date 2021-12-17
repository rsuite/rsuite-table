### Custom Cell

<!--start-code-->

```js
const BaseCell = React.forwardRef((props, ref) => {
  const { children, rowData, ...rest } = props;
  return (
    <Cell
      ref={ref}
      rowData={rowData}
      onDoubleClick={() => {
        console.log(rowData);
      }}
      {...rest}
    >
      {children}
    </Cell>
  );
});

const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => {
  return (
    <BaseCell {...props} style={{ padding: 0 }}>
      <div style={{ lineHeight: '46px' }}>
        <input
          type="checkbox"
          value={rowData[dataKey]}
          onChange={onChange}
          checked={checkedKeys.some(item => item === rowData[dataKey])}
        />
      </div>
    </BaseCell>
  );
};

const NameCell = ({ rowData, dataKey, ...props }) => {
  const speaker = (
    <Popover title="Description">
      <p>
        <b>Name:</b> {`${rowData.firstName} ${rowData.lastName}`}{' '}
      </p>
      <p>
        <b>Email:</b> {rowData.email}{' '}
      </p>
      <p>
        <b>Company:</b> {rowData.companyName}{' '}
      </p>
      <p>
        <b>Sentence:</b> {rowData.sentence}{' '}
      </p>
    </Popover>
  );

  return (
    <BaseCell rowData={rowData} {...props}>
      <Whisper placement="top" speaker={speaker}>
        <a>{rowData[dataKey].toLocaleString()}</a>
      </Whisper>
    </BaseCell>
  );
};

const ActionCell = ({ rowData, dataKey, ...props }) => {
  function handleAction() {
    alert(`id:${rowData[dataKey]}`);
    console.log(rowData, dataKey);
  }

  return (
    <BaseCell {...props}>
      <a onClick={handleAction}> Edit </a>|<a onClick={handleAction}> Remove </a>
    </BaseCell>
  );
};

const InputCell = React.memo(({ rowData, data, value, onChange, ...props }) => {
  function handleChange(event) {
    onChange(rowData.id, event.target.value);
  }

  return (
    <BaseCell {...props}>
      <input value={data[rowData.id]} onChange={handleChange} />
    </BaseCell>
  );
});

const data = [...fakeLargeData];
const App = () => {
  const [checkedKeys, setCheckedKeys] = React.useState([]);
  const [emailList, setEmailList] = React.useState(data.map(item => item.email));

  const handleCheckAll = React.useCallback(event => {
    const checked = event.target.checked;
    const keys = checked ? data.map(item => item.id) : [];
    setCheckedKeys(keys);
  }, []);

  const handleCheck = React.useCallback(
    event => {
      const checked = event.target.checked;
      const value = +event.target.value;
      const keys = checked ? [...checkedKeys, value] : checkedKeys.filter(item => item !== value);

      setCheckedKeys(keys);
    },
    [checkedKeys]
  );

  const handleEmailChange = React.useCallback((id, value) => {
    setEmailList(prevEmailList => {
      const nextMailList = [...prevEmailList];
      nextMailList[id] = value;
      return nextMailList;
    });
  }, []);

  return (
    <Table height={400} data={data} headerHeight={50} virtualized>
      <Column width={50} align="center">
        <HeaderCell style={{ padding: 0 }}>
          <div style={{ lineHeight: '40px' }}>
            <input
              type="checkbox"
              onChange={handleCheckAll}
              checked={checkedKeys.length === data.length}
            />
          </div>
        </HeaderCell>
        <CheckCell dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} />
      </Column>
      <Column width={80} align="center">
        <HeaderCell>Id</HeaderCell>
        <NameCell dataKey="id" />
      </Column>
      <Column width={160}>
        <HeaderCell>First Name</HeaderCell>
        <NameCell dataKey="firstName" />
      </Column>
      <Column width={160}>
        <HeaderCell>Last Name</HeaderCell>
        <BaseCell dataKey="lastName" />
      </Column>

      <Column width={300}>
        <HeaderCell>Email</HeaderCell>
        <InputCell data={emailList} onChange={handleEmailChange} />
      </Column>

      <Column width={200}>
        <HeaderCell>Action</HeaderCell>
        <ActionCell dataKey="id" />
      </Column>
    </Table>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->

Depending on your business scenario, you can define what you want to display in a cell, such as displaying a picture, like adding a few buttons, or displaying a text box that you can customize, and simply redefining the `Cell` component.

For example, display a picture, define a `Imagecell` component:

```js
const ImageCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    <img src={rowData[dataKey]} width="50" />
  </Cell>
);
```

Use:

```html
<Column width="{200}">
  <HeaderCell>Avartar</HeaderCell>
  <ImageCell dataKey="avartar" />
</Column>
```

The `children` property support function on `<Cell>` can get `rowData` to return a new `children`.

Use:

```html
<Column width="{200}">
  <HeaderCell>Date</HeaderCell>
  <Cell>{rowData => rowData.date.toLocaleString()}</Cell>
</Column>
```

---

**Custom row height**

If you need to define row heights based on the content of your data in practical applications, you can use the following methods:

```html
<Table
    rowHeight={(rowData) => {
      if (rowData.firstName === 'Janis') {
        return 30;
      }
    }}
  >
...
</Table>
```
