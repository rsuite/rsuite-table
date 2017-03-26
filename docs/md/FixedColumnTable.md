<br>
> 表头是默认固定的，只需要配置需要固定的列, 在需要估计的列添加 `fixed` 属性

```html
<Column width={50}  align="center"  fixed>
    <HeaderCell>Id</HeaderCell>
    <Cell dataKey="id" />
</Column>

<Column width={130} fixed  sortable>
    <HeaderCell>First Name</HeaderCell>
    <Cell dataKey="firstName" />
</Column>

...
```
