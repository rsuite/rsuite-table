### Word wrap

<!--start-code-->

```js
const fakeData = mockUsers(20);

const App = () => {
  const [data, setData] = React.useState(fakeData);
  const [wordWrap, setWordWrap] = React.useState('break-all');
  return (
    <div>
      <button
        onClick={() => {
          setData([]);
        }}
      >
        Clear
      </button>
      {' | '}
      <button
        onClick={() => {
          setData(fakeData);
        }}
      >
        Reset
      </button>
      <select
        value={wordWrap}
        onChange={e => {
          let value = e.target.value;

          if (value === '' || value == 'true') {
            value = Boolean(value);
          }

          setWordWrap(value);
        }}
      >
        <option value="">false</option>
        <option value={true}>true</option>
        <option value="break-all">break-all</option>
        <option value="break-word">break-word</option>
        <option value="keep-all">keep-all</option>
      </select>
      <hr />
      <Table
        wordWrap={wordWrap}
        height={400}
        data={data}
        onRowClick={data => {
          console.log(data);
        }}
      >
        <Column width={70} align="center" fixed>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={140} fixed>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="firstName" />
        </Column>

        <Column width={130}>
          <HeaderCell>Last Name</HeaderCell>
          <Cell dataKey="lastName" />
        </Column>

        <Column width={130}>
          <HeaderCell>City</HeaderCell>
          <Cell dataKey="city" />
        </Column>

        <Column width={130}>
          <HeaderCell>Street</HeaderCell>
          <Cell dataKey="street" />
        </Column>

        <Column width={130}>
          <HeaderCell>Company</HeaderCell>
          <Cell dataKey="company" />
        </Column>

        <Column width={100}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>
      </Table>
    </div>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
