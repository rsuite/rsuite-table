### Fill height

<!--start-code-->

```js
const App = () => {
  const [height, setheight] = React.useState(500);
  const handleChange = event => {
    const value = parseInt(event.target.value);
    setheight(value);
  };

  const data = fakeData.filter((item, index) => index < 50);
  return (
    <div>
      container height: <input type="text" onChange={handleChange} value={height} />
      <hr />
      <div style={{ border: '1px solid red', height }}>
        <Table
          height={400}
          fillHeight
          data={data}
          onRowClick={data => {
            console.log(data);
          }}
        >
          <Column width={70} align="center">
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={130}>
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
    </div>
  );
};
ReactDOM.render(<App />);
```

<!--end-code-->
