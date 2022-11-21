### Custom column

<!--start-code-->

```js
const data = mockUsers(20);

const CustomColumn = React.forwardRef((props, ref) => {
  return <Column ref={ref} sortable align="center" flexGrow={1} fullText {...props} />;
});

const App = () => {
  return (
    <Table height={400} data={data}>
      <CustomColumn align="left">
        <HeaderCell>Id</HeaderCell>
        <Cell dataKey="id" />
      </CustomColumn>

      <CustomColumn fixed>
        <HeaderCell>First Name</HeaderCell>
        <Cell dataKey="firstName" />
      </CustomColumn>

      <CustomColumn>
        <HeaderCell>Last Name</HeaderCell>
        <Cell dataKey="lastName" />
      </CustomColumn>

      <CustomColumn>
        <HeaderCell>City</HeaderCell>
        <Cell dataKey="city" />
      </CustomColumn>

      <Column flexGrow={2}>
        <HeaderCell>
          Company <code>flexGrow={2}</code>
        </HeaderCell>
        <Cell dataKey="company" />
      </Column>
    </Table>
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->
