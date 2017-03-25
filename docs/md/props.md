 

#### `<Table>`
 
Name | Type | Default | Description |
---- | ---- | ------- | ----------- |
data `isRequired` | Array |  |  表格数据 
width | number | | 宽度 
height | number | 200 | 高度 
rowHeight | number | 36 | 行高 
headerHeight | number | 36 | 表头高度 
isTree | bool | | 是否展示为树表格
expand | bool | | 展开所有节点，`isTree`为 `tree` 时，改值有效
locale | object |  | 本地化语言配置
sortColumn | string |  | 排序列名称
sortType | string |  | 排序类型  ['desc', 'asc']
onRowClick | func  |  | 行点击后的回调函数
onSortColumn | func  |  | 点击排序列的回调函数

####  `<Column>`

Name | Type | Default | Description |
---- | ---- | ------- | ----------- |
align | string |  |  对齐方式 ['left', 'center', 'right']
width | number | | 列宽 
fixed | bool |  | 锁定列 
resizable | bool |  | 可自定义调整列宽 
sortable | bool |  | 可排序 

####  `<Cell>`

Name | Type | Default | Description |
---- | ---- | ------- | ----------- |
dataKey | string |  |  数据绑定的 `key` 
align | string |  |  对齐方式 ['left', 'center', 'right']
rowData | object |  | 行数据 
rowIndex | number |  | 行号 
