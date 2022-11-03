### Loading

<!--start-code-->

```js
const fakeData = mockUsers(20);

const App = () => {
  const [data, setData] = React.useState(fakeData);
  const [loading, setLoading] = React.useState(true);
  const [customLoader, setCustomLoader] = React.useState(false);
  const [loadAnimation, setLoadAnimation] = React.useState(false);
  const renderLoading = () => {
    return <Loader center backdrop content="Custom Loader" />;
  };
  return (
    <div>
      <Checkbox
        checked={loading}
        onChange={() => {
          setLoading(!loading);
        }}
      >
        loading
      </Checkbox>

      <Checkbox
        checked={customLoader}
        onChange={() => {
          setCustomLoader(!customLoader);
        }}
      >
        Use a custom loader
      </Checkbox>

      <Checkbox
        checked={loadAnimation}
        onChange={() => {
          setLoadAnimation(!loadAnimation);
        }}
      >
        loadAnimation
      </Checkbox>

      <Table
        loading={loading}
        height={500}
        data={data}
        loadAnimation={loadAnimation}
        renderLoading={customLoader ? renderLoading : null}
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
          <HeaderCell>Company</HeaderCell>
          <Cell dataKey="company" />
        </Column>

        <Column width={200}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>

        <Column width={200}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>

        <Column width={200}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>

        <Column width={200}>
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
