
## API

### `<Table>`

| Name             | Type                                      | Default | Description                                                  |
| ---------------- | ----------------------------------------- | ------- | ------------------------------------------------------------ |
| bordered         | boolean                                   |         | 显示边框线                                                   |
| data             | Array                                     |         | 表格数据                                                     |
| disabledScroll   | boolean                                   |         | 禁用滚动                                                     |
| expand           | boolean                                   |         | 展开所有节点，`isTree`为 `tree` 时，该属性有效               |
| headerHeight     | number                                    | 36      | 表头高度                                                     |
| height           | number                                    | 200     | 高度                                                         |
| isTree           | boolean                                   |         | 是否展示为树表格                                             |
| loading          | boolean                                   |         | 显示 loading 状态                                            |
| locale           | object                                    |         | 本地化语言配置                                               |
| onExpandChange   | function(isOpen:boolean,rowData:object)   |         | 树形表格，在展开节点的回调函数                               |
| onRowClick       | function(rowData:object)                  |         | 行点击后的回调函数， 返回 `rowDate`                          |
| onScroll         | function(scrollX:object, scrollY:object)  |         | 滚动条滚动时候的回调函数                                     |
| onSortColumn     | function(dataKey:string, sortType:string) |         | 点击排序列的回调函数，返回 `sortColumn`, `sortType` 这两个值 |
| renderTreeToggle | (icon:node,rowData:object)=> node         |         | 树形表格，在展开节点的回调函数                               |
| rowClassName     | string ,(rowData:object)=>string          |         | 宽度                                                         |
| rowHeight        | number                                    | 36      | 行高                                                         |
| setRowHeight     | (rowData:object)=> number                 |         | 重新渲染行高                                                 |
| sortColumn       | string                                    |         | 排序列名称                                                   |
| sortType         | string                                    |         | 排序类型 ['desc', 'asc']                                     |
| width            | number                                    |         | 宽度                                                         |


<br>
> locale 的默认值是:
```js
{
  emptyMessage: 'No data found',
  loading: (
    <div>
      <i className="icon icon-cog icon-lg icon-spin" />
      <span>Loading...</span>
    </div>
  )
}
```

<br>
###  `<Column>`

| Name      | Type                                           | Default | Description                                                                           |
| --------- | ---------------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| align     | string                                         |         | 对齐方式 ['left', 'center', 'right']                                                  |
| colSpan   | number                                         |         | 合并列单元格，当被合并列的 `dataKey` 对应的值为 `null` 或者 `undefined`时，才会合并。 |
| fixed     | bool                                           |         | 固定列                                                                                |
| flexGrow  | number                                         |         | 设置列宽自动调节的比例，当设置了 `flexGrow` 就不能设置 `resizable` 与 `width` 属性    |
| minWidth  | number                                         | 200     | 当使用了 `flexGrow` 以后，可以通过 `minWidth` 设置一个最小宽度                        |
| onResize  | (columnWidth: number, dataKey: string) => void |         | 列宽改变后的回调函数                                                                  |
| resizable | bool                                           |         | 可自定义调整列宽                                                                      |
| sortable  | bool                                           |         | 可排序                                                                                |
| width     | number                                         |         | 列宽                                                                                  |


<br>
> `sortable` 是用来定义该列是否可排序，但是根据什么 `key` 排序需要 在 `Cell` 设置一个 `dataKey`
> 这里的排序是服务端排序，所以需要在 `<Table>` 的 `onSortColumn` 回调函数中处理逻辑，回调函数会返回 `sortColumn`, `sortType` 这两个值。

<br>
###  `<Cell>`

| Name     | Type   | Default | Description                             |
| -------- | ------ | ------- | --------------------------------------- |
| dataKey  | string |         | 数据绑定的 `key` ，同时也是排序的 `key` |
| rowData  | object |         | 行数据                                  |
| rowIndex | number |         | 行号                                    |

