### Custom Cell

<!--start-code-->

```js
const DateCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>{rowData[dataKey].toLocaleString()}</Cell>
);

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
    <Cell {...props}>
      <Whisper placement="top" speaker={speaker}>
        <a>{rowData[dataKey].toLocaleString()}</a>
      </Whisper>
    </Cell>
  );
};

const ActionCell = ({ rowData, dataKey, ...props }) => {
  function handleAction() {
    alert(`id:${rowData[dataKey]}`);
    console.log(rowData, dataKey);
  }

  return (
    <Cell {...props}>
      <a onClick={handleAction}> Edit </a>|<a onClick={handleAction}> Remove </a>
    </Cell>
  );
};

class CustomColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData
    };
  }
  render() {
    const { data } = this.state;
    return (
      <div>
        <Table
          height={400}
          data={data}
          rowHeight={64}
          headerHeight={50}
          setRowHeight={rowData => {
            if (rowData.firstName === 'Janis') {
              return 30;
            }
          }}
        >
          <Column width={160} sortable>
            <HeaderCell>First Name</HeaderCell>
            <NameCell dataKey="firstName" />
          </Column>

          <Column width={160} sortable>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column width={300}>
            <HeaderCell>Email</HeaderCell>
            <Cell>{rowData => <a href={`mailto:${rowData.email}`}>{rowData.email}</a>}</Cell>
          </Column>

          <Column width={200}>
            <HeaderCell>Action</HeaderCell>
            <Cell>{rowData => rowData.date.toLocaleString()}</Cell>
          </Column>

          <Column width={200}>
            <HeaderCell>Action</HeaderCell>
            <ActionCell dataKey="id" />
          </Column>
        </Table>
      </div>
    );
  }
}

ReactDOM.render(<CustomColumnTable />);
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
    onRerenderRowHeight={(rowData) => {
      if (rowData.firstName === 'Janis') {
        return 30;
      }
    }}
  >
...
</Table>
```
