<br>
> 表格分页是一个很常用的功能，主要是为了可以控制每一次服务端返回的数据量，所以这里的分页需要和你的服务端返回的数据配合。 当前示例中因为没有走后端，数据是写死的。

自定义显示回调函数，格式化显示多少行，以及显示总条目数的信息，定义好以后，配置给 `TablePagination` 组件
```js
function formatLengthMenu(lengthMenu) {
    return (
        <div className="table-length">
            <span> 每页 </span>
            {lengthMenu}
            <span> 条 </span>
        </div>
    );
}

function formatInfo(total, activePage) {
    return (
        <span>共 <i>{total}</i> 条数据</span>
    );
}
```
```html
<TablePagination
    formatLengthMenu={formatLengthMenu}
    formatInfo={formatInfo}
    displayLength={100}
    total={500}
    onChangePage={this.handleChangePage}
    onChangeLength={this.handleChangeLength}
/>
```
- `formatLengthMenu` 格式化显示行数；
- `formatInfo`  格式化显示总条目信息；
- `displayLength` 默认显示多少行数据，可以通过 `state` 管理；
- `total` 它不是当前返回数据的行数，他是所有数据的总条目数，这个需要后端 `API` 的返回，通过这个值与 `displayLength`，才能计算出表格分多少页。可以通过 `state` 管理；
- `onChangePage` 切换分页的回调函数；
- `onChangeLength` 切换显示条目数的回调函数。

