<br>

> 在某些情况下，需要合并列来组织数据之间的关系，可以在 `<Column>` 组件上设置一个 `colSpan` 属性，例如：

```html
<Column width={130} colSpan={2} >
  <HeaderCell>Name</HeaderCell>
  <Cell dataKey="firstName" />
</Column>

<Column width={130}  >
  <HeaderCell />
  <Cell dataKey="lastName" />
</Column>
```

> 当 `lastName` 对应列的值为 `null` 或者 `undefined` 的时候，则会被 `firstName` 列合并。
> 注意，如果想要合并列头（`HeaderCell`）, 在被合并的列头不要设置 `children`。
