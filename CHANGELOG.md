# 3.0.2

> 2018-6-10

- Support `bodyRef` on `<Table>` ([#23])
- When the height of the content is updated, reset the scroll bar position ([#22])

[23]: https://github.com/rsuite/rsuite-table/pull/23
[22]: https://github.com/rsuite/rsuite-table/pull/22

# 3.0.1

- Update shouldComponentUpdate check

# 2.0.1

- 修复多个 bug
- 修改 renderTreeToggle
- 支持 `bordered` 属性
- 支持 `treeToggle` 和 `treeToggleBy` 属性
- 支持 touch events
- `<Column>` 支持 `colSpan` 属性, 可以合并列单元格
- Scrollbar 支持点击滚动到指定位置
- 更新 `rsuite-theme`, 解决分页按钮禁用样式问题

# 2.0.0

- 升级 React 版本 15.\* ,同时兼容 0.14.9 版本
- 删除 Minxin, 改用高阶组件
- 改进表格许多性能问题
- 添加了对 `loading` 状态的支持
- 添加了 `编辑的表格` 的示例

# 1.1.11

- 自定义滚动条代替系统原生滚动，大幅提高了滚动表格时候的性能

# 1.1.8

- Column 设置默认宽度为 100
- 修复，在 Column 是 null 时候报错
- 修复，在动态列时候 flexGrow 值无效
