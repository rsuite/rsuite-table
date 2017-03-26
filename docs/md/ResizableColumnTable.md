<br>
> 把鼠标移动到列分割线的时候，会显示出一个蓝色的移动手柄，点击左右拖动就可以调整列的宽度，要支持该功能，需要在 `Column` 设置一个 `resizable` 属性

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
