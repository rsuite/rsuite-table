<br>
> 根据不同的业务场景，单元格中可以自己定义显示的内容，比如显示一张图片，比如你要添加一个几个按钮，或者显示一个文本框，都是可以自定义的，只需要把 `Cell` 组件重新自定义一下就行。


比如，显示一个图片，定义一个 `ImageCell` 组件：
```js
const ImageCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        <img src={rowData[dataKey]} width="50" />
    </Cell>
);
```
用的时候：

```html
<Column width={200} >
    <HeaderCell>Avartar</HeaderCell>
    <ImageCell dataKey="avartar" />
</Column>
```
比如，要格式化日期，就定义一个 `DateCell` 组件：
```js
const DateCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        {rowData[dataKey].toLocaleString()}
    </Cell>
);
```
用的时候：
```html
<Column width={200} >
    <HeaderCell>Action</HeaderCell>
    <DateCell dataKey="date" />
</Column>
```
