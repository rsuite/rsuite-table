### 自定义单元格

<!--start-code-->

```js

const DateCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    {rowData[dataKey].toLocaleString()}
  </Cell>
);

const NameCell = ({ rowData, dataKey, ...props }) => {
  const speaker = (
    <Popover title="Description">
      <p><b>Name:</b> {`${rowData.firstName} ${rowData.lastName}`} </p>
      <p><b>Email:</b> {rowData.email} </p>
      <p><b>Company:</b> {rowData.companyName} </p>
      <p><b>Sentence:</b> {rowData.sentence} </p>

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

const ImageCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    <img src={rowData[dataKey]} width="50" />
  </Cell>
);

const EmailCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    <a href={`mailto:${rowData[dataKey]}`}>{rowData[dataKey]}</a>
  </Cell>
);

const ActionCell = ({ rowData, dataKey, ...props }) => {
  function handleAction() {
    alert(`id:${rowData[dataKey]}`);
    console.log(rowData, dataKey);
  }


  return (
    <Cell {...props}>
      <a onClick={handleAction} > Edit </a>
      |
      <a onClick={handleAction}> Remove </a>
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
          onRerenderRowHeight={(rowData) => {
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

          <Column width={300} >
            <HeaderCell>Email</HeaderCell>
            <EmailCell dataKey="email" />
          </Column>

          <Column width={200} >
            <HeaderCell>Action</HeaderCell>
            <DateCell dataKey="date" />
          </Column>

          <Column width={200} >
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

> 根据不同的业务场景，单元格中可以自己定义显示的内容，比如显示一张图片，比如你要添加一个几个按钮，或者显示一个文本框，都是可以自定义的，只需要把 `Cell` 组件重新自定义一下就行。


比如，显示一个图片，定义一个 `ImageCell` 组件：
```js
const ImageCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        <img src={rowData[dataKey]} width="50" />
    </Cell>
);
```
用的时候：

```html
<Column width={200} >
    <HeaderCell>Avartar</HeaderCell>
    <ImageCell dataKey="avartar" />
</Column>
```
比如，要格式化日期，就定义一个 `DateCell` 组件：
```js
const DateCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        {rowData[dataKey].toLocaleString()}
    </Cell>
);
```
用的时候：
```html
<Column width={200} >
    <HeaderCell>Action</HeaderCell>
    <DateCell dataKey="date" />
</Column>
```
--------
**自定义行高**

如果在实际应用中需要根据数据内容来定义行高，可以使用以下方式

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
