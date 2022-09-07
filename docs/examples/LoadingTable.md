### Loading

<!--start-code-->

```js
const App = () => {
  const [data, setData] = React.useState(fakeData);
  const [loading, setLoading] = React.useState(true);
  return (
    <div>
      <input
        type="checkbox"
        checked={loading}
        onChange={() => {
          setLoading(!loading);
        }}
      />{' '}
      loading
      <Table loading={loading} height={400} data={data}>
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
  );
};

ReactDOM.render(<App />);
```

<!--end-code-->

> 当数据在异步获取中，需要在显示一个 `loading` 状态, 只需要在 `<Table>` 上设置 `loading` 属性就行
