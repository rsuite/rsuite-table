<br>
> 树型表格，主要为了展示数据的的结构关系，需要在 `Table` 组件上设置一个 `isTree` 属性，同时 `data` 中的数据需要通过 `children` 来定义关系结构

```html
 <Table  height={400} data={data} isTree expand>
 ...
 ```
这里 `expand` 是设置默认站所有节点

`data` 中的数据结构：

```js
[{
    labelName: '汽车',
    status: 'ENABLED',
    children: [
        {
            labelName: '梅赛德斯-奔驰',
            status: 'ENABLED',
            count: 460
        }
        ...
    ]
    ...
}]
```



