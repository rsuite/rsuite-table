<br>
> 如果需要把某列设置为自动宽度，需要配置 `flexGrow` 属性。 `flexGrow` 是 `number` 类型。会按照所有 `flexGrow` 总和比例撑满 `<Table>` 剩下的宽度。

> 注意: 设置 `flexGrow` 以后，就不能设置 `width`。

```html
<Column flexGrow={1}>
  <HeaderCell>City <code>flexGrow={1}</code></HeaderCell>
  <Cell dataKey="city" />
</Column>

<Column flexGrow={2}>
  <HeaderCell>Company Name <code>flexGrow={2}</code></HeaderCell>
  <Cell dataKey="companyName" />
</Column>

...
```
