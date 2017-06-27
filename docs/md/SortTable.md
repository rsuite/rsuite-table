<br>
> 在需要排序的列 `<Column>` 设置一个 `sortable` 属性。
> 同时在 `<Table>` 定义一个 `onSortColumn` 回调函数，点击列头排序图标的时候，会触发该方法，并返回 `sortColumn` 和 `sortType`。


```html

<Table
  onSortColumn={(sortColumn, sortType)=>{
    console.log(sortColumn, sortType);
  }}
  >

  <Column width={50}  sortable>
      <HeaderCell>Id</HeaderCell>
      <Cell dataKey="id" />
  </Column>

  <Column width={130} sortable >
      <HeaderCell>First Name</HeaderCell>
      <Cell dataKey="firstName" />
  </Column>

...
```
