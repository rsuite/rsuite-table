### Loading

<!--start-code-->

```js
const fakeData = mockUsers(20);

const App = () => {
  const [data, setData] = React.useState(fakeData);
  const [loading, setLoading] = React.useState(true);
  const [customLoader, setCustomLoader] = React.useState(false);
  const [usePlaceholder, setUsePlaceholder] = React.useState(false);
  const [loadAnimation, setLoadAnimation] = React.useState(false);

  const renderLoading = () => {
    if (usePlaceholder) {
      return (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: '#fff',
            padding: 20,
            zIndex: 1
          }}
        >
          <Placeholder.Grid rows={20} columns={6} active />
        </div>
      );
    }

    return <Loader center backdrop content="Custom Loader" />;
  };

  return (
    <div>
      <HStack spacing={10} divider={<Divider vertical />}>
        <Checkbox
          checked={loading}
          onChange={() => {
            setLoading(!loading);
          }}
        >
          Loading
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
          checked={usePlaceholder}
          onChange={() => {
            setUsePlaceholder(!usePlaceholder);
          }}
        >
          Use a placeholder
        </Checkbox>
        <Checkbox
          checked={loadAnimation}
          onChange={() => {
            setLoadAnimation(!loadAnimation);
          }}
        >
          loadAnimation
        </Checkbox>
      </HStack>
      <hr />

      <Table
        loading={loading}
        height={500}
        data={data}
        loadAnimation={loadAnimation}
        renderLoading={customLoader || usePlaceholder ? renderLoading : null}
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
